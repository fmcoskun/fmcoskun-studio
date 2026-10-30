import { NAV_ITEMS } from '../../data/navigation';
import { SITE } from '../../data/site';
import { Logo } from './Logo';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.name}>
            <Logo />
            <span className={styles.suffix}>Studio</span>
          </div>
          <p className={styles.tagline}>{SITE.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <ul className={styles.links} role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>

        <div className={styles.meta}>
          <span>© {year} FMCOSKUN Studio</span>
          <span>Built with React &amp; Three.js</span>
        </div>
      </div>
    </footer>
  );
}
