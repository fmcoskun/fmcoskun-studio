import type { ProcessStep } from '../types';

export const PROCESS_STEPS: readonly ProcessStep[] = [
  { index: '01', title: 'Discover', description: 'Understand the problem, objectives, and constraints.' },
  { index: '02', title: 'Design', description: 'Develop the experience, interaction model, and technical approach.' },
  { index: '03', title: 'Build', description: 'Implement the solution and test its behavior.' },
  {
    index: '04',
    title: 'Launch & Improve',
    description: 'Deploy, measure actual results where measurement is available, and iterate.',
  },
];
