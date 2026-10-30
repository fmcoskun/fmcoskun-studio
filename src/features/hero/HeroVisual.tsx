import { lazy, Suspense, useState } from 'react';
import { useIdleMount } from '../../hooks/useIdleMount';
import { isWebGLAvailable } from '../../three/utils/webgl';
import { OrbitFallback } from './OrbitFallback';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import styles from './HeroVisual.module.css';

// three + R3F + drei live in this async chunk; the hero text never waits for it.
const SceneCanvas = lazy(() => import('../../three/SceneCanvas'));

export function HeroVisual() {
  const [supported] = useState(isWebGLAvailable);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const idle = useIdleMount();

  const use3D = supported && !failed;

  return (
    <div className={styles.stage} aria-hidden="true">
      {/* The SVG composition doubles as loading state and permanent fallback,
          so the hero never shows an empty box or a layout jump. */}
      <OrbitFallback hidden={use3D && ready} />
      {use3D && idle && (
        <SceneErrorBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <div className={styles.scene} data-ready={ready}>
              <SceneCanvas onReady={() => setReady(true)} onFailure={() => setFailed(true)} />
            </div>
          </Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  );
}
