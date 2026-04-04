import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MotionCuesModule,
  type PermissionStatus,
} from "@/modules/MotionCuesModule";

const STORAGE_KEYS = {
  firstTime: "serene_motion_cues_first_time",
  iosOverlayEnabled: "serene_ios_overlay_enabled",
  iosAppleCuesConfirmed: "serene_ios_apple_cues_confirmed",
} as const;

export function useMotionCues() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [iosOverlayEnabled, setIosOverlayEnabled] = useState(false);
  const [iosAppleCuesConfirmed, setIosAppleCuesConfirmed] = useState(false);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [first, overlay, confirmed] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.firstTime),
          AsyncStorage.getItem(STORAGE_KEYS.iosOverlayEnabled),
          AsyncStorage.getItem(STORAGE_KEYS.iosAppleCuesConfirmed),
        ]);
        setIsFirstTime(first === null);
        setIosOverlayEnabled(overlay === "true");
        setIosAppleCuesConfirmed(confirmed === "true");
      } catch {
        setIsFirstTime(true);
      }
    })();
  }, []);

  // Android: check permission on mount and when app returns from background
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const check = async () => {
      const status: PermissionStatus = await MotionCuesModule.checkPermission();
      setHasPermission(status === "granted");
    };
    check();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        check();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.firstTime, "completed");
    } catch {
      // Ignore
    }
    setIsFirstTime(false);
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.firstTime);
    } catch {
      // Ignore
    }
    setIsFirstTime(true);
  }, []);

  // Android: request overlay permission (opens Settings)
  const requestAndroidPermission = useCallback(async () => {
    if (Platform.OS !== "android") return;
    await MotionCuesModule.requestPermission();
    // User is now in Settings — AppState listener will re-check on return
  }, []);

  // Android: start foreground service + overlay
  const startOverlay = useCallback(async () => {
    if (Platform.OS !== "android") return;
    const status = await MotionCuesModule.checkPermission();
    if (status !== "granted") {
      await MotionCuesModule.requestPermission();
      return;
    }
    MotionCuesModule.startOverlay();
    setIsActive(true);
  }, []);

  const stopOverlay = useCallback(() => {
    if (Platform.OS !== "android") return;
    MotionCuesModule.stopOverlay();
    setIsActive(false);
  }, []);

  // iOS: toggle in-app overlay
  const toggleIOSOverlay = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.iosOverlayEnabled,
        enabled ? "true" : "false"
      );
    } catch {
      // Ignore
    }
    setIosOverlayEnabled(enabled);
  }, []);

  // iOS: mark Apple Vehicle Motion Cues as confirmed by user
  const confirmIOSAppleCues = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.iosAppleCuesConfirmed, "true");
    } catch {
      // Ignore
    }
    setIosAppleCuesConfirmed(true);
  }, []);

  return {
    isFirstTime,
    hasPermission,
    isActive,
    iosOverlayEnabled,
    iosAppleCuesConfirmed,
    completeOnboarding,
    resetOnboarding,
    requestAndroidPermission,
    startOverlay,
    stopOverlay,
    toggleIOSOverlay,
    confirmIOSAppleCues,
  };
}
