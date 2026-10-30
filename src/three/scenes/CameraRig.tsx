import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import { sceneConfig } from '../config/sceneConfig';

const { camera: cam, motion } = sceneConfig;

/** Distance that keeps the inner rings framed as the canvas aspect narrows. */
function distanceForAspect(aspect: number) {
  const [, , baseZ] = cam.position;
  if (aspect >= cam.narrowAspect) return baseZ;
  if (aspect >= 0.75) return MathUtils.mapLinear(aspect, 0.75, cam.narrowAspect, cam.narrowDistance, baseZ);
  return cam.portraitDistance;
}

/**
 * Responsive framing + a gentle scroll-linked dolly while the hero is on screen.
 * window.scrollY is read inside the frame loop — no scroll listener, no React state.
 */
export function CameraRig({ animate }: { animate: boolean }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const baseDistance = useMemo(() => distanceForAspect(size.width / Math.max(size.height, 1)), [size]);
  const baseY = cam.position[1];

  // Static placement (also the only placement when motion is reduced).
  useEffect(() => {
    camera.position.set(0, baseY, baseDistance);
    camera.lookAt(0, 0, 0);
    invalidate();
  }, [camera, baseDistance, baseY, invalidate]);

  useFrame((_, delta) => {
    if (!animate) return;
    const progress = MathUtils.clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
    const targetZ = baseDistance + progress * motion.scrollDolly;
    const targetY = baseY + progress * motion.scrollLift;
    const k = 1 - Math.exp(-motion.damping * Math.min(delta, 0.1));
    camera.position.z += (targetZ - camera.position.z) * k;
    camera.position.y += (targetY - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
