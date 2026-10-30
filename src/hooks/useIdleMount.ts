import { useEffect, useState } from 'react';

/**
 * Flips to true once the main thread is idle (or after `timeout` ms), so heavy,
 * non-essential work such as the WebGL scene does not compete with first paint.
 */
export function useIdleMount(timeout = 1200): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout });
      return () => window.cancelIdleCallback(id);
    }
    // Safari < 18 has no requestIdleCallback.
    const id = window.setTimeout(() => setReady(true), Math.min(timeout, 400));
    return () => window.clearTimeout(id);
  }, [timeout]);

  return ready;
}
