import styles from './OrbitFallback.module.css';

// Static SVG echo of the 3D scene: loading placeholder and no-WebGL fallback.
const C = 300;
const GLOBE = 112;
const MERIDIANS = [0.2, 0.45, 0.7, 0.92];
const LATITUDES = [-0.72, -0.4, 0, 0.4, 0.72];

const RINGS = [
  { rx: 168, ry: 54, rotate: -18, opacity: 0.6, duration: 80, node: { cx: 168, r: 5 } },
  { rx: 214, ry: 112, rotate: 26, opacity: 0.4, duration: 110, node: { cx: -214, r: 6 } },
  { rx: 258, ry: 214, rotate: 64, opacity: 0.24, duration: 150, node: { cx: 258, r: 4 } },
  { rx: 292, ry: 118, rotate: -54, opacity: 0.14, duration: 190, node: { cx: -292, r: 4 } },
];

const STARS = [
  [52, 80, 1.2],
  [540, 64, 1],
  [96, 470, 1.4],
  [560, 420, 1.1],
  [470, 552, 0.9],
  [140, 220, 0.8],
  [508, 250, 0.9],
  [300, 30, 0.8],
  [24, 330, 1],
  [588, 300, 0.8],
] as const;

export function OrbitFallback({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className={styles.fallback} data-hidden={hidden}>
      <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="fb-core" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#2a2a2d" />
            <stop offset="100%" stopColor="#141416" />
          </radialGradient>
        </defs>

        <g className={styles.stars}>
          {STARS.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>

        {/* Globe grid */}
        <g className={styles.globe} fill="none">
          <circle cx={C} cy={C} r={GLOBE} />
          {MERIDIANS.map((k) => (
            <ellipse key={k} cx={C} cy={C} rx={GLOBE * k} ry={GLOBE} />
          ))}
          {LATITUDES.map((t) => {
            const y = C + t * GLOBE;
            const rx = Math.sqrt(1 - t * t) * GLOBE;
            return <ellipse key={t} cx={C} cy={y} rx={rx} ry={rx * 0.22} />;
          })}
        </g>

        {/* Core */}
        <polygon
          className={styles.core}
          points={hexagon(C, C, 70)}
          fill="url(#fb-core)"
        />
        <polygon className={styles.coreInner} points={hexagon(C, C, 70, 30)} fill="none" />

        {/* Rings + nodes, each slowly precessing */}
        {RINGS.map((ring, i) => (
          <g key={i} className={styles.ring} style={{ animationDuration: `${ring.duration}s` }}>
            <g transform={`rotate(${ring.rotate} ${C} ${C})`}>
              <ellipse cx={C} cy={C} rx={ring.rx} ry={ring.ry} fill="none" strokeOpacity={ring.opacity} />
              <circle className={styles.node} cx={C + ring.node.cx} cy={C} r={ring.node.r} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

function hexagon(cx: number, cy: number, r: number, offsetDeg = 0) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i + offsetDeg - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}
