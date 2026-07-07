/**
 * Serene Design System — "Therapeutic Tech"
 *
 * Concept: Medical-grade precision meets high-end wellness.
 * Feels like a digital grounding experience — a "weighted blanket" for the eyes.
 */

import { Easing } from "react-native-reanimated";

/**
 * Light palette — "Serene Horizon".
 * Text tokens meet WCAG 4.5:1 on background/surface; `primary` is reserved
 * for fills, borders and icons (3:1 UI-component rule) — use `textAccent`
 * for small accent text.
 */
const light = {
  // Serene Horizon palette
  primary: "#4A90A4", // Calm Teal
  primaryLight: "#6BA8B9",
  primaryDark: "#357082",
  primarySoft: "rgba(74, 144, 164, 0.08)", // Subtle teal tint for active backgrounds

  secondary: "#78909C", // Deep Slate
  secondaryLight: "#A7C0CD",
  secondaryDark: "#4B636E",

  tertiary: "#B2DFDB", // Soft Cyan
  tertiaryLight: "#E0F2F1",

  // Surfaces
  background: "#F8FAFA", // Off-white / Soft Grey — reduces eye strain
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceTinted: "#F1F5F6",

  // Borders (thin, tonal)
  border: "#E4ECEE",
  borderStrong: "#CFDCDF",

  // Text
  textPrimary: "#1A2A33",
  textSecondary: "#5E737C",
  textTertiary: "#64787F",
  textInverse: "#FFFFFF",
  textAccent: "#357082", // Small accent text on background/surface (≥4.5:1)
  textOnPrimary: "#FFFFFF", // Text/icons on primary-filled surfaces

  // States
  success: "#64B5A7",
  successSoft: "rgba(100, 181, 167, 0.12)",
  warning: "#D6A441",
  warningSoft: "rgba(214, 164, 65, 0.12)",
  error: "#D47070",
  errorSoft: "rgba(212, 112, 112, 0.12)",

  // Motion cue dots (in-app iOS overlay)
  motionDot: "#357082",
  motionDotBorder: "rgba(26, 42, 51, 0.25)",

  // Controls
  sliderTrack: "#CFDCDF",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(26, 42, 51, 0.5)",
  glass: "rgba(255, 255, 255, 0.72)",
};

export type ThemeColors = typeof light;

/**
 * Dark palette — true-dark, teal identity preserved.
 * Very dark (not pure black) for nighttime in-car use without OLED smearing.
 */
const dark: ThemeColors = {
  primary: "#6BB0C4",
  primaryLight: "#8FC5D5",
  primaryDark: "#4A90A4",
  primarySoft: "rgba(107, 176, 196, 0.14)",

  secondary: "#8FA6B0",
  secondaryLight: "#5A727C",
  secondaryDark: "#A7C0CD",

  tertiary: "#24413E",
  tertiaryLight: "#17302E",

  background: "#0B1214",
  surface: "#121B1F",
  surfaceElevated: "#182329",
  surfaceTinted: "#0F181C",

  border: "#223037",
  borderStrong: "#2E3F47",

  textPrimary: "#E4EDF0",
  textSecondary: "#A9BCC3",
  textTertiary: "#7E939B",
  textInverse: "#FFFFFF",
  textAccent: "#8FC5D5",
  textOnPrimary: "#0B1214",

  success: "#7BC4B6",
  successSoft: "rgba(123, 196, 182, 0.16)",
  warning: "#E0B563",
  warningSoft: "rgba(224, 181, 99, 0.16)",
  error: "#E08A8A",
  errorSoft: "rgba(224, 138, 138, 0.16)",

  motionDot: "#B8DCE6",
  motionDotBorder: "rgba(0, 0, 0, 0.35)",

  sliderTrack: "#2E3F47",

  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.6)",
  glass: "rgba(18, 27, 31, 0.72)",
};

export const palettes = { light, dark } as const;

export const fonts = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extraBold: "Manrope_800ExtraBold",
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 38,
  "5xl": 48,
} as const;

export const lineHeights = {
  tight: 1.15, // Headings
  snug: 1.35,
  normal: 1.55, // Body — generous for readability during motion
  relaxed: 1.75,
} as const;

export const letterSpacing = {
  tight: -0.5, // Headings — tight tracking
  normal: 0,
  wide: 0.3, // Labels / small caps
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
} as const;

/**
 * Round Eight — 8px base radius.
 * Soft enough to feel approachable, sharp enough to feel like a reliable utility.
 */
export const borderRadius = {
  xs: 4,
  sm: 8, // Primary shape language
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;

/**
 * Shadows are extremely subtle — we use borders and tonal shifts instead.
 * In dark mode, tonal separation (surface vs surfaceElevated) carries depth.
 */
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#1A2A33",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#1A2A33",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#1A2A33",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#1A2A33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

/**
 * Timing values for motion — favoring slow, breathing easings.
 */
export const motion = {
  breath: 4000, // 100Hz pulse breathing cycle
  quick: 180,
  normal: 300,
  slow: 500,
} as const;

/**
 * Shared easing curves — one motion language app-wide.
 */
export const motionEasing = {
  enter: Easing.out(Easing.cubic), // Screen/element entrances
  breathe: Easing.inOut(Easing.sin), // Breathing cycles
  standard: Easing.inOut(Easing.quad), // Property transitions
} as const;

/**
 * Shared spring configs — low-bounce, calm.
 */
export const springs = {
  pill: { damping: 18, stiffness: 180, mass: 0.6 },
  dot: { damping: 15, stiffness: 120 },
} as const;

/**
 * Caps for OS font scaling (maxFontSizeMultiplier) — scaling stays on,
 * but layout-critical text stops growing past these factors.
 */
export const fontScaleCaps = {
  heading: 1.4,
  body: 2.0,
  control: 1.6,
  display: 1.2,
} as const;
