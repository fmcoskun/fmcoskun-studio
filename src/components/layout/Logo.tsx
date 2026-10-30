import { useState, type CSSProperties, type PointerEvent } from 'react';
import styles from './Logo.module.css';

const WORDMARK = 'FMCOSKUN';
const CHARS = WORDMARK.split('');

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  const [spinning, setSpinning] = useState(false);

  // Hover does not exist on touch; a tap plays the spin once instead.
  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === 'touch' && !spinning) setSpinning(true);
  };

  return (
    <a
      href="#home"
      className={styles.logo}
      aria-label="FMCOSKUN Studio — back to top"
      data-spin={spinning}
      onPointerDown={handlePointerDown}
      onClick={onNavigate}
      onAnimationEnd={(event) => {
        // The last glyph finishing marks the end of the staggered sequence.
        if ((event.target as HTMLElement).dataset.last === 'true') setSpinning(false);
      }}
    >
      {CHARS.map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={styles.char}
          style={{ '--i': i } as CSSProperties}
          data-last={i === CHARS.length - 1 || undefined}
          aria-hidden="true"
        >
          {char}
        </span>
      ))}
    </a>
  );
}
