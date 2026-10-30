import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Points } from 'three';
import { sceneConfig } from '../config/sceneConfig';
import { createDotTexture } from '../utils/geometry';
import { createRng } from '../utils/webgl';

const { particles, colors } = sceneConfig;

interface ParticleFieldProps {
  count: number;
  animate: boolean;
}

/** Sparse starfield in a spherical shell behind the system. Count follows the performance tier. */
export function ParticleField({ count, animate }: ParticleFieldProps) {
  const points = useRef<Points>(null);

  const positions = useMemo(() => {
    const rng = createRng(particles.seed);
    const out = new Float32Array(count * 3);
    const { innerRadius: r0, outerRadius: r1 } = particles;
    for (let i = 0; i < count; i++) {
      // Uniform direction on the sphere, radius biased outward for depth.
      const u = rng() * 2 - 1;
      const theta = rng() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = r0 + (r1 - r0) * Math.sqrt(rng());
      out[i * 3] = s * Math.cos(theta) * r;
      out[i * 3 + 1] = u * r * 0.7; // flatten vertically: fewer stars right above the headline
      out[i * 3 + 2] = s * Math.sin(theta) * r;
    }
    return out;
  }, [count]);

  const dot = useMemo(() => createDotTexture(32), []);
  useEffect(() => () => dot.dispose(), [dot]);

  useFrame((_, delta) => {
    if (animate && points.current) points.current.rotation.y += Math.min(delta, 0.1) * particles.rotationSpeed;
  });

  return (
    // key forces a fresh geometry when the tier changes the count (buffer size is fixed per geometry).
    <points ref={points} key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={dot}
        color={colors.star}
        size={particles.size}
        sizeAttenuation
        transparent
        opacity={particles.opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}
