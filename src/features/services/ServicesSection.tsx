import { Reveal } from '../../components/motion/Reveal';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { SERVICES } from '../../data/services';
import { ServiceCard } from './ServiceCard';
import styles from './ServicesSection.module.css';

export function ServicesSection() {
  return (
    <section id="services" className="section theme-light band-light band-light--under-hero" aria-labelledby="services-title">
      <div className="container">
        <Reveal>
          <SectionHeading
            id="services-title"
            eyebrow="01 / Services"
            title={
              <>
                Four disciplines, one <mark>orbit</mark>.
              </>
            }
            intro="Design, automation, integration and media work best when they are planned together. These are the areas the studio focuses on."
          />
        </Reveal>

        <ul className={styles.grid} role="list">
          {SERVICES.map((service, i) => (
            <Reveal as="li" key={service.id} delay={i * 70}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
