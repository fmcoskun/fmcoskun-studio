import { Reveal } from '../../components/motion/Reveal';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { PROCESS_STEPS } from '../../data/process';
import styles from './ProcessSection.module.css';

export function ProcessSection() {
  return (
    <section id="process" className="section theme-light band-light" aria-labelledby="process-title">
      <div className="container">
        <Reveal>
          <SectionHeading
            id="process-title"
            eyebrow="03 / Process"
            title={
              <>
                From first signal to <mark>stable orbit</mark>.
              </>
            }
            intro="A simple, four-stage loop. Each stage ends with something you can review before the next one starts."
          />
        </Reveal>

        <ol className={styles.track} role="list">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal as="li" key={step.index} delay={i * 90} className={styles.step}>
              <span className={styles.node} aria-hidden="true" />
              <p className={styles.index} aria-hidden="true">
                {step.index}
              </p>
              <h3 className={styles.title}>
                <span className="visually-hidden">Step {step.index}: </span>
                {step.title}
              </h3>
              <p className={styles.description}>{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
