import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useFinePointer } from '../../hooks/useMediaQuery';
import type { ShowcaseSceneId } from '../../types';
import { ShowcaseFallback } from './ShowcaseFallback';
import { showcaseStore } from './showcaseStore';
import { useShowcaseRendered, useShowcaseStatus } from './useShowcase';
import styles from './ShowcaseSlot.module.css';

interface ShowcaseSlotProps {
  scene: ShowcaseSceneId;
  /** Element whose mouse hover livens the scene (e.g. the whole card). */
  hoverRef?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * DOM box a showcase scene is drawn into by the shared canvas. Shows the SVG
 * sketch until the 3D frame is up, and permanently if WebGL is unavailable.
 */
export function ShowcaseSlot({ scene, hoverRef, className }: ShowcaseSlotProps) {
  const box = useRef<HTMLDivElement>(null);
  const hover = useRef(false);
  const id = useId();
  const finePointer = useFinePointer();
  const status = useShowcaseStatus();
  const rendered = useShowcaseRendered();
  const revealed = useRevealed(box);
  const ready = status === 'ready' && revealed && rendered.includes(scene);

  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return;
    return showcaseStore.register({ id, scene, element, hover, revealed });
  }, [id, scene, revealed]);

  useEffect(() => {
    const target = hoverRef?.current;
    hover.current = false;
    if (!target || !finePointer) return;
    const enter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') hover.current = true;
    };
    const leave = () => {
      hover.current = false;
    };
    target.addEventListener('pointerenter', enter);
    target.addEventListener('pointerleave', leave);
    target.addEventListener('pointercancel', leave);
    return () => {
      target.removeEventListener('pointerenter', enter);
      target.removeEventListener('pointerleave', leave);
      target.removeEventListener('pointercancel', leave);
      hover.current = false;
    };
  }, [hoverRef, finePointer]);

  return (
    <div
      ref={box}
      className={[styles.slot, className].filter(Boolean).join(' ')}
      data-showcase-slot={scene}
      data-ready={ready}
      aria-hidden="true"
    >
      <div className={styles.fallback}>
        <ShowcaseFallback scene={scene} />
      </div>
    </div>
  );
}

/**
 * True once the nearest Reveal ancestor (`[data-visible]`) is visible and its
 * transition has run; immediately when there is none or motion is reduced.
 */
function useRevealed(box: RefObject<HTMLElement | null>) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const host = box.current?.parentElement?.closest<HTMLElement>('[data-visible]');
    if (!host) {
      setRevealed(true);
      return;
    }
    let timer = 0;
    const settle = () => {
      if (host.dataset.visible !== 'true' || timer) return;
      const style = getComputedStyle(host);
      // First listed value is enough: Reveal animates opacity and transform together.
      const wait = (parseFloat(style.transitionDuration) + parseFloat(style.transitionDelay)) * 1000;
      timer = window.setTimeout(() => setRevealed(true), Number.isFinite(wait) ? wait : 0);
    };
    const observer = new MutationObserver(settle);
    observer.observe(host, { attributes: true, attributeFilter: ['data-visible'] });
    settle();
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [box]);

  return revealed;
}
