import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  interpolateColor,
  ReduceMotion,
} from "react-native-reanimated";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  letterSpacing,
  lineHeights,
  motion,
  motionEasing,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";
import { ProgressRing } from "@/components/ProgressRing";

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
 * A thin ambient ring just outside the breathing envelope fills as the
 * session progresses.
 */
export function CountdownTimer({
  remainingSeconds,
  totalSeconds,
  isActive,
  size = 260,
}: CountdownTimerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const breath = useSharedValue(0);
  const glow = useSharedValue(isActive ? 1 : 0);
  const ringOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    // Continuous breathing animation — 4s in, 4s out.
    // The breathing pace is a deliberate calming cue, so it stays on
    // even under reduce-motion (interface entrances still snap).
    breath.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: motion.breath,
          easing: motionEasing.breathe,
          reduceMotion: ReduceMotion.Never,
        }),
        withTiming(0, {
          duration: motion.breath,
          easing: motionEasing.breathe,
          reduceMotion: ReduceMotion.Never,
        })
      ),
      -1,
      false,
      undefined,
      ReduceMotion.Never
    );
  }, [breath]);

  useEffect(() => {
    glow.value = withTiming(isActive ? 1 : 0, {
      duration: motion.slow,
    });
    ringOpacity.value = withTiming(isActive ? 1 : 0, {
      duration: motion.slow,
    });
  }, [isActive, glow, ringOpacity]);

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

  const progressRingStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const displaySeconds = Math.ceil(remainingSeconds);
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;

  // Ring sits outside the outer breathing ring's 1.04 max scale.
  const ringSize = size + 16;
  const containerSize = ringSize;

  return (
    <View
      style={[styles.container, { width: containerSize, height: containerSize }]}
    >
      {/* Ambient session progress ring */}
      <Animated.View style={[styles.progressRing, progressRingStyle]}>
        <ProgressRing
          progress={progress}
          size={ringSize}
          color={colors.primary}
          trackColor={colors.border}
        />
      </Animated.View>

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
      <View
        style={styles.center}
        accessible
        accessibilityLabel={t("audio.timerLabel", { seconds: displaySeconds })}
      >
        <Text
          style={styles.seconds}
          maxFontSizeMultiplier={fontScaleCaps.display}
        >
          {displaySeconds}
        </Text>
        <Text style={styles.unit} maxFontSizeMultiplier={fontScaleCaps.control}>
          {t("audio.secondsUnit")}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
    progressRing: {
      position: "absolute",
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
  });
