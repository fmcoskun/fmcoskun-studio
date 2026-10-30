import { Reveal } from '../../components/motion/Reveal';
import { SectionHeading } from '../../components/ui/SectionHeading';
import styles from './AboutSection.module.css';

const PRINCIPLES = [
  { title: 'Systems first', text: 'Every interface sits on data, infrastructure and processes. We design with those constraints in view.' },
  { title: 'Measured, not promised', text: 'Results are reported where they can actually be measured — never estimated for a pitch.' },
  { title: 'Built to be maintained', text: 'Typed code, documented configuration and no dependency without a reason.' },
];

export function AboutSection() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className={`container ${styles.layout}`}>
        <Reveal>
          <SectionHeading
            id="about-title"
            eyebrow="04 / About"
            title={
              <>
                A studio where <mark>systems thinking</mark> meets design.
              </>
            }
            intro="FMCOSKUN Studio is an independent creative technology studio. It brings an operations and infrastructure background to digital product work: the same care for reliability that keeps systems running goes into every interface and automation we ship."
          />
        </Reveal>

        <ul className={styles.principles} role="list">
          {PRINCIPLES.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 80} className={styles.principle}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
