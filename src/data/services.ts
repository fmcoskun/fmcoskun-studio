import type { Service } from '../types';

export const SERVICES: readonly Service[] = [
  {
    id: 'digital-experiences',
    title: 'Digital Experiences',
    icon: 'interface',
    summary: 'Interfaces that explain a business quickly and make the next step obvious.',
    capabilities: ['Landing pages', 'Responsive websites', 'Interactive interfaces'],
  },
  {
    id: 'intelligent-automation',
    title: 'Intelligent Automation',
    icon: 'automation',
    summary: 'Removing manual, repetitive steps so teams spend time on decisions instead.',
    capabilities: ['Workflow automation', 'AI-assisted processes', 'Repetitive task reduction'],
  },
  {
    id: 'systems-integration',
    title: 'Systems & Integration',
    icon: 'integration',
    summary: 'Connecting the tools and data a business already has into something coherent.',
    capabilities: ['Data workflows', 'API integration', 'Practical technical solutions'],
  },
  {
    id: 'creative-production',
    title: 'Creative Production',
    icon: 'production',
    summary: 'Visual and motion assets that carry the same clarity as the product itself.',
    capabilities: ['Visual content', 'Motion design', 'Digital media production'],
  },
];
