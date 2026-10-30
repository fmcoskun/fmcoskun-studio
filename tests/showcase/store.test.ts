import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createShowcaseStore } from '../../src/features/showcase/showcaseStore.ts';

const entry = (id: string) => ({
  id,
  scene: 'signal-board' as const,
  element: {} as HTMLElement,
  hover: { current: false },
  revealed: false,
});

test('register exposes the slot and keeps a stable snapshot', () => {
  const store = createShowcaseStore();
  store.register(entry('a'));
  assert.equal(store.getSlots().length, 1);
  assert.equal(store.getSlots(), store.getSlots());
});

test('unregister removes the slot and notifies subscribers', () => {
  const store = createShowcaseStore();
  let calls = 0;
  store.subscribe(() => calls++);
  const off = store.register(entry('a'));
  const before = calls;
  off();
  assert.equal(store.getSlots().length, 0);
  assert.ok(calls > before);
});

test('failed status is sticky', () => {
  const store = createShowcaseStore();
  assert.equal(store.getStatus(), 'idle');
  store.setStatus('failed');
  store.setStatus('ready');
  assert.equal(store.getStatus(), 'failed');
});

test('setRendered exposes rendered scenes with a stable snapshot', () => {
  const store = createShowcaseStore();
  assert.deepEqual(store.getRendered(), []);
  store.setRendered(['contact-orbit']);
  assert.deepEqual(store.getRendered(), ['contact-orbit']);
  assert.equal(store.getRendered(), store.getRendered());
});

test('re-registering the same id replaces the entry (reveal updates)', () => {
  const store = createShowcaseStore();
  store.register(entry('a'));
  store.register({ ...entry('a'), revealed: true });
  assert.equal(store.getSlots().length, 1);
  assert.equal(store.getSlots()[0]?.revealed, true);
});
