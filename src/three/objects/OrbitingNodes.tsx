import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Object3D, type InstancedMesh } from 'three';
import { sceneConfig, type RingConfig } from '../config/sceneConfig';

const { colors } = sceneConfig;
const dummy = new Object3D();

interface OrbitingNodesProps {
  ring: RingConfig;
  animate: boolean;
}

/**
 * All nodes of one ring in a single instanced draw call, positioned in the
 * ring's local plane so they inherit its tilt and spin for free.
 */
export function OrbitingNodes({ ring, animate }: OrbitingNodesProps) {
  const mesh = useRef<InstancedMesh>(null);
  const elapsed = useRef(0);
  const count = ring.nodes.length;

  const palette = useMemo(() => {
    const dim = new Color(colors.accentDim);
    const bright = new Color(colors.accent);
    const hot = new Color(colors.node);
    return ring.nodes.map((node) => {
      const c = dim.clone().lerp(bright, Math.min(1, node.intensity * 1.4));
      // Only the strongest nodes approach white-green; everything else stays muted.
      if (node.intensity > 0.8) c.lerp(hot, (node.intensity - 0.8) * 1.5);
      return c;
    });
  }, [ring.nodes]);

  const place = (time: number) => {
    const m = mesh.current;
    if (!m) return;
    ring.nodes.forEach((node, i) => {
      const angle = node.phase + time * node.speed;
      dummy.position.set(Math.cos(angle) * ring.radiusX, Math.sin(angle) * ring.radiusY, 0);
      dummy.scale.setScalar(node.size);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  };

  // Initial placement + colours before first paint (matters for the static, reduced-motion frame).
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    palette.forEach((c, i) => m.setColorAt(i, c));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    place(0);
  }, [palette]);

  useFrame((_, delta) => {
    if (!animate) return;
    elapsed.current += Math.min(delta, 0.1);
    place(elapsed.current);
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 20, 14]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
