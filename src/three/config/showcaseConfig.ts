/**
 * Every tunable number of the showcase scenes (Work cards + Contact). Scene
 * components read from this object only — no magic numbers inside JSX.
 *
 * Colours mirror src/styles/tokens.css (light "mist" stage):
 *   line   → --olive-700     body  → --charcoal-700   accent → --accent-rgb
 *   alert  → --red-600       shadow → --ink-950    paper → --mist-100
 */
import type { PerformanceTier, Vec3 } from './sceneConfig';

export interface ShowcaseCamera {
  fov: number;
  position: Vec3;
  /** Point the camera looks at; origin when omitted. */
  target?: Vec3;
}

export interface ShowcaseTierProfile {
  maxDpr: number;
  antialias: boolean;
  ringSegments: number;
  signalPackets: number;
  inboxItems: number;
  morphSamples: number;
}

export const showcaseConfig = {
  colors: {
    line: '#3C5600',
    body: '#303034',
    accent: '#C1F733',
    alert: '#D93B3B',
    paper: '#ECEBF0',
    shadow: '#0D0D0F',
  },

  /** Soft contact shadow under each composition (blob texture, no shadow maps). */
  floor: { opacity: 0.1 },

  /**
   * Shared per-view lighting. Physically based diffuse is albedo/π × irradiance,
   * so a charcoal albedo needs strong light before its facets separate.
   */
  lights: {
    ambient: 2.5,
    key: { intensity: 8, position: [4, 6, 5] as Vec3 },
  },

  /** Dark-metal bodies on the light stage. */
  bodyMaterial: { metalness: 0.05, roughness: 0.55 },

  studio: {
    camera: { fov: 30, position: [0, 0.25, 11] as Vec3 } satisfies ShowcaseCamera,
    period: 8,
    coreRadius: 0.8,
    coreSpin: 0.18,
    /** Miniature of the hero system: radius, tilt, spin (rad/s), opacity, node phase. */
    rings: [
      { radiusX: 1.7, radiusY: 1.7, tilt: [1.36, 0, 0.32] as Vec3, spin: 0.22, opacity: 0.75, phase: 0.4 },
      { radiusX: 2.5, radiusY: 1.8, tilt: [1.08, 0.48, -0.42] as Vec3, spin: -0.15, opacity: 0.5, phase: 2.6 },
      { radiusX: 3.4, radiusY: 2.2, tilt: [1.6, -0.3, 0.9] as Vec3, spin: 0.1, opacity: 0.3, phase: 4.4 },
    ],
    nodeSize: 0.11,
    /** Viewport corner marks around the system, in scene units on the z=0 plane. */
    frame: { halfWidth: 4.6, halfHeight: 2.2, arm: 0.5, opacity: 0.9 },
    hoverYaw: 0.35,
    hoverPitch: 0.12,
    hoverDamping: 4,
    floorY: -1.95,
    floorRadius: 1.6,
  },

  signal: {
    camera: { fov: 33, position: [7.5, 6.5, 7.5] as Vec3, target: [0, -0.15, 0] as Vec3 } satisfies ShowcaseCamera,
    period: 8,
    /** Cycle phases: a line flashes, the matrix catches it, the flow recovers. */
    anomaly: { flashAt: 0.4, catchAt: 0.55, recoverAt: 0.8 },
    board: { half: 3.2, divisions: 8, opacity: 0.35 },
    matrix: { size: [1.3, 0.7, 1.3] as Vec3, rows: 4, pulse: 0.9 },
    stationSize: 0.32,
    /** Production lines: station → elbow → matrix face (board plane, y = 0). */
    paths: [
      [[-3, 0, -1.2], [-1.4, 0, -1.2], [-0.65, 0, -0.35]],
      [[-2.4, 0, 2.6], [-1.2, 0, 1.4], [-0.4, 0, 0.65]],
      [[2.8, 0, -2.2], [1.2, 0, -1.2], [0.4, 0, -0.65]],
      [[3, 0, 1], [1.4, 0, 1], [0.65, 0, 0.35]],
      [[0.6, 0, 3], [0.6, 0, 1.5], [0.3, 0, 0.65]],
    ] as readonly (readonly Vec3[])[],
    pathOpacity: 0.9,
    packetSize: 0.09,
    /** Packet laps per second along a path. */
    packetSpeed: 0.22,
    alertScale: 0.9,
    ringRadius: 0.42,
    hoverTempo: 1.6,
    hoverDamping: 3,
    floorRadius: 1.1,
  },

  inbox: {
    camera: { fov: 30, position: [0, 0.2, 12] as Vec3 } satisfies ShowcaseCamera,
    period: 9,
    /** Share of an item's cycle spent on the chaotic inbound leg. */
    prismAt: 0.5,
    seed: 2024,
    /** Inbound scatter zone (x, y ranges) and max random tilt, radians. */
    scatter: { x: [-5.4, -2.6] as const, y: [-1.5, 1.6] as const, tiltZ: 0.6, tiltY: 0.5 },
    envelope: { size: [0.78, 0.52, 0.05] as Vec3, flapDepth: 0.55, arrivalScale: 0.55 },
    prism: { radius: 1.05, depth: 0.9, opacity: 0.35, entryX: -0.75, exitX: 1.05, yaw: 0.35 },
    card: { size: [1.0, 0.36, 0.06] as Vec3 },
    columns: { x: [2.7, 3.95, 5.2] as const, topY: 1.15, rowGap: 0.52, guideTop: 1.55, guideBottom: -1.15, guideOpacity: 0.3 },
    /** Fractions of the outbound leg: travel to the slot, then hold, then shrink away. */
    outbound: { travel: 0.35, fadeOut: 0.9 },
    flowOpacity: 0.45,
    hoverTempo: 1.6,
    hoverDamping: 3,
    floorY: -0.95,
    floorRadius: 1.2,
  },

  motion: {
    camera: { fov: 30, position: [0, 0.6, 12] as Vec3 } satisfies ShowcaseCamera,
    period: 9,
    /** Seconds each form holds, then blends into the next (period = 3 × (hold + blend)). */
    hold: 2,
    blend: 1,
    cubeHalf: 0.8,
    pyramid: { baseY: -0.75, apexY: 1.05, baseHalf: 0.95 },
    sphereRadius: 0.95,
    spin: 0.35,
    outlineScale: 1.045,
    /** Format frames, left → right, paired with cube → pyramid → sphere. */
    frames: [
      { label: '16:9', x: -3.7, width: 3.2, height: 1.8 },
      { label: '9:16', x: 0, width: 1.5, height: 2.67 },
      { label: '1:1', x: 3.5, width: 2.1, height: 2.1 },
    ],
    /** Form radius as a share of the frame's shorter side. */
    fit: 0.36,
    frameOpacity: { idle: 0.3, active: 1 },
    tab: { width: 0.5, height: 0.08, inset: 0.12 },
    hoverTempo: 1.6,
    hoverDamping: 3,
    floorY: -1.75,
    floorRadius: 0.9,
  },

  contact: {
    camera: { fov: 30, position: [0, 0.6, 10.5] as Vec3 } satisfies ShowcaseCamera,
    period: 10,
    coreRadius: 0.85,
    coreSpin: 0.25,
    ring: { radiusX: 2.3, radiusY: 2.3, tilt: [1.22, 0.1, 0.38] as Vec3, opacity: 0.75, spin: 0.08 },
    halo: { radiusX: 1.6, radiusY: 1.6, tilt: [0.15, 0.35, 0] as Vec3, opacity: 0.25 },
    nodeSize: 0.13,
    floorY: -1.85,
    floorRadius: 1.7,
  },

  /** Showcase canvas spans the viewport, so DPR is capped harder than the hero. */
  tiers: {
    high: { maxDpr: 1.5, antialias: true, ringSegments: 160, signalPackets: 18, inboxItems: 12, morphSamples: 900 },
    medium: { maxDpr: 1.25, antialias: true, ringSegments: 112, signalPackets: 12, inboxItems: 9, morphSamples: 600 },
    low: { maxDpr: 1, antialias: false, ringSegments: 80, signalPackets: 8, inboxItems: 6, morphSamples: 360 },
  } satisfies Record<PerformanceTier, ShowcaseTierProfile>,
} as const;

export type ShowcaseConfig = typeof showcaseConfig;
