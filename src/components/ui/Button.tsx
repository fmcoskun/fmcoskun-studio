import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary';
type Size = 'default' | 'small';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  children: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(' ');

function classes(variant: Variant, size: Size, extra?: string) {
  return cx(styles.button, styles[variant], size === 'small' && styles.small, extra);
}

function Content({ children, withArrow }: Pick<CommonProps, 'children' | 'withArrow'>) {
  return (
    <>
      <span>{children}</span>
      {withArrow && <Icon name="arrow" size={16} strokeWidth={2} className={styles.icon} />}
    </>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'default',
  withArrow,
  children,
  className,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a className={classes(variant, size, className)} {...rest}>
      <Content withArrow={withArrow}>{children}</Content>
    </a>
  );
}

export function Button({
  variant = 'primary',
  size = 'default',
  withArrow,
  children,
  className,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      <Content withArrow={withArrow}>{children}</Content>
    </button>
  );
}
