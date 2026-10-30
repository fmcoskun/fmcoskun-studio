import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, EllipseCurve, LineBasicMaterial, LineLoop, Vector3, type Group } from 'three';
import { sceneConfig, type RingConfig } from '../config/sceneConfig';
import { OrbitingNodes } from './OrbitingNodes';

interface OrbitalRingProps {
  ring: RingConfig;
  segments: number;
  animate: boolean;
}

export function OrbitalRing({ ring, segments, animate }: OrbitalRingProps) {
  const spin = useRef<Group>(null);

  // Built imperatively: JSX <line> collides with the SVG element type, and a
  // LineLoop avoids the duplicated closing vertex.
  const loop = useMemo(() => {
    const curve = new EllipseCurve(0, 0, ring.radiusX, ring.radiusY, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(segments - 1).map((p) => new Vector3(p.x, p.y, 0));
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({
      color: sceneConfig.colors.accent,
      transparent: true,
      opacity: ring.opacity,
      depthWrite: false,
      toneMapped: false,
    });
    return new LineLoop(geometry, material);
  }, [ring, segments]);

  // <primitive> objects are not disposed by R3F.
  useEffect(
    () => () => {
      loop.geometry.dispose();
      (loop.material as LineBasicMaterial).dispose();
    },
    [loop],
  );

  useFrame((_, delta) => {
    if (animate && spin.current) spin.current.rotation.z += Math.min(delta, 0.1) * ring.spin;
  });

  return (
    <group rotation={[ring.tilt[0], ring.tilt[1], ring.tilt[2]]}>
      <group ref={spin}>
        <primitive object={loop} />
        <OrbitingNodes ring={ring} animate={animate} />
      </group>
    </group>
  );
}
