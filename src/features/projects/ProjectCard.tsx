import { useRef } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { STATUS_LABEL } from '../../data/projects';
import { ShowcaseSlot } from '../showcase/ShowcaseSlot';
import type { Project } from '../../types';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}

export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const label = String(index + 1).padStart(2, '0');
  const card = useRef<HTMLElement>(null);

  return (
    <article ref={card} className={styles.card}>
      <div className={`${styles.media} stage-mist`}>
        {project.image ? (
          <img src={project.image.src} alt={project.image.alt} loading="lazy" decoding="async" />
        ) : (
          project.scene && <ShowcaseSlot scene={project.scene} hoverRef={card} className={styles.slot} />
        )}
        <span className={styles.index} aria-hidden="true">
          P/{label}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span>{project.category}</span>
          <Badge tone={project.status === 'concept' ? 'neutral' : 'accent'}>{STATUS_LABEL[project.status]}</Badge>
        </div>

        <h3 className={styles.title}>
          <button
            type="button"
            className={styles.trigger}
            onClick={() => onOpen(project)}
            aria-haspopup="dialog"
          >
            {project.title}
          </button>
        </h3>

        <p className={styles.summary}>{project.summary}</p>

        <ul className={styles.tags} role="list" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>

        <span className={styles.open} aria-hidden="true">
          View details <Icon name="arrow" size={16} strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}
