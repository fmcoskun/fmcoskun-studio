import { useEffect, useRef } from 'react';
import { Badge } from '../../components/ui/Badge';
import { ButtonLink } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { STATUS_LABEL } from '../../data/projects';
import type { Project } from '../../types';
import styles from './ProjectDialog.module.css';

interface ProjectDialogProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * Native <dialog> via showModal(): focus trapping, Escape, inert background and
 * top-layer stacking come from the browser instead of custom code.
 */
export function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (project && !dialog.open) dialog.showModal();
    if (!project && dialog.open) dialog.close();
  }, [project]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="project-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        // A click whose target is the <dialog> itself landed on the backdrop.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {project && (
        <div className={styles.inner}>
          <div className={styles.head}>
            <p className={styles.meta}>
              {project.category}
              <Badge tone={project.status === 'concept' ? 'neutral' : 'accent'}>{STATUS_LABEL[project.status]}</Badge>
            </p>
            <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Close project details">
              <Icon name="close" size={20} />
            </button>
          </div>

          <h3 id="project-dialog-title" className={styles.title}>
            {project.title}
          </h3>
          <p className={styles.description}>{project.description}</p>

          <ul className={styles.tags} role="list" aria-label="Technologies">
            {project.tags.map((tag) => (
              <li key={tag}>
                <Badge>{tag}</Badge>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            {project.url ? (
              <ButtonLink href={project.url} target="_blank" rel="noopener noreferrer" withArrow>
                Visit project <span className="visually-hidden">(opens in a new tab)</span>
              </ButtonLink>
            ) : (
              <ButtonLink href="#contact" withArrow onClick={() => ref.current?.close()}>
                Discuss a similar project
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
