import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Lightweight wrapper around expo-haptics.
 * Silent no-op on web; short impacts/notifications on native.
 * Exposing narrow helpers keeps intent obvious at call sites.
 */
export function useHaptics() {
  const safe = (fn: () => Promise<void> | void) => {
    if (Platform.OS === "web") return;
    try {
      fn();
    } catch {
      // Device may not support haptics — ignore silently
    }
  };

  return {
    tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    select: () => safe(() => Haptics.selectionAsync()),
    medium: () =>
      safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
    success: () =>
      safe(() =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      ),
    warning: () =>
      safe(() =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      ),
    error: () =>
      safe(() =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      ),
  };
}
