import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

/**
 * Returns an animated style that fades + slides up content on mount.
 * Use for screens, hero sections, or any "enter once" surface.
 *
 *   const entrance = useScreenEntrance();
 *   <Animated.View style={entrance}>...</Animated.View>
 */
export function useScreenEntrance(delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

/**
 * Same as useScreenEntrance but staggers multiple items by index.
 */
export function useStaggeredEntrance(index: number, baseDelay = 80) {
  return useScreenEntrance(index * baseDelay);
}
