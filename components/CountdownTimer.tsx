import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { colors, fonts, fontSizes } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CountdownTimerProps = {
  remainingSeconds: number;
  totalSeconds: number;
  size?: number;
  strokeWidth?: number;
};

export function CountdownTimer({
  remainingSeconds,
  totalSeconds,
  size = 220,
  strokeWidth = 10,
}: CountdownTimerProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(1);

  useEffect(() => {
    const ratio = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
    progress.value = withTiming(ratio, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [remainingSeconds, totalSeconds, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const displaySeconds = Math.ceil(remainingSeconds);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.neutralDark}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={styles.seconds}>{displaySeconds}</Text>
        <Text style={styles.unit}>seconds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  seconds: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["4xl"] + 16,
    color: colors.textPrimary,
    lineHeight: fontSizes["4xl"] + 20,
  },
  unit: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: "lowercase",
  },
});
