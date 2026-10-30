import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery';
import { useInView } from '../hooks/useInView';
import { sceneConfig } from './config/sceneConfig';
import { useScenePerformance } from './hooks/useScenePerformance';
import { OrbitScene } from './scenes/OrbitScene';
import styles from './SceneCanvas.module.css';

export interface SceneCanvasProps {
  /** First frame is about to render — the CSS placeholder can fade out. */
  onReady: () => void;
  /** Context lost / unrecoverable — parent swaps to the CSS fallback. */
  onFailure: () => void;
}

const { camera } = sceneConfig;

/** Lazy-loaded entry point (default export for React.lazy). One canvas for the whole scene. */
export default function SceneCanvas({ onReady, onFailure }: SceneCanvasProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const { profile, degrade, lowest } = useScenePerformance();
  const visible = useInView(wrapper, { rootMargin: '120px 0px' });
  const detach = useRef<(() => void) | null>(null);

  useEffect(() => () => detach.current?.(), []);

  // Off-screen: stop the loop entirely. Reduced motion: render only on change.
  const frameloop = !visible ? 'never' : reduced ? 'demand' : 'always';

  return (
    <div ref={wrapper} className={styles.wrapper} aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={[1, profile.maxDpr]}
        camera={{
          fov: camera.fov,
          near: camera.near,
          far: camera.far,
          position: [camera.position[0], camera.position[1], camera.position[2]],
        }}
        gl={{
          antialias: profile.antialias,
          alpha: true,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          const canvas = gl.domElement;
          canvas.setAttribute('role', 'presentation');
          const onLost = (event: Event) => {
            // preventDefault allows a restore, but rebuilding every GPU resource is not
            // worth it for decoration — swap to the CSS fallback instead.
            event.preventDefault();
            onFailure();
          };
          canvas.addEventListener('webglcontextlost', onLost, false);
          detach.current = () => canvas.removeEventListener('webglcontextlost', onLost, false);
          onReady();
        }}
      >
        {/* Sustained low FPS steps the tier down (fewer particles, lower DPR, no streams). */}
        <PerformanceMonitor onDecline={degrade} onFallback={lowest} flipflops={3} />
        <OrbitScene profile={profile} animate={!reduced} interactive={finePointer} />
      </Canvas>
    </div>
  );
}
