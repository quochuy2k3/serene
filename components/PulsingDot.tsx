import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

type PulsingDotProps = {
  color: string;
  size?: number;
  pulse?: boolean;
};

/**
 * A small dot that emits a soft "breathing" pulse when active.
 * Used for status indicators (e.g. "Active" overlay badge).
 */
export function PulsingDot({ color, size = 8, pulse = true }: PulsingDotProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (!pulse) {
      scale.value = withTiming(1);
      opacity.value = withTiming(0);
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 1200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.quad) }),
        withTiming(0.4, { duration: 0 })
      ),
      -1,
      false
    );
  }, [pulse, scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      {pulse && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
            ringStyle,
          ]}
        />
      )}
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
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
  },
  dot: {
    position: "absolute",
  },
});
