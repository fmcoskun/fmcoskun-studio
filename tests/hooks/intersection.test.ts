import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latestIntersection } from '../../src/hooks/intersection.ts';

test('uses the newest entry when one batch carries stale and fresh states', () => {
  // A jump right after observe(): Chrome queues the pre-scroll state first, then the real one.
  assert.equal(latestIntersection([{ isIntersecting: false }, { isIntersecting: true }]), true);
  assert.equal(latestIntersection([{ isIntersecting: true }, { isIntersecting: false }]), false);
});

test('single entry and empty batch', () => {
  assert.equal(latestIntersection([{ isIntersecting: true }]), true);
  assert.equal(latestIntersection([]), undefined);
});
