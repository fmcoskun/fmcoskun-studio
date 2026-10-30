export type SectionId = 'home' | 'services' | 'work' | 'process' | 'about' | 'contact';

export interface NavItem {
  id: SectionId;
  label: string;
}

export type IconName = 'interface' | 'automation' | 'integration' | 'production' | 'arrow' | 'close' | 'menu';

export interface Service {
  id: string;
  title: string;
  icon: IconName;
  summary: string;
  capabilities: readonly string[];
}

export type ProjectStatus = 'concept' | 'in-progress' | 'live';

/** 3D showcase scenes drawn on the shared canvas (Work cards + Contact). */
export type ShowcaseSceneId = 'studio-orbit' | 'signal-board' | 'inbox-flow' | 'motion-kit' | 'contact-orbit';

export interface Project {
  id: string;
  title: string;
  category: string;
  summary: string;
  /** Longer text shown in the detail dialog. */
  description: string;
  tags: readonly string[];
  status: ProjectStatus;
  /** Optional absolute https URL. Omit rather than inventing one. */
  url?: string;
  /** Optional path under /public, e.g. "/projects/foo.webp". */
  image?: { src: string; alt: string };
  /** Card scene when there is no image. */
  scene?: Exclude<ShowcaseSceneId, 'contact-orbit'>;
}

export interface ProcessStep {
  index: string;
  title: string;
  description: string;
}
