export const colors = {
  primary: "#4A90A4",
  primaryLight: "#6BA8B9",
  primaryDark: "#357082",
  secondary: "#78909C",
  secondaryLight: "#A7C0CD",
  secondaryDark: "#4B636E",
  tertiary: "#B2DFDB",
  tertiaryLight: "#E0F2F1",
  neutral: "#F5F7F7",
  neutralDark: "#E0E4E4",
  white: "#FFFFFF",
  black: "#000000",
  textPrimary: "#1A1A2E",
  textSecondary: "#78909C",
  textInverse: "#FFFFFF",
  background: "#F5F7F7",
  card: "#FFFFFF",
  border: "#E0E4E4",
  error: "#E57373",
  success: "#81C784",
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

export const fonts = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extraBold: "Manrope_800ExtraBold",
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
