import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MotionCuesModule,
  type PermissionStatus,
} from "@/modules/MotionCuesModule";
import { useSettings } from "@/hooks/useSettings";
import { resolveOverlayConfig } from "@/constants/config";

const STORAGE_KEYS = {
  firstTime: "serene_motion_cues_first_time",
  iosOverlayEnabled: "serene_ios_overlay_enabled",
  iosAppleCuesConfirmed: "serene_ios_apple_cues_confirmed",
} as const;

export function useMotionCues() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasMotionSensor, setHasMotionSensor] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [iosOverlayEnabled, setIosOverlayEnabled] = useState(false);
  const [iosAppleCuesConfirmed, setIosAppleCuesConfirmed] = useState(false);

  const { settings } = useSettings();
  const { t } = useTranslation();

  // Localized copy for the foreground-service notification (Android). Built
  // here so the native layer never has to hardcode a language.
  const overlayNotification = useCallback(
    () => ({
      title: t("motionCues.notification.title"),
      text: t("motionCues.notification.text"),
    }),
    [t]
  );

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

  // Android: probe the linear-acceleration sensor once on mount
  useEffect(() => {
    if (Platform.OS !== "android") return;
    (async () => {
      setHasMotionSensor(await MotionCuesModule.hasMotionSensor());
    })();
  }, []);

  // Android: check permission on mount and when app returns from background
  useEffect(() => {
    if (Platform.OS !== "android") return;

    let cancelled = false;

    const check = async () => {
      const status: PermissionStatus = await MotionCuesModule.checkPermission();
      if (cancelled) return;
      setHasPermission(status === "granted");
      // Resync with the real service so the UI never shows "off" while the
      // overlay is still up (e.g. after the app is reopened).
      const active = await MotionCuesModule.isOverlayActive();
      if (cancelled) return;
      setIsActive(active);
    };
    check();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        check();
      }
    });

    return () => {
      cancelled = true;
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

  // Android: start foreground service + overlay with current settings
  const startOverlay = useCallback(async () => {
    if (Platform.OS !== "android") return;
    const status = await MotionCuesModule.checkPermission();
    if (status !== "granted") {
      await MotionCuesModule.requestPermission();
      return;
    }
    MotionCuesModule.startOverlay(
      resolveOverlayConfig(settings),
      overlayNotification()
    );
    setIsActive(true);
  }, [settings, overlayNotification]);

  const stopOverlay = useCallback(() => {
    if (Platform.OS !== "android") return;
    MotionCuesModule.stopOverlay();
    setIsActive(false);
  }, []);

  // Restart the running overlay when a visual setting changes so the new
  // size/density/opacity/sensitivity take effect immediately. Excludes
  // `isActive` from deps so activation itself doesn't double-start.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!isActive) return;
    MotionCuesModule.startOverlay(
      resolveOverlayConfig(settings),
      overlayNotification()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.dotSize,
    settings.dotDensity,
    settings.sensitivity,
    settings.dotOpacity,
    settings.motionStyle,
  ]);

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
    hasMotionSensor,
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
