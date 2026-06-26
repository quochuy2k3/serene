import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import {
  colors,
  fonts,
  fontSizes,
  letterSpacing,
  lineHeights,
  motion,
} from "@/constants/theme";

type CountdownTimerProps = {
  remainingSeconds: number;
  totalSeconds: number;
  isActive: boolean;
  size?: number;
};

/**
 * Breathing sine wave timer — pulsing concentric circles.
 * Instead of a ticking progress ring, the timer breathes in and out,
 * creating a calming, meditative feel that matches the "weighted blanket" concept.
 */
export function CountdownTimer({
  remainingSeconds,
  totalSeconds,
  isActive,
  size = 260,
}: CountdownTimerProps) {
  const { t } = useTranslation();
  const breath = useSharedValue(0);
  const glow = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    // Continuous breathing animation — 4s in, 4s out
    breath.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: motion.breath,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: motion.breath,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1,
      false
    );
  }, [breath]);

  useEffect(() => {
    glow.value = withTiming(isActive ? 1 : 0, {
      duration: motion.slow,
    });
  }, [isActive, glow]);

  const outerRing = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(breath.value, [0, 1], [0.96, 1.04]) },
    ],
    opacity: interpolate(breath.value, [0, 1], [0.25, 0.55]) * (0.5 + glow.value * 0.5),
  }));

  const middleRing = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(breath.value, [0, 1], [0.92, 1.0]) },
    ],
    opacity: interpolate(breath.value, [0, 1], [0.4, 0.75]) * (0.5 + glow.value * 0.5),
  }));

  const innerCore = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(breath.value, [0, 1], [0.88, 0.96]) },
    ],
    backgroundColor: interpolateColor(
      glow.value,
      [0, 1],
      [colors.surfaceTinted, colors.primarySoft]
    ),
  }));

  const displaySeconds = Math.ceil(remainingSeconds);
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer breathing ring */}
      <Animated.View
        style={[
          styles.ring,
          styles.outerRing,
          { width: size, height: size, borderRadius: size / 2 },
          outerRing,
        ]}
      />
      {/* Middle breathing ring */}
      <Animated.View
        style={[
          styles.ring,
          styles.middleRing,
          {
            width: size * 0.82,
            height: size * 0.82,
            borderRadius: (size * 0.82) / 2,
          },
          middleRing,
        ]}
      />
      {/* Inner core */}
      <Animated.View
        style={[
          styles.core,
          {
            width: size * 0.66,
            height: size * 0.66,
            borderRadius: (size * 0.66) / 2,
          },
          innerCore,
        ]}
      />

      {/* Center content */}
      <View style={styles.center}>
        <Text style={styles.seconds}>{displaySeconds}</Text>
        <Text style={styles.unit}>{t("audio.secondsUnit")}</Text>
        {isActive && (
          <Text style={styles.progress}>{progressPercent}%</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "transparent",
  },
  outerRing: {
    borderWidth: 0.5,
  },
  middleRing: {
    borderWidth: 1,
  },
  core: {
    position: "absolute",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  seconds: {
    fontFamily: fonts.extraBold,
    fontSize: 72,
    color: colors.textPrimary,
    lineHeight: 72 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  unit: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    letterSpacing: letterSpacing.wide,
    textTransform: "lowercase",
    marginTop: -4,
  },
  progress: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.primary,
    marginTop: 8,
    letterSpacing: letterSpacing.wide,
  },
});
