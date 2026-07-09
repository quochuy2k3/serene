import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { StyleSheet, useColorScheme } from "react-native";
import * as SystemUI from "expo-system-ui";
import { palettes, type ThemeColors } from "@/constants/theme";
import { useSettings } from "@/hooks/useSettings";

export type ColorScheme = "light" | "dark";

type Theme = {
  colors: ThemeColors;
  scheme: ColorScheme;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const osScheme = useColorScheme();

  const scheme: ColorScheme =
    settings.themeMode === "system"
      ? (osScheme ?? "light")
      : settings.themeMode;

  const value = useMemo<Theme>(
    () => ({ colors: palettes[scheme], scheme }),
    [scheme]
  );

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(value.colors.background).catch(() => {
      // Root background stays default — cosmetic only
    });
  }, [value.colors.background]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Pass a MODULE-SCOPE factory (stable reference) — an inline factory defeats
 * the memoization and rebuilds the StyleSheet on every render.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ThemeColors) => T
): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
