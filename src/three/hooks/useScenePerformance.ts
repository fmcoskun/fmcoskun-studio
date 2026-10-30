import { useCallback, useState } from 'react';
import { sceneConfig, type PerformanceTier } from '../config/sceneConfig';

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/** Initial guess from static signals; PerformanceMonitor refines it at runtime. */
function detectInitialTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'medium';
  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const saveData = (nav as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

  if (saveData || cores <= 2 || memory <= 2) return 'low';
  if (narrow || coarse || cores <= 4 || memory <= 4) return 'medium';
  return 'high';
}

const ORDER: readonly PerformanceTier[] = ['low', 'medium', 'high'];

export function useScenePerformance() {
  const [tier, setTier] = useState<PerformanceTier>(detectInitialTier);

  const degrade = useCallback(() => {
    setTier((current) => ORDER[Math.max(0, ORDER.indexOf(current) - 1)] ?? 'low');
  }, []);

  const lowest = useCallback(() => setTier('low'), []);

  return { tier, profile: sceneConfig.tiers[tier], degrade, lowest };
}
