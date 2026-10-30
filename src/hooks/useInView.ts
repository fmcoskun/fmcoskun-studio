import { useEffect, useState, type RefObject } from 'react';
import { latestIntersection } from './intersection';

interface Options {
  rootMargin?: string;
  threshold?: number;
  /** Stop observing after the first intersection. */
  once?: boolean;
}

export function useInView(ref: RefObject<Element | null>, { rootMargin = '0px', threshold = 0, once = false }: Options = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = latestIntersection(entries);
        if (visible === undefined) return;
        setInView(visible);
        if (visible && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return inView;
}
