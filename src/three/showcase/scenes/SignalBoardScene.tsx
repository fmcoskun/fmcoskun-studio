import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CurvePath,
  EdgesGeometry,
  Float32BufferAttribute,
  LineCurve3,
  Object3D,
  Vector3,
  type InstancedMesh,
  type LineBasicMaterial,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import { showcaseConfig } from '../../config/showcaseConfig';
import type { ShowcaseSceneProps } from '../ShowcaseCanvas';
import { anomalyState, cyclePhase, dampTowards } from '../timeline';
import { BodyMaterial, SceneFloor } from './parts';

const { signal, colors, tiers } = showcaseConfig;
const dummy = new Object3D();
const tmp = new Vector3();
const lime = new Color(colors.accent);
const red = new Color(colors.alert);
const olive = new Color(colors.line);
const mixed = new Color();

/** Board grid (square, `divisions` cells per side) on the y = 0 plane. */
function createBoardGrid(half: number, divisions: number) {
  const positions: number[] = [];
  for (let i = 0; i <= divisions; i++) {
    const v = -half + (i / divisions) * half * 2;
    positions.push(v, 0, -half, v, 0, half, -half, 0, v, half, 0, v);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

/** Row strokes on the matrix's top face: the "single live view". */
function createMatrixRows(size: readonly [number, number, number], rows: number) {
  const [w, h, d] = size;
  const positions: number[] = [];
  for (let i = 0; i < rows; i++) {
    const z = -d / 2 + ((i + 1) / (rows + 1)) * d;
    const len = i % 2 ? 0.55 : 0.8; // uneven lengths read as data, not stripes
    positions.push(-w * 0.35, h / 2 + 0.002, z, -w * 0.35 + w * len * 0.7, h / 2 + 0.002, z);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

/** P/02: line data flows over an isometric floor into one matrix; anomalies get caught. */
export function SignalBoardScene({ animate, hover, tier, startTime = 0 }: ShowcaseSceneProps) {
  const packets = useRef<InstancedMesh>(null);
  const matrixEdges = useRef<LineBasicMaterial>(null);
  const ring = useRef<Mesh>(null);
  const ringMaterial = useRef<MeshBasicMaterial>(null);
  const elapsed = useRef(startTime);
  const tempo = useRef(1);
  const count = tiers[tier].signalPackets;
  const [mw, mh, md] = signal.matrix.size;

  const curves = useMemo(
    () =>
      signal.paths.map((points) => {
        const path = new CurvePath<Vector3>();
        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i]!;
          const b = points[i + 1]!;
          path.add(new LineCurve3(new Vector3(a[0], a[1], a[2]), new Vector3(b[0], b[1], b[2])));
        }
        return path;
      }),
    [],
  );

  const geometries = useMemo(() => {
    const pathPositions: number[] = [];
    for (const points of signal.paths) {
      for (let i = 0; i < points.length - 1; i++) pathPositions.push(...points[i]!, ...points[i + 1]!);
    }
    const paths = new BufferGeometry();
    paths.setAttribute('position', new Float32BufferAttribute(pathPositions, 3));
    const box = new BoxGeometry(mw, mh, md);
    const edges = new EdgesGeometry(box);
    box.dispose();
    return {
      grid: createBoardGrid(signal.board.half, signal.board.divisions),
      paths,
      edges,
      rows: createMatrixRows(signal.matrix.size, signal.matrix.rows),
    };
  }, [mw, mh, md]);

  useEffect(
    () => () => Object.values(geometries).forEach((g) => g.dispose()),
    [geometries],
  );

  const update = (time: number) => {
    const m = packets.current;
    if (!m) return;
    const { nodeIndex, alert, caught } = anomalyState(time, { period: signal.period, ...signal.anomaly, nodeCount: curves.length });

    for (let i = 0; i < count; i++) {
      const pathIndex = i % curves.length;
      const lap = Math.floor(i / curves.length);
      const lapsPerPath = Math.ceil(count / curves.length);
      const t = cyclePhase(time * signal.packetSpeed + lap / lapsPerPath + pathIndex * 0.13, 1);
      curves[pathIndex]!.getPointAt(t, tmp);
      const hot = pathIndex === nodeIndex ? alert : 0;
      dummy.position.set(tmp.x, signal.packetSize, tmp.z);
      dummy.scale.setScalar(signal.packetSize * (1 + hot * signal.alertScale));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, mixed.copy(lime).lerp(red, hot));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    // Alert ring sits on the misbehaving line's station.
    const station = signal.paths[nodeIndex]![0]!;
    ring.current?.position.set(station[0], 0.01, station[2]);
    if (ringMaterial.current) ringMaterial.current.opacity = alert * 0.8;
    ring.current?.scale.setScalar(signal.ringRadius * (1 + (1 - alert) * 0.4));
    // The matrix "catches" it: its outline pulses toward lime.
    if (matrixEdges.current) matrixEdges.current.color.copy(olive).lerp(lime, caught * signal.matrix.pulse * (0.5 + alert * 0.5));
  };

  // Seed a coherent still frame before the first paint (reduced motion / frozen time).
  useLayoutEffect(() => update(elapsed.current));

  useFrame((_, delta) => {
    if (animate) {
      tempo.current = dampTowards(tempo.current, hover.current ? signal.hoverTempo : 1, signal.hoverDamping, delta);
      elapsed.current += Math.min(delta, 0.1) * tempo.current;
    }
    update(elapsed.current);
  });

  return (
    <>
      <lineSegments geometry={geometries.grid}>
        <lineBasicMaterial color={colors.line} transparent opacity={signal.board.opacity} depthWrite={false} toneMapped={false} />
      </lineSegments>
      <lineSegments geometry={geometries.paths} position={[0, 0.005, 0]}>
        <lineBasicMaterial color={colors.line} transparent opacity={signal.pathOpacity} toneMapped={false} />
      </lineSegments>

      {signal.paths.map((points, i) => {
        const start = points[0]!;
        return (
          <mesh key={i} position={[start[0], signal.stationSize / 2, start[2]]}>
            <boxGeometry args={[signal.stationSize, signal.stationSize, signal.stationSize]} />
            <BodyMaterial />
          </mesh>
        );
      })}

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 40]} />
        <meshBasicMaterial ref={ringMaterial} color={colors.alert} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      <group position={[0, mh / 2, 0]}>
        <mesh>
          <boxGeometry args={[mw, mh, md]} />
          <BodyMaterial />
        </mesh>
        <lineSegments geometry={geometries.edges}>
          <lineBasicMaterial ref={matrixEdges} color={colors.line} toneMapped={false} />
        </lineSegments>
        <lineSegments geometry={geometries.rows}>
          <lineBasicMaterial color={colors.accent} toneMapped={false} />
        </lineSegments>
      </group>

      <instancedMesh ref={packets} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <SceneFloor radius={signal.floorRadius} y={0.002} />
    </>
  );
}
