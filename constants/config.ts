export const AUDIO_CONFIG = {
  frequency: 100,
  duration: 60,
  type: "sine" as const,
  effectDurationHours: 2,
} as const;

export const MOTION_CUES_CONFIG = {
  defaultDotSize: "medium" as const,
  defaultDotDensity: "medium" as const,
  defaultOpacity: 0.6,
  defaultSensitivity: "medium" as const,
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

export type OverlayConfig = {
  dotSizeDp: number;
  sensitivity: number;
  dotCount: number;
  opacity: number;
};

export function resolveOverlayConfig(s: {
  dotSize: DotSize;
  dotDensity: DotDensity;
  sensitivity: Sensitivity;
  dotOpacity: number;
}): OverlayConfig {
  const { min, max } = MOTION_CUES_CONFIG.opacityRange;
  return {
    dotSizeDp: MOTION_CUES_CONFIG.dotSizes[s.dotSize],
    sensitivity: MOTION_CUES_CONFIG.sensitivityMultipliers[s.sensitivity],
    dotCount: MOTION_CUES_CONFIG.dotDensities[s.dotDensity],
    opacity: Math.min(max, Math.max(min, s.dotOpacity)),
  };
}
