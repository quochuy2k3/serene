/**
 * The 100 Hz session. Matches the only human protocol with a reported effect
 * (Nagoya University 2025): a 1-minute pure 100 Hz tone at conversational level,
 * taken BEFORE motion. That study used near-field speakers, not headphones, and
 * has not been independently replicated — copy must stay hedged accordingly.
 */
export const AUDIO_CONFIG = {
  frequency: 100,
  duration: 60,
  type: "sine" as const,
} as const;

export const MOTION_CUES_CONFIG = {
  defaultDotSize: "medium" as const,
  defaultDotDensity: "medium" as const,
  defaultOpacity: 0.6,
  defaultSensitivity: "medium" as const,
  // "regular" = v1 offset dots (MotionOffsetService); "dynamic" = v2 scrolling
  // optic-flow field (MotionFlowService). See docs/apple-motion-cues-method.md.
  defaultMotionStyle: "regular" as const,
  sensorUpdateInterval: 16, // ~60fps (iOS in-app overlay accelerometer rate)
  opacityRange: { min: 0.2, max: 1.0 },
  dotSizes: {
    small: 8,
    medium: 12,
    large: 16,
  },
  dotDensities: {
    low: 4,
    medium: 8,
    high: 12,
  },
  sensitivityMultipliers: {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
  },
} as const;

export const APP_CONFIG = {
  name: "Serene",
  tagline: "Calm every journey",
  version: "1.0.0",
  researchSource: "Nagoya University, Japan (2025)",
} as const;

export type DotSize = keyof typeof MOTION_CUES_CONFIG.dotSizes;
export type DotDensity = keyof typeof MOTION_CUES_CONFIG.dotDensities;
export type Sensitivity = keyof typeof MOTION_CUES_CONFIG.sensitivityMultipliers;

/**
 * Which overlay animation model to use (Android).
 * - `regular` — v1: dot offset proportional to acceleration (MotionOffsetService)
 * - `dynamic` — v2: scrolling optic-flow field, velocity ∝ acceleration
 *   (MotionFlowService). See docs/apple-motion-cues-method.md.
 */
export type MotionStyle = "regular" | "dynamic";

/**
 * Tuning for the v2 "Dynamic" flow overlay (`MotionFlowService`).
 *
 * The whole object is sent to the native service as JSON on every start, so any
 * value can be tuned from JS with Fast Refresh — edit it, then toggle the
 * overlay Stop/Start to apply, with no native rebuild. Every key is optional:
 * `resolveFlowTuning` fills unset keys from `FLOW_TUNING_DEFAULTS`, and the
 * native side falls back to the same defaults for anything still missing.
 *
 * Motion:
 * - `gain`        scroll velocity (px/s) per m/s² of acceleration — travel/speed
 * - `brakeFactor` reverse kept while decelerating (0 = freeze on stop, 1 = full
 *                 spring-back); small = small spring
 * - `accLp`       acceleration low-pass weight (higher = snappier, noisier)
 * - `deadband`    acceleration (m/s²) below which the field is treated as still
 * - `smooth`      scroll-velocity easing (higher = snappier, lower = smoother)
 * - `scrollEps`   scroll velocity (px/s) treated as "no active flow"
 * - `maxDt`       per-sample dt clamp (s) so a stalled sensor can't fling it
 *
 * Look:
 * - `bandDp`      full-strength edge band width (dp)
 * - `fadeDp`      fade-out ramp past the band toward centre (dp)
 * - `fillAlpha`   dot fill alpha at full strength (0–255)
 * - `strokeAlpha` dot outline alpha at full strength (0–255)
 */
export type FlowTuning = {
  gain: number;
  brakeFactor: number;
  accLp: number;
  deadband: number;
  smooth: number;
  scrollEps: number;
  maxDt: number;
  bandDp: number;
  fadeDp: number;
  fillAlpha: number;
  strokeAlpha: number;
};

/** Canonical defaults — must mirror the `DEF_*` fallbacks in MotionFlowService. */
export const FLOW_TUNING_DEFAULTS: FlowTuning = {
  gain: 120,
  brakeFactor: 0.25,
  accLp: 0.2,
  deadband: 0.12,
  smooth: 0.2,
  scrollEps: 8,
  maxDt: 0.1,
  bandDp: 24,
  fadeDp: 60,
  fillAlpha: 230,
  strokeAlpha: 51,
};

/**
 * Edit here to tune the flow overlay from JS. Set only the keys you want to
 * change; the rest fall back to {@link FLOW_TUNING_DEFAULTS}.
 */
export const flowTuningOverrides: Partial<FlowTuning> = {};

/** Merge partial overrides onto the defaults (unset keys use the default). */
export function resolveFlowTuning(
  overrides: Partial<FlowTuning> = flowTuningOverrides
): FlowTuning {
  const tuning: Partial<FlowTuning> = { ...overrides };
  for (const key of Object.keys(FLOW_TUNING_DEFAULTS) as (keyof FlowTuning)[]) {
    tuning[key] ??= FLOW_TUNING_DEFAULTS[key];
  }
  return tuning as FlowTuning;
}

export type OverlayConfig = {
  dotSizeDp: number;
  sensitivity: number;
  dotCount: number;
  opacity: number;
  style: MotionStyle;
  flow: FlowTuning;
};

export function resolveOverlayConfig(s: {
  dotSize: DotSize;
  dotDensity: DotDensity;
  sensitivity: Sensitivity;
  dotOpacity: number;
  motionStyle: MotionStyle;
}): OverlayConfig {
  const { min, max } = MOTION_CUES_CONFIG.opacityRange;
  return {
    dotSizeDp: MOTION_CUES_CONFIG.dotSizes[s.dotSize],
    sensitivity: MOTION_CUES_CONFIG.sensitivityMultipliers[s.sensitivity],
    dotCount: MOTION_CUES_CONFIG.dotDensities[s.dotDensity],
    opacity: Math.min(max, Math.max(min, s.dotOpacity)),
    style: s.motionStyle,
    flow: resolveFlowTuning(),
  };
}
