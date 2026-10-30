import type { IconName } from '../../types';

// Inline stroke icons (24px grid, currentColor). Seven glyphs did not justify an icon package.
const PATHS: Record<IconName, string> = {
  interface: 'M3 5h18v12H3zM8 21h8M12 17v4M7 9h5M7 12h8',
  automation: 'M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z',
  integration: 'M7 7a3 3 0 1 0 0-.01M17 17a3 3 0 1 0 0-.01M17 4v6M14 7h6M10 7h2a3 3 0 0 1 3 3v4',
  production: 'M4 6h16v12H4zM10 9.5v5l4.5-2.5z',
  arrow: 'M7 17L17 7M9 7h8v8',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 7h16M4 12h16M4 17h10',
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
