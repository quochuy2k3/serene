import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { colors, borderRadius, shadows } from "@/constants/theme";

const MOCKUP_WIDTH = 180;
const MOCKUP_HEIGHT = 320;
const DOT_SIZE = 8;
const MAX_SHIFT = 14;

// 8 dot positions inside the mockup
const DOT_POSITIONS = [
  { top: 14, left: MOCKUP_WIDTH * 0.28 },
  { top: 14, right: MOCKUP_WIDTH * 0.28 },
  { bottom: 22, left: MOCKUP_WIDTH * 0.28 },
  { bottom: 22, right: MOCKUP_WIDTH * 0.28 },
  { top: MOCKUP_HEIGHT * 0.28, left: 10 },
  { top: MOCKUP_HEIGHT * 0.68, left: 10 },
  { top: MOCKUP_HEIGHT * 0.28, right: 10 },
  { top: MOCKUP_HEIGHT * 0.68, right: 10 },
] as const;

export function DemoPhoneMockup() {
  const shiftX = useSharedValue(0);
  const shiftY = useSharedValue(0);

  useEffect(() => {
    const duration = 800;
    const pause = 1500;
    const easing = Easing.inOut(Easing.quad);

    // Loop: turn right → pause → accelerate → pause → brake → pause
    shiftX.value = withRepeat(
      withSequence(
        withTiming(-MAX_SHIFT, { duration, easing }),
        withTiming(-MAX_SHIFT, { duration: pause }),
        withTiming(0, { duration, easing }),
        withTiming(0, { duration }),
        withTiming(0, { duration: pause }),
        withTiming(0, { duration }),
        withTiming(0, { duration: pause }),
        withTiming(0, { duration })
      ),
      -1,
      false
    );

    shiftY.value = withDelay(
      (duration + pause) * 2,
      withRepeat(
        withSequence(
          withTiming(MAX_SHIFT, { duration, easing }),
          withTiming(MAX_SHIFT, { duration: pause }),
          withTiming(0, { duration, easing }),
          withTiming(-MAX_SHIFT, { duration, easing }),
          withTiming(-MAX_SHIFT, { duration: pause }),
          withTiming(0, { duration, easing })
        ),
        -1,
        false
      )
    );
  }, [shiftX, shiftY]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shiftX.value },
      { translateY: shiftY.value },
    ],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.mockup}>
        <View style={styles.notch} />

        {/* Fake content inside phone */}
        <View style={styles.content}>
          <View style={styles.contentBar} />
          <View style={[styles.contentBar, { width: "70%" }]} />
          <View style={[styles.contentBar, { width: "50%" }]} />
          <View style={styles.contentBlock} />
          <View style={[styles.contentBar, { width: "85%" }]} />
          <View style={[styles.contentBar, { width: "60%" }]} />
        </View>

        {/* 8 animated dots */}
        {DOT_POSITIONS.map((position, index) => (
          <Animated.View
            key={index}
            style={[styles.dot, position, dotStyle]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  mockup: {
    width: MOCKUP_WIDTH,
    height: MOCKUP_HEIGHT,
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.lg + 8,
    padding: 8,
    ...shadows.lg,
  },
  notch: {
    alignSelf: "center",
    width: 60,
    height: 6,
    backgroundColor: colors.neutralDark,
    borderRadius: 3,
    marginTop: 4,
    marginBottom: 10,
  },
  content: {
    flex: 1,
    backgroundColor: colors.neutral,
    borderRadius: borderRadius.md,
    padding: 14,
    gap: 10,
  },
  contentBar: {
    height: 8,
    backgroundColor: colors.neutralDark,
    borderRadius: 4,
    width: "100%",
  },
  contentBlock: {
    height: 60,
    backgroundColor: colors.tertiaryLight,
    borderRadius: borderRadius.sm,
    marginVertical: 6,
  },
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
});
