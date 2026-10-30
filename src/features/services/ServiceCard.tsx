import { Icon } from '../../components/ui/Icon';
import type { Service } from '../../types';
import styles from './ServiceCard.module.css';

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className={`theme-dark ${styles.card}`} aria-labelledby={`service-${service.id}`}>
      <div className={styles.top}>
        <h3 id={`service-${service.id}`} className={styles.title}>
          {service.title}
          <span aria-hidden="true">.</span>
        </h3>
        <Icon name={service.icon} size={26} className={styles.icon} />
      </div>
      <p className={styles.summary}>{service.summary}</p>
      <ul className={styles.list} role="list">
        {service.capabilities.map((capability) => (
          <li key={capability}>{capability}</li>
        ))}
      </ul>
    </article>
  );
}
