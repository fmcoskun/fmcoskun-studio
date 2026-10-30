import { ButtonLink } from '../../components/ui/Button';
import { HeroVisual } from './HeroVisual';
import styles from './HeroSection.module.css';

const FACTS = ['Digital experiences', 'Intelligent automation', 'Systems & integration'];

export function HeroSection() {
  return (
    <section id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <b>//</b> Creative technology studio
          </p>

          <h1 id="hero-title" className={styles.title}>
            Streaming your success to <span className={styles.accent}>new orbits</span>
          </h1>

          <p className={styles.lead}>
            From intelligent automation to immersive digital experiences, we help ambitious businesses turn complex
            ideas into meaningful digital growth.
          </p>

          <div className={styles.actions}>
            <ButtonLink href="#contact" withArrow>
              Launch Your Project
            </ButtonLink>
            <ButtonLink href="#work" variant="secondary">
              Explore Our Work
            </ButtonLink>
          </div>

          <ul className={styles.facts} role="list" aria-label="Focus areas">
            {FACTS.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>

        <div className={styles.visual}>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
