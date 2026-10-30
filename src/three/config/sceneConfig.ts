/**
 * Every tunable number of the orbital scene lives here. Scene components read
 * from this object only — no magic numbers inside JSX.
 * Colours mirror src/styles/tokens.css.
 */

export type Vec3 = readonly [number, number, number];
export type PerformanceTier = 'high' | 'medium' | 'low';

export interface RingConfig {
  radiusX: number;
  radiusY: number;
  /** Euler XYZ (radians) placing the ring's plane in space. */
  tilt: Vec3;
  /** In-plane spin, rad/s. Sign sets direction. */
  spin: number;
  opacity: number;
  nodes: readonly NodeConfig[];
}

export interface NodeConfig {
  /** Start angle on the ellipse, radians. */
  phase: number;
  /** Angular speed along the ellipse, rad/s. */
  speed: number;
  size: number;
  /** 0–1 blend from dim accent to full accent. Keep most nodes low. */
  intensity: number;
}

export interface StreamConfig {
  from: Vec3;
  to: Vec3;
  /** Control-point offset that bows the curve away from the core. */
  bend: Vec3;
}

export interface TierProfile {
  maxDpr: number;
  antialias: boolean;
  particles: number;
  ringSegments: number;
  coreGrid: boolean;
  streams: boolean;
  pulsesPerStream: number;
}

export const sceneConfig = {
  colors: {
    accent: '#C1F733',
    accentDim: '#4F6A14',
    coreBody: '#18181A',
    coreGrid: '#C1F733',
    star: '#E6E6EA',
    node: '#F4FFD9',
    light: '#F4F4F5',
  },

  camera: {
    // 35° vertical FOV ≈ a 38 mm lens on full-frame: wide enough for the rings,
    // tight enough to avoid edge stretching on ultra-wide screens.
    fov: 35,
    near: 0.1,
    far: 120,
    position: [0, 0.35, 11] as Vec3,
    /** Extra distance applied as the canvas gets narrower than this aspect. */
    // Measured canvas aspects: desktop ≈0.89, laptop/mobile ≈1.06; both need pull-back.
    narrowAspect: 1.5,
    narrowDistance: 14,
    portraitDistance: 16.5,
  },

  core: {
    radius: 1.15,
    detail: 1,
    rotationSpeed: 0.07,
    metalness: 0.65,
    roughness: 0.35,
    edgeOpacity: 0.55,
    /** Kept very low: the core should read as dark metal, not a lamp. */
    emissiveIntensity: 0.07,
    gridRadius: 1.62,
    gridOpacity: 0.16,
    latitudeLines: 8,
    longitudeLines: 12,
    gridSegments: 72,
    gridRotationSpeed: -0.03,
  },

  rings: [
    {
      radiusX: 2.45,
      radiusY: 2.45,
      tilt: [1.36, 0.0, 0.32],
      spin: 0.05,
      opacity: 0.55,
      nodes: [
        { phase: 0.4, speed: 0.32, size: 0.085, intensity: 1 },
        { phase: 3.6, speed: 0.32, size: 0.05, intensity: 0.35 },
      ],
    },
    {
      radiusX: 3.25,
      radiusY: 2.35,
      tilt: [1.08, 0.48, -0.42],
      spin: -0.035,
      opacity: 0.4,
      nodes: [
        { phase: 1.2, speed: 0.22, size: 0.11, intensity: 0.85 },
        { phase: 4.4, speed: 0.22, size: 0.06, intensity: 0.3 },
      ],
    },
    {
      radiusX: 4.0,
      radiusY: 3.45,
      tilt: [1.7, -0.32, 0.92],
      spin: 0.022,
      opacity: 0.26,
      nodes: [
        { phase: 2.4, speed: 0.15, size: 0.075, intensity: 0.55 },
        { phase: 5.2, speed: 0.15, size: 0.045, intensity: 0.25 },
        { phase: 0.1, speed: 0.15, size: 0.04, intensity: 0.2 },
      ],
    },
    {
      radiusX: 4.85,
      radiusY: 2.95,
      tilt: [0.62, 0.22, -1.12],
      spin: -0.014,
      opacity: 0.16,
      nodes: [{ phase: 3.0, speed: 0.1, size: 0.065, intensity: 0.45 }],
    },
  ] satisfies readonly RingConfig[],

  streams: {
    opacity: 0.2,
    pulseSize: 0.07,
    pulseSpeed: 0.16,
    curveSegments: 48,
    paths: [
      { from: [0.9, 0.5, 0.4], to: [3.2, 1.7, -0.8], bend: [1.2, 1.4, 0.6] },
      { from: [-0.8, -0.4, 0.6], to: [-3.6, -1.2, 0.9], bend: [-1.0, -1.6, 1.2] },
      { from: [0.3, -0.95, -0.4], to: [2.1, -3.0, -1.6], bend: [1.8, -0.8, -0.4] },
      { from: [-0.5, 0.9, -0.5], to: [-1.9, 3.1, -1.4], bend: [-1.6, 1.0, 0.2] },
    ] satisfies readonly StreamConfig[],
  },

  particles: {
    innerRadius: 9,
    outerRadius: 30,
    size: 0.055,
    opacity: 0.7,
    rotationSpeed: 0.006,
    /** Deterministic seed → identical starfield on every load. */
    seed: 1337,
  },

  lights: {
    ambient: 0.25,
    key: { intensity: 1.4, position: [4, 5, 6] as Vec3 },
    rim: { intensity: 6, distance: 9, position: [-2.5, -1, -2.5] as Vec3 },
  },

  motion: {
    /** Max scene tilt from pointer, radians. Small on purpose. */
    parallaxX: 0.1,
    parallaxY: 0.16,
    /** Exponential damping factor (higher = snappier). */
    damping: 2.2,
    /** Camera dolly and lift over the hero's scroll range. */
    scrollDolly: 2.2,
    scrollLift: 0.8,
    /** Whole-system yaw drift, rad/s. */
    systemDrift: 0.012,
  },

  tiers: {
    high: { maxDpr: 1.75, antialias: true, particles: 900, ringSegments: 192, coreGrid: true, streams: true, pulsesPerStream: 2 },
    medium: { maxDpr: 1.5, antialias: true, particles: 520, ringSegments: 128, coreGrid: true, streams: true, pulsesPerStream: 1 },
    low: { maxDpr: 1, antialias: false, particles: 220, ringSegments: 96, coreGrid: false, streams: false, pulsesPerStream: 0 },
  } satisfies Record<PerformanceTier, TierProfile>,
} as const;

export type SceneConfig = typeof sceneConfig;
