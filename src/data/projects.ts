import type { Project, ProjectStatus } from '../types';

/**
 * Real work goes here as it ships. Until then, entries are explicitly marked
 * as concepts — no invented clients, metrics or testimonials.
 */
export const PROJECTS: readonly Project[] = [
  {
    id: 'studio-site',
    scene: 'studio-orbit',
    title: 'FMCOSKUN Studio Website',
    category: 'Digital Experience',
    summary: 'This site: a procedural Three.js orbital scene wrapped in an accessible, performance-first agency page.',
    description:
      'Built with React, TypeScript and React Three Fiber. The 3D scene is generated from code rather than imported assets, adapts its particle density and resolution to the device, pauses when off-screen, and degrades to a static SVG when WebGL is unavailable or motion is reduced.',
    tags: ['React', 'TypeScript', 'Three.js', 'R3F'],
    status: 'in-progress',
  },
  {
    id: 'production-signal-board',
    scene: 'signal-board',
    title: 'Production Signal Board',
    category: 'Systems & Integration',
    summary: 'Concept for a shop-floor dashboard that turns line and quality data into a single live view.',
    description:
      'Concept study: consolidating production counts, downtime reasons and quality checks from existing SQL databases into one screen per line, refreshed in near real time, with clear thresholds instead of dense charts.',
    tags: ['SQL Server', 'Python', 'Data pipelines', 'Dashboards'],
    status: 'concept',
  },
  {
    id: 'inbox-to-workflow',
    scene: 'inbox-flow',
    title: 'Inbox-to-Workflow Automation',
    category: 'Intelligent Automation',
    summary: 'Concept for routing incoming requests from email into structured, trackable tasks.',
    description:
      'Concept study: classifying incoming requests, extracting the fields a team actually needs, and creating tickets with a human approval step before anything is sent back out.',
    tags: ['Automation', 'AI-assisted', 'APIs'],
    status: 'concept',
  },
  {
    id: 'motion-identity-kit',
    scene: 'motion-kit',
    title: 'Motion Identity Kit',
    category: 'Creative Production',
    summary: 'Concept for a reusable set of animated brand elements for web and social formats.',
    description:
      'Concept study: a small library of logo reveals, transitions and lower-thirds derived from one motion principle, exported for web (Lottie/CSS) and video.',
    tags: ['Motion design', 'Brand', 'Video'],
    status: 'concept',
  },
];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  concept: 'Concept',
  'in-progress': 'In progress',
  live: 'Live',
};
