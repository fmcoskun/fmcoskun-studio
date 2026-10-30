import { useCallback, useEffect, useRef, useState } from 'react';
import { NAV_ITEMS, OBSERVED_SECTIONS } from '../../data/navigation';
import { useActiveSection } from '../../hooks/useActiveSection';
import { latestIntersection } from '../../hooks/intersection';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Logo } from './Logo';
import styles from './Header.module.css';

const PANEL_ID = 'mobile-navigation';

export function Header() {
  const active = useActiveSection(OBSERVED_SECTIONS, 'home');
  const isDesktop = useMediaQuery('(min-width: 900px)');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Border appears once content scrolls under the header. A sentinel observer
  // avoids a scroll listener entirely.
  useEffect(() => {
    const sentinel = document.getElementById('top-sentinel');
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => setScrolled(!latestIntersection(entries)));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Mobile panel side effects: scroll lock, Escape, initial focus.
  useEffect(() => {
    if (!open) return;
    document.body.dataset.scrollLocked = 'true';
    panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      delete document.body.dataset.scrollLocked;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Rotating a tablet into desktop width must not leave a hidden, scroll-locked panel.
  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  return (
    <header className={styles.header} data-scrolled={scrolled || open}>
      <div className={`container ${styles.inner}`}>
        <Logo onNavigate={() => close()} />

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList} role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={styles.navLink}
                  aria-current={active === item.id ? 'location' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ButtonLink href="#contact" size="small" className={styles.cta} withArrow>
            Contact
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls={PANEL_ID}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {open && !isDesktop && (
        <div ref={panelRef} id={PANEL_ID} className={styles.panel}>
          <nav aria-label="Mobile">
            <ul className={styles.panelList} role="list">
              {NAV_ITEMS.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={styles.panelLink}
                    aria-current={active === item.id ? 'location' : undefined}
                    onClick={() => close()}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ButtonLink href="#contact" withArrow onClick={() => close()}>
            Start a conversation
          </ButtonLink>
        </div>
      )}
    </header>
  );
}
