import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { sceneConfig, type TierProfile } from '../config/sceneConfig';
import { SceneLighting } from '../effects/SceneLighting';
import { usePointerTarget } from '../hooks/usePointerTarget';
import { CentralCore } from '../objects/CentralCore';
import { OrbitalRing } from '../objects/OrbitalRing';
import { ParticleField } from '../objects/ParticleField';
import { SignalStreams } from '../objects/SignalStreams';
import { CameraRig } from './CameraRig';

const { motion, rings } = sceneConfig;

interface OrbitSceneProps {
  profile: TierProfile;
  /** false under prefers-reduced-motion: a single coherent still frame. */
  animate: boolean;
  /** Pointer parallax only for fine pointers (mouse / trackpad). */
  interactive: boolean;
}

export function OrbitScene({ profile, animate, interactive }: OrbitSceneProps) {
  const parallax = useRef<Group>(null);
  const drift = useRef<Group>(null);
  const pointer = usePointerTarget(interactive && animate);

  useFrame((_, delta) => {
    if (!animate) return;
    const d = Math.min(delta, 0.1);
    const k = 1 - Math.exp(-motion.damping * d);

    // Parallax is clamped by design: the target never exceeds ±parallaxX/Y radians.
    const p = parallax.current;
    if (p) {
      p.rotation.x += (pointer.current.y * motion.parallaxX - p.rotation.x) * k;
      p.rotation.y += (pointer.current.x * motion.parallaxY - p.rotation.y) * k;
    }
    if (drift.current) drift.current.rotation.y += d * motion.systemDrift;
  });

  return (
    <>
      <SceneLighting />
      <CameraRig animate={animate} />

      <group ref={parallax}>
        <group ref={drift}>
          <CentralCore animate={animate} showGrid={profile.coreGrid} />
          {rings.map((ring, i) => (
            <OrbitalRing key={i} ring={ring} segments={profile.ringSegments} animate={animate} />
          ))}
          {profile.streams && <SignalStreams pulsesPerStream={profile.pulsesPerStream} animate={animate} />}
        </group>
      </group>

      <ParticleField count={profile.particles} animate={animate} />
    </>
  );
}
