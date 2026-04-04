export const AUDIO_CONFIG = {
  frequency: 100,
  duration: 60,
  type: "sine" as const,
  effectDurationHours: 2,
} as const;

export const MOTION_CUES_CONFIG = {
  dotCount: 8,
  defaultDotSize: "medium" as const,
  defaultOpacity: 0.6,
  defaultSensitivity: "medium" as const,
  sensorUpdateInterval: 16, // ~60fps
  maxShift: 30,
  dotSizes: {
    small: 8,
    medium: 12,
    large: 16,
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
export type Sensitivity = keyof typeof MOTION_CUES_CONFIG.sensitivityMultipliers;
