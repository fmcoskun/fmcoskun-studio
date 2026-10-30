/**
 * Pure timing helpers for the showcase scenes. No imports on purpose: the file
 * runs unchanged under `node --test` (native TS type stripping), so keep it to
 * erasable syntax only — no enums, no parameter properties.
 */

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Position inside a repeating cycle, always in [0, 1) — negative time included. */
export function cyclePhase(time: number, period: number): number {
  return (((time % period) + period) % period) / period;
}

/** Frame-rate independent exponential approach; delta is clamped after tab switches. */
export function dampTowards(current: number, target: number, damping: number, delta: number): number {
  return current + (target - current) * (1 - Math.exp(-damping * Math.min(delta, 0.1)));
}

export interface AnomalyOptions {
  period: number;
  /** Cycle phases (0–1), strictly increasing. */
  flashAt: number;
  catchAt: number;
  recoverAt: number;
  nodeCount: number;
}

/**
 * One anomaly per cycle: the alert ramps up until the matrix catches it, then
 * fades back to normal. A different line misbehaves each cycle.
 */
export function anomalyState(time: number, o: AnomalyOptions): { nodeIndex: number; alert: number; caught: number } {
  const p = cyclePhase(time, o.period);
  const cycle = Math.floor(time / o.period);
  const nodeIndex = ((cycle % o.nodeCount) + o.nodeCount) % o.nodeCount;

  let alert = 0;
  if (p >= o.flashAt && p < o.catchAt) alert = smoothstep(o.flashAt, o.catchAt, p);
  else if (p >= o.catchAt && p < o.recoverAt) alert = 1 - smoothstep(o.catchAt, o.recoverAt, p);

  const caught = p >= o.catchAt && p < o.recoverAt ? 1 : 0;
  return { nodeIndex, alert, caught };
}

/**
 * Weights for cube → pyramid → sphere → cube. Each form holds `hold` seconds,
 * then blends into the next over `blend` seconds. Weights always sum to 1.
 */
export function morphWeights(time: number, o: { hold: number; blend: number }): readonly [number, number, number] {
  const step = o.hold + o.blend;
  const local = cyclePhase(time, step * 3) * step * 3;
  const index = Math.min(2, Math.floor(local / step));
  const within = local - index * step;
  const weights: [number, number, number] = [0, 0, 0];
  if (within < o.hold) {
    weights[index] = 1;
  } else {
    const k = smoothstep(0, 1, (within - o.hold) / o.blend);
    weights[index] = 1 - k;
    weights[(index + 1) % 3] = k;
  }
  return weights;
}

/** Splits an item's 0–1 journey into the chaotic inbound leg and the ordered outbound leg. */
export function inboxItem(progress: number, prismAt: number): { side: 'in' | 'out'; local: number } {
  return progress < prismAt
    ? { side: 'in', local: progress / prismAt }
    : { side: 'out', local: (progress - prismAt) / (1 - prismAt) };
}

/** Plane `n·p ≤ d` as [nx, ny, nz, d] with a unit normal. */
export type Plane = readonly [number, number, number, number];

/**
 * Distance from the origin along unit direction (dx, dy, dz) to the surface of
 * a convex solid that contains the origin. Used to project one sphere topology
 * onto cube and pyramid surfaces so all three forms share vertex order.
 */
export function rayToConvex(dx: number, dy: number, dz: number, planes: readonly Plane[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const [nx, ny, nz, d] of planes) {
    const along = nx * dx + ny * dy + nz * dz;
    if (along > 1e-9) best = Math.min(best, d / along);
  }
  return Number.isFinite(best) ? best : 0;
}
