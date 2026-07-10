import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { Accelerometer } from "expo-sensors";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ReduceMotion,
  type SharedValue,
} from "react-native-reanimated";
import { MOTION_CUES_CONFIG } from "@/constants/config";
import { springs } from "@/constants/theme";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";

/**
 * 8 dot positions at the screen edges, offset by the safe-area insets so the
 * top dots clear the status bar/notch and the bottom dots clear the home
 * indicator while staying in the peripheral vision zone.
 */
function getDotPositions(insets: EdgeInsets): ViewStyle[] {
  const top = insets.top + 12;
  const bottom = insets.bottom + 24;
  const side = 12;
  return [
    { top, left: "25%" },
    { top, right: "25%" },
    { bottom, left: "25%" },
    { bottom, right: "25%" },
    { top: "25%", left: side },
    { top: "70%", left: side },
    { top: "25%", right: side },
    { top: "70%", right: side },
  ];
}

type MotionDotProps = {
  position: ViewStyle;
  size: number;
  opacity: number;
  color: string;
  borderColor: string;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
};

// The dot springs ARE the therapy — they must keep moving even when the
// user (or OS) asks for reduced motion, hence ReduceMotion.Never.
const DOT_SPRING = { ...springs.dot, reduceMotion: ReduceMotion.Never };

// All dots follow the same offsets, so one accelerometer listener in the
// parent feeds a single shared-value pair — not one subscription per dot.
function MotionDot({
  position,
  size,
  opacity,
  color,
  borderColor,
  offsetX,
  offsetY,
}: MotionDotProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          backgroundColor: color,
          borderColor,
        },
        position,
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
}

type MotionDotsOverlayProps = {
  visible: boolean;
};

export function MotionDotsOverlay({ visible }: MotionDotsOverlayProps) {
  const { settings } = useSettings();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const sensitivity =
    MOTION_CUES_CONFIG.sensitivityMultipliers[settings.sensitivity];

  useEffect(() => {
    if (!visible) {
      offsetX.value = 0;
      offsetY.value = 0;
      return;
    }
    Accelerometer.setUpdateInterval(MOTION_CUES_CONFIG.sensorUpdateInterval);
    const subscription = Accelerometer.addListener(({ x, y }) => {
      // Invert X: car turns right → dots shift left (matches Apple)
      offsetX.value = withSpring(-x * sensitivity * 10, DOT_SPRING);
      // Positive Y: car accelerates → dots shift down
      offsetY.value = withSpring(y * sensitivity * 10, DOT_SPRING);
    });

    return () => {
      subscription.remove();
    };
  }, [visible, sensitivity, offsetX, offsetY]);

  if (!visible) return null;

  const size = MOTION_CUES_CONFIG.dotSizes[settings.dotSize];
  const positions = getDotPositions(insets);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {positions.map((position, index) => (
        <MotionDot
          key={index}
          position={position}
          size={size}
          opacity={settings.dotOpacity}
          color={colors.motionDot}
          borderColor={colors.motionDotBorder}
          offsetX={offsetX}
          offsetY={offsetY}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    borderWidth: 1,
  },
});
