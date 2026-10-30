import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import styles from './Reveal.module.css';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Stagger offset in ms; keep small (<= 240) so content never feels late. */
  delay?: number;
  className?: string;
}

export function Reveal({ children, as: Tag = 'div', delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { rootMargin: '0px 0px -8% 0px', once: true });
  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties;

  return (
    <Tag
      ref={ref}
      className={[styles.reveal, className].filter(Boolean).join(' ')}
      data-visible={visible}
      style={style}
    >
      {children}
    </Tag>
  );
}
