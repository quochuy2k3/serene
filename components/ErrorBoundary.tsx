import { Component, type ReactNode } from "react";
import { View, Text, StyleSheet, Pressable, Appearance } from "react-native";
import i18n from "@/i18n";
import {
  palettes,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  lineHeights,
} from "@/constants/theme";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Last-resort crash screen. Class component by necessity — React error
 * boundaries have no hook equivalent. Sits OUTSIDE all providers, so it
 * reads the OS scheme and i18n instance directly instead of using hooks.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleRestart = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const scheme = Appearance.getColorScheme() ?? "light";
    const colors = palettes[scheme];

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {i18n.t("errors.crashTitle", { defaultValue: "Something went wrong" })}
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {i18n.t("errors.crashMessage", {
            defaultValue: "The app hit an unexpected error.",
          })}
        </Text>
        <Pressable
          onPress={this.handleRestart}
          style={[styles.button, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonLabel, { color: colors.textOnPrimary }]}>
            {i18n.t("errors.crashRestart", { defaultValue: "Restart" })}
          </Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing["2xl"],
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["2xl"],
    textAlign: "center",
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    textAlign: "center",
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  button: {
    marginTop: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing["2xl"],
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
  },
});
