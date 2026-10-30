import type { ShowcaseSceneId } from '../../types';

/**
 * Tiny external store shared by the DOM slots (main bundle) and the lazy 3D
 * canvas. No React or three imports, so it costs nothing before 3D loads.
 */

export interface ShowcaseSlotEntry {
  id: string;
  scene: ShowcaseSceneId;
  element: HTMLElement;
  /** Written by pointer listeners, read inside useFrame. */
  hover: { current: boolean };
  /**
   * The slot's Reveal entrance has finished. The fixed canvas cannot follow CSS
   * opacity, so a scene drawn earlier would float over a still-transparent card.
   */
  revealed: boolean;
}

export type ShowcaseStatus = 'idle' | 'ready' | 'failed';

export interface ShowcaseStore {
  register(entry: ShowcaseSlotEntry): () => void;
  getSlots(): readonly ShowcaseSlotEntry[];
  setStatus(status: ShowcaseStatus): void;
  getStatus(): ShowcaseStatus;
  /** Scene ids the loaded canvas actually draws; their slots may hide the SVG. */
  setRendered(scenes: readonly ShowcaseSceneId[]): void;
  getRendered(): readonly ShowcaseSceneId[];
  subscribe(listener: () => void): () => void;
}

export function createShowcaseStore(): ShowcaseStore {
  let slots: readonly ShowcaseSlotEntry[] = [];
  let status: ShowcaseStatus = 'idle';
  let rendered: readonly ShowcaseSceneId[] = [];
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  return {
    register(entry) {
      slots = [...slots.filter((s) => s.id !== entry.id), entry];
      emit();
      return () => {
        slots = slots.filter((s) => s !== entry);
        emit();
      };
    },
    getSlots: () => slots,
    setStatus(next) {
      // A failure (context loss, chunk error) is final for the page's lifetime.
      if (status === 'failed' || status === next) return;
      status = next;
      emit();
    },
    getStatus: () => status,
    setRendered(scenes) {
      if (scenes.length === rendered.length && scenes.every((scene, i) => rendered[i] === scene)) return;
      rendered = [...scenes];
      emit();
    },
    getRendered: () => rendered,
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

export const showcaseStore = createShowcaseStore();
