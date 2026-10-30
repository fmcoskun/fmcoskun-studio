/**
 * Current intersection state from one IntersectionObserver batch (single target).
 * A batch can hold several entries for the same element — e.g. observe() followed
 * by an instant scroll before the first delivery queues the stale pre-scroll state
 * and then the real one. Only the newest entry is the truth. No imports: runs
 * under `node --test`.
 */
export function latestIntersection(entries: readonly Pick<IntersectionObserverEntry, 'isIntersecting'>[]): boolean | undefined {
  return entries.at(-1)?.isIntersecting;
}
