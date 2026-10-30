import { useSyncExternalStore } from 'react';
import type { ShowcaseSceneId } from '../../types';
import { showcaseStore, type ShowcaseSlotEntry, type ShowcaseStatus } from './showcaseStore';

export function useShowcaseSlots(): readonly ShowcaseSlotEntry[] {
  return useSyncExternalStore(showcaseStore.subscribe, showcaseStore.getSlots, showcaseStore.getSlots);
}

export function useShowcaseStatus(): ShowcaseStatus {
  return useSyncExternalStore(showcaseStore.subscribe, showcaseStore.getStatus, showcaseStore.getStatus);
}

export function useShowcaseRendered(): readonly ShowcaseSceneId[] {
  return useSyncExternalStore(showcaseStore.subscribe, showcaseStore.getRendered, showcaseStore.getRendered);
}
