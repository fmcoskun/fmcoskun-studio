import type { JSX } from 'react';
import type { ShowcaseSceneId } from '../../types';
import s from './ShowcaseFallback.module.css';

/**
 * Static SVG echo of each 3D scene (the approved sketches): loading placeholder,
 * no-WebGL fallback and context-loss fallback.
 */
export function ShowcaseFallback({ scene }: { scene: ShowcaseSceneId }) {
  const square = scene === 'contact-orbit';
  return (
    <svg
      className={s.svg}
      viewBox={square ? '0 0 200 200' : '0 0 400 200'}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {SKETCHES[scene]}
    </svg>
  );
}

// [x, y, width, height, rotation°]
const ENVELOPES = [
  [44, 60, 32, 22, -18],
  [79, 110, 32, 22, 22],
  [40, 140, 32, 22, -6],
  [106, 50, 28, 19, 35],
] as const;

// [x, y, dimmed]
const TASKS = [
  [270, 56, false],
  [270, 76, true],
  [312, 92, false],
  [312, 112, true],
  [354, 124, false],
] as const;

const SKETCHES: Record<ShowcaseSceneId, JSX.Element> = {
  'studio-orbit': (
    <>
      <ellipse className={s.shadow} cx="200" cy="176" rx="70" ry="7" />
      <path className={s.line} d="M120 30h-18v18M280 30h18v18M120 170h-18v-18M280 170h18v-18" strokeWidth="1.5" />
      <ellipse className={s.line} cx="200" cy="100" rx="110" ry="34" transform="rotate(-14 200 100)" opacity=".7" />
      <ellipse className={s.line} cx="200" cy="100" rx="70" ry="70" opacity=".25" />
      <polygon className={s.body} points="200,72 224,86 224,114 200,128 176,114 176,86" strokeWidth="1.5" />
      <path className={s.glow} d="M176 86 200 100 224 86 M200 100 200 128" opacity=".6" />
      <circle className={s.node} cx="306" cy="76" r="5" />
    </>
  ),
  'signal-board': (
    <>
      <g className={s.line} opacity=".4">
        <path d="M60 130 200 60 340 130 200 200Z" />
        <path d="M95 112 235 182M130 95 270 165M165 78 305 148M95 148 235 78M130 165 270 95M165 182 305 112" />
      </g>
      <path className={s.line} d="M85 128 L170 98 M150 168 L185 120 M318 134 L232 104 M262 168 L220 122" strokeWidth="1.5" />
      <circle className={s.node} cx="120" cy="116" r="4" />
      <circle className={s.node} cx="166" cy="146" r="4" />
      <circle className={s.node} cx="280" cy="122" r="4" />
      <circle className={s.alert} cx="240" cy="148" r="6" />
      <circle className={s.alertRing} cx="240" cy="148" r="12" />
      <rect className={s.body} x="176" y="70" width="48" height="48" rx="4" strokeWidth="1.6" />
      <path className={s.glow} d="M184 80h32M184 90h32M184 100h20M184 110h26" opacity=".8" />
    </>
  ),
  'inbox-flow': (
    <>
      <ellipse className={s.shadow} cx="200" cy="164" rx="40" ry="5" />
      <g className={s.line} strokeWidth="1.4" opacity=".85">
        {ENVELOPES.map(([x, y, w, h, r]) => (
          <g key={`${x}-${y}`} transform={`rotate(${r} ${x + w / 2} ${y + h / 2})`}>
            <rect className={s.paper} x={x} y={y} width={w} height={h} rx="2" />
            <path d={`M${x} ${y}l${w / 2} ${h * 0.55} ${w / 2}-${h * 0.55}`} />
          </g>
        ))}
      </g>
      <polygon className={s.node} points="200,52 236,150 164,150" fillOpacity=".35" strokeWidth="1.8" />
      <path className={s.line} d="M140 100 L182 100 M218 96 L262 70 M218 104 L262 100 M218 112 L262 130" opacity=".5" />
      {TASKS.map(([x, y, dim]) => (
        <rect key={`${x}-${y}`} className={s.node} x={x} y={y} width="34" height="14" rx="3" fillOpacity={dim ? 0.5 : 1} />
      ))}
    </>
  ),
  'motion-kit': (
    <>
      <ellipse className={s.shadow} cx="200" cy="170" rx="50" ry="6" />
      <rect className={s.line} x="60" y="62" width="96" height="54" rx="3" opacity=".55" />
      <rect className={s.line} x="250" y="40" width="44" height="78" rx="3" opacity=".55" />
      <rect className={s.line} x="306" y="68" width="52" height="52" rx="3" opacity=".55" />
      <text className={s.label} x="62" y="128">16:9</text>
      <text className={s.label} x="252" y="130">9:16</text>
      <text className={s.label} x="308" y="132">1:1</text>
      <rect className={s.body} x="92" y="76" width="24" height="24" opacity=".5" />
      <path className={s.body} d="M188 92 l12-22 l12 22z" strokeWidth="1.6" />
      <path className={s.glow} d="M188 92 l12 8 l12 -8" />
      <circle className={s.body} cx="200" cy="140" r="16" opacity=".55" />
      <path className={s.line} d="M120 88 Q150 60 182 80 M216 84 Q240 70 262 74 M200 100 L200 122" strokeDasharray="3 4" opacity=".6" />
    </>
  ),
  'contact-orbit': (
    <>
      <ellipse className={s.shadow} cx="100" cy="172" rx="40" ry="5" />
      <ellipse className={s.line} cx="100" cy="96" rx="80" ry="26" transform="rotate(-20 100 96)" opacity=".7" />
      <ellipse className={s.line} cx="100" cy="96" rx="56" ry="56" opacity=".25" />
      <polygon className={s.body} points="100,78 116,87 116,105 100,114 84,105 84,87" strokeWidth="1.5" />
      <circle className={s.node} cx="174" cy="70" r="5" />
    </>
  ),
};
