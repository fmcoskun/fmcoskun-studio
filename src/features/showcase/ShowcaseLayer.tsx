import { lazy, Suspense, useEffect, useState } from 'react';
import { useIdleMount } from '../../hooks/useIdleMount';
import { isWebGLAvailable } from '../../three/utils/webgl';
import { SceneErrorBoundary } from '../hero/SceneErrorBoundary';
import { showcaseStore } from './showcaseStore';
import { useShowcaseStatus } from './useShowcase';

// Second (and last) lazy 3D entry: Work + Contact scenes share one canvas.
const ShowcaseCanvas = lazy(() => import('../../three/showcase/ShowcaseCanvas'));

const SECTIONS = ['work', 'contact'] as const;

/** Flips to true (for good) once Work or Contact comes within `margin` of the viewport. */
function useNearSections(margin: string) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near) return;
    const targets = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: margin },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [near, margin]);
  return near;
}

export function ShowcaseLayer() {
  const [supported] = useState(isWebGLAvailable);
  const status = useShowcaseStatus();
  const idle = useIdleMount();
  const near = useNearSections('600px 0px');

  if (!supported || status === 'failed' || !idle || !near) return null;

  return (
    <SceneErrorBoundary onError={() => showcaseStore.setStatus('failed')}>
      <Suspense fallback={null}>
        <ShowcaseCanvas />
      </Suspense>
    </SceneErrorBoundary>
  );
}
