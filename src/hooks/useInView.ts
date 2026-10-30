import { useEffect, useState, type RefObject } from 'react';

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
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return inView;
}
