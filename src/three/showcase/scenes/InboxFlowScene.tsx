import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  DynamicDrawUsage,
  EdgesGeometry,
  Euler,
  Float32BufferAttribute,
  Matrix4,
  Quaternion,
  Vector3,
  type InstancedMesh,
} from 'three';
import { showcaseConfig } from '../../config/showcaseConfig';
import { createRng } from '../../utils/webgl';
import type { ShowcaseSceneProps } from '../ShowcaseCanvas';
import { cyclePhase, dampTowards, inboxItem, smoothstep } from '../timeline';
import { SceneFloor } from './parts';

const { inbox, colors, tiers } = showcaseConfig;
const [ew, eh, ed] = inbox.envelope.size;
const [cw, ch, cd] = inbox.card.size;
const HIDDEN = new Matrix4().makeScale(0, 0, 0);

// Outline templates in local space (pairs of points), transformed per item each frame.
const ENVELOPE_OUTLINE = [
  [-ew / 2, -eh / 2], [ew / 2, -eh / 2],
  [ew / 2, -eh / 2], [ew / 2, eh / 2],
  [ew / 2, eh / 2], [-ew / 2, eh / 2],
  [-ew / 2, eh / 2], [-ew / 2, -eh / 2],
  [-ew / 2, eh / 2], [0, eh / 2 - eh * inbox.envelope.flapDepth],
  [0, eh / 2 - eh * inbox.envelope.flapDepth], [ew / 2, eh / 2],
].map(([x, y]) => new Vector3(x, y, ed / 2 + 0.002));
const CARD_OUTLINE = [
  [-cw / 2, -ch / 2], [cw / 2, -ch / 2],
  [cw / 2, -ch / 2], [cw / 2, ch / 2],
  [cw / 2, ch / 2], [-cw / 2, ch / 2],
  [-cw / 2, ch / 2], [-cw / 2, -ch / 2],
].map(([x, y]) => new Vector3(x, y, cd / 2 + 0.002));

interface Item {
  offset: number;
  from: Vector3;
  tilt: Euler;
  slot: Vector3;
}

const pos = new Vector3();
const scl = new Vector3();
const quat = new Quaternion();
const identity = new Quaternion();
const euler = new Euler();
const m4 = new Matrix4();
const v = new Vector3();

/** Writes `template` transformed by `matrix` into `out` starting at vertex `at`; returns the next index. */
function writeOutline(out: BufferAttribute, at: number, template: readonly Vector3[], matrix: Matrix4) {
  for (const p of template) {
    v.copy(p).applyMatrix4(matrix);
    out.setXYZ(at++, v.x, v.y, v.z);
  }
  return at;
}

/** P/03: scattered mail enters a prism and leaves as aligned task cards in three columns. */
export function InboxFlowScene({ animate, hover, tier, startTime = 0 }: ShowcaseSceneProps) {
  const envelopes = useRef<InstancedMesh>(null);
  const cards = useRef<InstancedMesh>(null);
  const elapsed = useRef(startTime);
  const tempo = useRef(1);
  const count = tiers[tier].inboxItems;

  const items = useMemo<Item[]>(() => {
    const rng = createRng(inbox.seed);
    const { scatter, columns } = inbox;
    const span = (r: readonly [number, number]) => r[0] + (r[1] - r[0]) * rng();
    return Array.from({ length: count }, (_, i) => ({
      offset: i / count,
      from: new Vector3(span(scatter.x), span(scatter.y), 0),
      tilt: new Euler((rng() - 0.5) * 0.3, (rng() * 2 - 1) * scatter.tiltY, (rng() * 2 - 1) * scatter.tiltZ),
      slot: new Vector3(columns.x[i % 3]!, columns.topY - Math.floor(i / 3) * columns.rowGap, 0),
    }));
  }, [count]);

  const geometries = useMemo(() => {
    const outlines = (n: number, template: readonly Vector3[]) => {
      const g = new BufferGeometry();
      const attr = new BufferAttribute(new Float32Array(n * template.length * 3), 3);
      attr.setUsage(DynamicDrawUsage);
      g.setAttribute('position', attr);
      return g;
    };
    const prismSource = new CylinderGeometry(inbox.prism.radius, inbox.prism.radius, inbox.prism.depth, 3);
    const prismEdges = new EdgesGeometry(prismSource);
    prismSource.dispose();

    const { columns, prism } = inbox;
    const flow: number[] = [inbox.scatter.x[1] + 0.3, 0, 0, prism.entryX, 0, 0];
    for (const x of columns.x) flow.push(prism.exitX, 0, 0, x - cw / 2 - 0.1, columns.topY - columns.rowGap, 0);
    for (const x of columns.x) flow.push(x, columns.guideTop, -0.05, x, columns.guideBottom, -0.05);
    const guides = new BufferGeometry();
    guides.setAttribute('position', new Float32BufferAttribute(flow, 3));

    return {
      envelopeLines: outlines(count, ENVELOPE_OUTLINE),
      cardLines: outlines(count, CARD_OUTLINE),
      prismEdges,
      guides,
    };
  }, [count]);

  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);

  const update = (time: number) => {
    const env = envelopes.current;
    const crd = cards.current;
    if (!env || !crd) return;
    const envLines = geometries.envelopeLines.getAttribute('position') as BufferAttribute;
    const cardLines = geometries.cardLines.getAttribute('position') as BufferAttribute;
    let ei = 0;
    let ci = 0;
    const { prism, envelope, outbound } = inbox;

    items.forEach((item, i) => {
      const { side, local } = inboxItem(cyclePhase(time / inbox.period + item.offset, 1), inbox.prismAt);
      if (side === 'in') {
        const e = smoothstep(0, 1, local);
        const appear = Math.min(1, local / 0.06);
        pos.copy(item.from).lerp(v.set(prism.entryX, 0, 0), e);
        euler.set(item.tilt.x * (1 - e), item.tilt.y * (1 - e), item.tilt.z * (1 - e));
        quat.setFromEuler(euler);
        scl.setScalar((1 - e * (1 - envelope.arrivalScale)) * appear * (local > 0.97 ? 0 : 1));
        m4.compose(pos, quat, scl);
        env.setMatrixAt(i, m4);
        crd.setMatrixAt(i, HIDDEN);
        ei = writeOutline(envLines, ei, ENVELOPE_OUTLINE, m4);
        ci = writeOutline(cardLines, ci, CARD_OUTLINE, HIDDEN);
      } else {
        const travel = smoothstep(0, outbound.travel, local);
        const grow = Math.min(1, local / 0.08);
        const shrink = local > outbound.fadeOut ? (1 - local) / (1 - outbound.fadeOut) : 1;
        pos.set(prism.exitX, 0, 0).lerp(item.slot, travel);
        scl.setScalar(grow * shrink);
        m4.compose(pos, identity, scl);
        crd.setMatrixAt(i, m4);
        env.setMatrixAt(i, HIDDEN);
        ci = writeOutline(cardLines, ci, CARD_OUTLINE, m4);
        ei = writeOutline(envLines, ei, ENVELOPE_OUTLINE, HIDDEN);
      }
    });

    env.instanceMatrix.needsUpdate = true;
    crd.instanceMatrix.needsUpdate = true;
    envLines.needsUpdate = true;
    cardLines.needsUpdate = true;
  };

  useLayoutEffect(() => update(elapsed.current));

  useFrame((_, delta) => {
    if (animate) {
      tempo.current = dampTowards(tempo.current, hover.current ? inbox.hoverTempo : 1, inbox.hoverDamping, delta);
      elapsed.current += Math.min(delta, 0.1) * tempo.current;
    }
    update(elapsed.current);
  });

  return (
    <>
      <lineSegments geometry={geometries.guides}>
        <lineBasicMaterial color={colors.line} transparent opacity={inbox.flowOpacity} depthWrite={false} toneMapped={false} />
      </lineSegments>

      {/* Triangle faces the viewer: cylinder axis along z, one vertex up. */}
      <group rotation={[0, inbox.prism.yaw, 0]}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[inbox.prism.radius, inbox.prism.radius, inbox.prism.depth, 3]} />
            <meshStandardMaterial color={colors.accent} transparent opacity={inbox.prism.opacity} depthWrite={false} roughness={0.4} />
          </mesh>
          <lineSegments geometry={geometries.prismEdges}>
            <lineBasicMaterial color={colors.line} toneMapped={false} />
          </lineSegments>
        </group>
      </group>

      <instancedMesh ref={envelopes} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[ew, eh, ed]} />
        <meshStandardMaterial color={colors.paper} roughness={0.8} />
      </instancedMesh>
      <lineSegments geometry={geometries.envelopeLines} frustumCulled={false}>
        <lineBasicMaterial color={colors.line} toneMapped={false} />
      </lineSegments>

      <instancedMesh ref={cards} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[cw, ch, cd]} />
        <meshBasicMaterial color={colors.accent} toneMapped={false} />
      </instancedMesh>
      <lineSegments geometry={geometries.cardLines} frustumCulled={false}>
        <lineBasicMaterial color={colors.line} toneMapped={false} />
      </lineSegments>

      <SceneFloor radius={inbox.floorRadius} y={inbox.floorY} />
    </>
  );
}
