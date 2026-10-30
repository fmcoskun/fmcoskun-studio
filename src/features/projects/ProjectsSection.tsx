import { useState } from 'react';
import { Reveal } from '../../components/motion/Reveal';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { PROJECTS } from '../../data/projects';
import type { Project } from '../../types';
import { ProjectCard } from './ProjectCard';
import { ProjectDialog } from './ProjectDialog';
import styles from './ProjectsSection.module.css';

export function ProjectsSection() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="container">
        <Reveal>
          <SectionHeading
            id="work-title"
            eyebrow="02 / Work"
            title={
              <>
                Selected work and <mark>concept studies</mark>.
              </>
            }
            intro="Shipped work is labelled as such. Concept studies are clearly marked — they show direction and approach, not client results."
          />
        </Reveal>

        <ul className={styles.grid} role="list">
          {PROJECTS.map((project, i) => (
            <Reveal as="li" key={project.id} delay={(i % 2) * 80}>
              <ProjectCard project={project} index={i} onOpen={setSelected} />
            </Reveal>
          ))}
        </ul>
      </div>

      <ProjectDialog project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
