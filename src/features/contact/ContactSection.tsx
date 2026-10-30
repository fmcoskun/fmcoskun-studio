import { Reveal } from '../../components/motion/Reveal';
import { ShowcaseSlot } from '../showcase/ShowcaseSlot';
import { ContactForm } from './ContactForm';
import styles from './ContactSection.module.css';

export function ContactSection() {
  return (
    <section id="contact" className={`section ${styles.section}`} aria-labelledby="contact-title">
      <div className={`container theme-light stage-mist ${styles.panel}`}>
        <Reveal className={styles.intro}>
          <p className={styles.eyebrow}>05 / Contact</p>
          <h2 id="contact-title" className={styles.title}>
            Ready to reach your <span className="accent">next orbit</span>?
          </h2>
          <p className={styles.lead}>Tell us what you're building. Let's explore the possibilities.</p>
          <ShowcaseSlot scene="contact-orbit" className={styles.stage} />
        </Reveal>

        <Reveal delay={80} className={styles.formWrap}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
