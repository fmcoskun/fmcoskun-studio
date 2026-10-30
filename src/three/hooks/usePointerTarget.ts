import { useEffect, useRef } from 'react';

/**
 * Normalised pointer position (-1..1) stored in a ref — never in React state —
 * so 120 Hz pointer events do not trigger re-renders. Consumed inside useFrame.
 * Listens on window because the hero text overlaps the canvas.
 */
export function usePointerTarget(enabled: boolean) {
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      target.current.x = 0;
      target.current.y = 0;
      return;
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  return target;
}
