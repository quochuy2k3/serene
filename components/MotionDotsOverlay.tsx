import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { Accelerometer } from "expo-sensors";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { MOTION_CUES_CONFIG } from "@/constants/config";
import { useSettings } from "@/hooks/useSettings";

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
  sensitivity: number;
};

function MotionDot({ position, size, opacity, sensitivity }: MotionDotProps) {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(MOTION_CUES_CONFIG.sensorUpdateInterval);
    const subscription = Accelerometer.addListener(({ x, y }) => {
      // Invert X: car turns right → dots shift left (matches Apple)
      offsetX.value = withSpring(-x * sensitivity * 10, {
        damping: 15,
        stiffness: 120,
      });
      // Positive Y: car accelerates → dots shift down
      offsetY.value = withSpring(y * sensitivity * 10, {
        damping: 15,
        stiffness: 120,
      });
    });

    return () => {
      subscription.remove();
    };
  }, [sensitivity, offsetX, offsetY]);

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
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const size = MOTION_CUES_CONFIG.dotSizes[settings.dotSize];
  const sensitivity =
    MOTION_CUES_CONFIG.sensitivityMultipliers[settings.sensitivity];
  const positions = getDotPositions(insets);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {positions.map((position, index) => (
        <MotionDot
          key={index}
          position={position}
          size={size}
          opacity={settings.dotOpacity}
          sensitivity={sensitivity}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
});
