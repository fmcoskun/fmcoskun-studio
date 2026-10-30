import type { NavItem } from '../types';

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Work' },
  { id: 'process', label: 'Process' },
  { id: 'about', label: 'About' },
];

/** All sections observed for the active-nav state (contact has its own CTA). */
export const OBSERVED_SECTIONS = [...NAV_ITEMS.map((item) => item.id), 'contact'] as const;
