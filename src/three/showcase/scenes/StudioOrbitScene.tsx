import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, type Group } from 'three';
import { showcaseConfig } from '../../config/showcaseConfig';
import type { ShowcaseSceneProps } from '../ShowcaseCanvas';
import { dampTowards } from '../timeline';
import { AccentNode, EllipseLine, FacetedCore, SceneFloor } from './parts';

const { studio, colors, tiers } = showcaseConfig;

/** Four L-shaped corner marks: the "viewport" the system is framed in. */
function createFrameCorners(halfWidth: number, halfHeight: number, arm: number) {
  const positions: number[] = [];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const x = sx * halfWidth;
      const y = sy * halfHeight;
      positions.push(x, y, 0, x - sx * arm, y, 0, x, y, 0, x, y - sy * arm, 0);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

/** P/01: the hero's orbital system in miniature, framed; hover turns it toward the viewer. */
export function StudioOrbitScene({ animate, hover, tier, startTime = 0 }: ShowcaseSceneProps) {
  const system = useRef<Group>(null);
  const core = useRef<Group>(null);
  const spins = useRef<(Group | null)[]>([]);
  const nodes = useRef<(Group | null)[]>([]);
  const elapsed = useRef(startTime);

  const frame = useMemo(() => createFrameCorners(studio.frame.halfWidth, studio.frame.halfHeight, studio.frame.arm), []);
  useEffect(() => () => frame.dispose(), [frame]);

  useFrame((_, delta) => {
    if (animate) elapsed.current += Math.min(delta, 0.1);
    const t = elapsed.current;
    if (core.current) core.current.rotation.y = t * studio.coreSpin;
    studio.rings.forEach((ring, i) => {
      const spin = spins.current[i];
      if (spin) spin.rotation.z = t * ring.spin;
      const angle = ring.phase + (t / studio.period) * Math.PI * 2;
      nodes.current[i]?.position.set(Math.cos(angle) * ring.radiusX, Math.sin(angle) * ring.radiusY, 0);
    });

    const g = system.current;
    if (g && animate) {
      const on = hover.current;
      g.rotation.y = dampTowards(g.rotation.y, on ? studio.hoverYaw : 0, studio.hoverDamping, delta);
      g.rotation.x = dampTowards(g.rotation.x, on ? studio.hoverPitch : 0, studio.hoverDamping, delta);
    }
  });

  const segments = tiers[tier].ringSegments;
  return (
    <>
      <lineSegments geometry={frame}>
        <lineBasicMaterial color={colors.line} transparent opacity={studio.frame.opacity} toneMapped={false} />
      </lineSegments>
      <group ref={system}>
        <group ref={core}>
          <FacetedCore radius={studio.coreRadius} detail={1} />
        </group>
        {studio.rings.map((ring, i) => (
          <group key={i} rotation={[ring.tilt[0], ring.tilt[1], ring.tilt[2]]}>
            <group ref={(el) => void (spins.current[i] = el)}>
              <EllipseLine radiusX={ring.radiusX} radiusY={ring.radiusY} segments={segments} opacity={ring.opacity} />
              <group ref={(el) => void (nodes.current[i] = el)}>
                <AccentNode size={studio.nodeSize} />
              </group>
            </group>
          </group>
        ))}
      </group>
      <SceneFloor radius={studio.floorRadius} y={studio.floorY} />
    </>
  );
}
