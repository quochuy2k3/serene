import { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import { motion, motionEasing } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
  /** 0..1 — fraction of the ring filled */
  progress: number;
  size: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
};

/**
 * Thin ambient progress ring — fills clockwise from the top.
 * Intentionally low-emphasis: it reads as gentle filling, not a countdown.
 */
export function ProgressRing({
  progress,
  size,
  strokeWidth = 3,
  color,
  trackColor,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: motion.breath / 4,
      easing: motionEasing.standard,
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        fill="none"
        rotation={-90}
        originX={size / 2}
        originY={size / 2}
      />
    </Svg>
  );
}
