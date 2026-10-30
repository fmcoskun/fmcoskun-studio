import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { showcaseConfig } from '../../config/showcaseConfig';
import type { ShowcaseSceneProps } from '../ShowcaseCanvas';
import { AccentNode, EllipseLine, FacetedCore, SceneFloor } from './parts';

const { contact, tiers } = showcaseConfig;

/** Contact: the hero orbit motif reduced to one core, one ring and one travelling node. */
export function ContactOrbitScene({ animate, tier, startTime = 0 }: ShowcaseSceneProps) {
  const core = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const node = useRef<Group>(null);
  const elapsed = useRef(startTime);
  const { ring, halo } = contact;

  const place = (time: number) => {
    if (core.current) core.current.rotation.y = time * contact.coreSpin;
    if (spin.current) spin.current.rotation.z = time * ring.spin;
    const angle = (time / contact.period) * Math.PI * 2;
    node.current?.position.set(Math.cos(angle) * ring.radiusX, Math.sin(angle) * ring.radiusY, 0);
  };

  useFrame((_, delta) => {
    if (animate) elapsed.current += Math.min(delta, 0.1);
    place(elapsed.current);
  });

  const segments = tiers[tier].ringSegments;
  return (
    <>
      <group ref={core}>
        <FacetedCore radius={contact.coreRadius} />
      </group>
      <group rotation={[ring.tilt[0], ring.tilt[1], ring.tilt[2]]}>
        <group ref={spin}>
          <EllipseLine radiusX={ring.radiusX} radiusY={ring.radiusY} segments={segments} opacity={ring.opacity} />
          <group ref={node}>
            <AccentNode size={contact.nodeSize} />
          </group>
        </group>
      </group>
      <group rotation={[halo.tilt[0], halo.tilt[1], halo.tilt[2]]}>
        <EllipseLine radiusX={halo.radiusX} radiusY={halo.radiusY} segments={segments} opacity={halo.opacity} />
      </group>
      <SceneFloor radius={contact.floorRadius} y={contact.floorY} />
    </>
  );
}
