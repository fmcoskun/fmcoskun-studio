import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, BoxGeometry, BufferAttribute, DynamicDrawUsage, type Group, type LineBasicMaterial, type MeshBasicMaterial } from 'three';
import { showcaseConfig } from '../../config/showcaseConfig';
import type { ShowcaseSceneProps } from '../ShowcaseCanvas';
import { dampTowards, morphWeights, rayToConvex, type Plane } from '../timeline';
import { BodyMaterial, SceneFloor } from './parts';

const { motion, colors, tiers } = showcaseConfig;

const CUBE: readonly Plane[] = [
  [1, 0, 0, motion.cubeHalf], [-1, 0, 0, motion.cubeHalf],
  [0, 1, 0, motion.cubeHalf], [0, -1, 0, motion.cubeHalf],
  [0, 0, 1, motion.cubeHalf], [0, 0, -1, motion.cubeHalf],
];

/** Square pyramid as five planes: base plus four sides through the apex. */
function pyramidPlanes(): Plane[] {
  const { baseY, apexY, baseHalf } = motion.pyramid;
  const rise = apexY - baseY;
  const len = Math.hypot(rise, baseHalf);
  const ny = baseHalf / len;
  const nh = rise / len;
  const d = ny * apexY; // every side plane contains the apex (0, apexY, 0)
  return [
    [0, -1, 0, -baseY],
    [nh, ny, 0, d], [-nh, ny, 0, d], [0, ny, nh, d], [0, ny, -nh, d],
  ];
}
const PYRAMID = pyramidPlanes();

/**
 * One subdivided-box ("cube-sphere") topology; each vertex direction gets a
 * radius on cube, pyramid and sphere. Box grid lines sit exactly on the cube's
 * edges, the pyramid's base edges and its slanted edges (the x = ±z diagonals),
 * so both polyhedra stay crisp mid-morph.
 */
function createMorphTargets(samples: number) {
  const n = Math.max(4, Math.round(Math.sqrt(samples / 6)));
  const geometry = new BoxGeometry(2, 2, 2, n, n, n);
  const unit = geometry.getAttribute('position');
  const directions = new Float32Array(unit.count * 3);
  const radii = [new Float32Array(unit.count), new Float32Array(unit.count), new Float32Array(unit.count)] as const;
  for (let i = 0; i < unit.count; i++) {
    const len = Math.hypot(unit.getX(i), unit.getY(i), unit.getZ(i));
    const x = unit.getX(i) / len;
    const y = unit.getY(i) / len;
    const z = unit.getZ(i) / len;
    directions.set([x, y, z], i * 3);
    radii[0][i] = rayToConvex(x, y, z, CUBE);
    radii[1][i] = rayToConvex(x, y, z, PYRAMID);
    radii[2][i] = motion.sphereRadius;
  }
  const live = new BufferAttribute(Float32Array.from(unit.array), 3);
  live.setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', live);
  geometry.deleteAttribute('normal'); // flatShading derives facet normals in the shader
  return { geometry, directions, radii };
}

/** P/04: one form morphs cube → pyramid → sphere, moving into the 16:9, 9:16 and 1:1 frames. */
export function MotionKitScene({ animate, hover, tier, startTime = 0 }: ShowcaseSceneProps) {
  const form = useRef<Group>(null);
  const shadow = useRef<Group>(null);
  const frameMaterials = useRef<(LineBasicMaterial | null)[]>([]);
  const tabMaterials = useRef<(MeshBasicMaterial | null)[]>([]);
  const elapsed = useRef(startTime);
  const tempo = useRef(1);
  const samples = tiers[tier].morphSamples;

  const morph = useMemo(() => createMorphTargets(samples), [samples]);
  useEffect(() => () => morph.geometry.dispose(), [morph]);

  const update = (time: number, delta: number) => {
    const w = morphWeights(time, motion);
    const { directions, radii, geometry } = morph;
    const live = geometry.getAttribute('position') as BufferAttribute;
    const out = live.array as Float32Array;
    for (let i = 0; i < live.count; i++) {
      const r = w[0] * radii[0][i]! + w[1] * radii[1][i]! + w[2] * radii[2][i]!;
      out[i * 3] = directions[i * 3]! * r;
      out[i * 3 + 1] = directions[i * 3 + 1]! * r;
      out[i * 3 + 2] = directions[i * 3 + 2]! * r;
    }
    live.needsUpdate = true;
    geometry.computeBoundingSphere();

    // The form travels into the active frame and scales to its shorter side.
    let x = 0;
    let scale = 0;
    motion.frames.forEach((f, i) => {
      x += w[i]! * f.x;
      scale += w[i]! * Math.min(f.width, f.height) * motion.fit;
      const strength = w[i]!;
      const fm = frameMaterials.current[i];
      if (fm) fm.opacity = motion.frameOpacity.idle + (motion.frameOpacity.active - motion.frameOpacity.idle) * strength;
      const tm = tabMaterials.current[i];
      if (tm) tm.opacity = strength;
    });
    const g = form.current;
    if (g) {
      g.position.x = delta === 0 ? x : dampTowards(g.position.x, x, 8, delta);
      if (shadow.current) shadow.current.position.x = g.position.x;
      g.scale.setScalar(scale);
      g.rotation.y = time * motion.spin;
      g.rotation.x = 0.35;
    }
  };

  useLayoutEffect(() => update(elapsed.current, 0));

  useFrame((_, delta) => {
    if (animate) {
      tempo.current = dampTowards(tempo.current, hover.current ? motion.hoverTempo : 1, motion.hoverDamping, delta);
      elapsed.current += Math.min(delta, 0.1) * tempo.current;
    }
    update(elapsed.current, animate ? delta : 0);
  });

  return (
    <>
      {motion.frames.map((f, i) => (
        <group key={f.label} position={[f.x, 0, 0]}>
          <FrameRect width={f.width} height={f.height} materialRef={(m) => void (frameMaterials.current[i] = m)} />
          <mesh position={[-f.width / 2 + motion.tab.inset + motion.tab.width / 2, -f.height / 2 - motion.tab.inset, 0]}>
            <planeGeometry args={[motion.tab.width, motion.tab.height]} />
            <meshBasicMaterial ref={(m) => void (tabMaterials.current[i] = m)} color={colors.accent} transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Flat shading turns the shared topology into crisp cube / pyramid faces. */}
      <group ref={form}>
        <mesh geometry={morph.geometry}>
          <BodyMaterial />
        </mesh>
        {/* Back-face hull: an olive silhouette line that survives any morph state. */}
        <mesh geometry={morph.geometry} scale={motion.outlineScale}>
          <meshBasicMaterial color={colors.line} side={BackSide} toneMapped={false} />
        </mesh>
      </group>

      <group ref={shadow}>
        <SceneFloor radius={motion.floorRadius} y={motion.floorY} />
      </group>
    </>
  );
}

/** Rectangular frame outline; opacity driven from the scene via materialRef. */
function FrameRect({ width, height, materialRef }: { width: number; height: number; materialRef: (m: LineBasicMaterial | null) => void }) {
  const corners = useMemo(() => {
    const hw = width / 2;
    const hh = height / 2;
    return new Float32Array([-hw, -hh, 0, hw, -hh, 0, hw, -hh, 0, hw, hh, 0, hw, hh, 0, -hw, hh, 0, -hw, hh, 0, -hw, -hh, 0]);
  }, [width, height]);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[corners, 3]} />
      </bufferGeometry>
      <lineBasicMaterial ref={materialRef} color={colors.line} transparent toneMapped={false} />
    </lineSegments>
  );
}
