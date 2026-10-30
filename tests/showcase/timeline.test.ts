import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anomalyState, cyclePhase, dampTowards, inboxItem, morphWeights, rayToConvex } from '../../src/three/showcase/timeline.ts';

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

test('cyclePhase wraps into [0, 1)', () => {
  assert.equal(cyclePhase(12, 8), 0.5);
  assert.equal(cyclePhase(-2, 8), 0.75);
});

test('morphWeights sum to 1 and hold pure forms', () => {
  const o = { hold: 2, blend: 1 };
  for (let t = 0; t < 20; t += 0.37) {
    assert.ok(close(morphWeights(t, o).reduce((a, b) => a + b, 0), 1), `sum at t=${t}`);
  }
  assert.deepEqual(morphWeights(1, o), [1, 0, 0]);
  assert.deepEqual(morphWeights(4, o), [0, 1, 0]);
  assert.deepEqual(morphWeights(7, o), [0, 0, 1]);
  assert.deepEqual(morphWeights(10, o), [1, 0, 0]); // period 9
});

test('anomalyState flashes, gets caught, recovers', () => {
  const o = { period: 8, flashAt: 0.4, catchAt: 0.55, recoverAt: 0.8, nodeCount: 6 };
  assert.equal(anomalyState(1, o).alert, 0);
  assert.equal(anomalyState(8 * 0.55, o).alert, 1);
  assert.equal(anomalyState(8 * 0.6, o).caught, 1);
  assert.equal(anomalyState(8 * 0.9, o).alert, 0);
  assert.equal(anomalyState(8 * 0.9, o).caught, 0);
  assert.notEqual(anomalyState(1, o).nodeIndex, anomalyState(9, o).nodeIndex);
});

test('inboxItem splits progress at the prism', () => {
  const a = inboxItem(0.2, 0.4);
  const b = inboxItem(0.7, 0.4);
  assert.equal(a.side, 'in');
  assert.ok(close(a.local, 0.5));
  assert.equal(b.side, 'out');
  assert.ok(close(b.local, 0.5));
});

test('dampTowards clamps delta and converges', () => {
  assert.equal(dampTowards(0, 1, 2, 5), dampTowards(0, 1, 2, 0.1));
  let v = 0;
  for (let i = 0; i < 120; i++) v = dampTowards(v, 1, 6, 1 / 60);
  assert.ok(v > 0.99);
});

test('rayToConvex hits the nearest face of a convex solid', () => {
  // Unit cube: half-size 1 → planes |x|,|y|,|z| ≤ 1.
  const cube = [
    [1, 0, 0, 1], [-1, 0, 0, 1], [0, 1, 0, 1], [0, -1, 0, 1], [0, 0, 1, 1], [0, 0, -1, 1],
  ] as const;
  assert.ok(close(rayToConvex(1, 0, 0, cube), 1));
  const diag = Math.SQRT1_2;
  assert.ok(close(rayToConvex(diag, diag, 0, cube), Math.SQRT2)); // edge of the cube
  assert.equal(rayToConvex(0, 0, 0, cube), 0); // degenerate direction stays at the centre
});
