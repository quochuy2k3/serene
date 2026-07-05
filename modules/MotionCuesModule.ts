import { NativeModules, Platform } from "react-native";
import type { OverlayConfig } from "@/constants/config";

export type PermissionStatus = "granted" | "denied" | "pending";

type MotionCuesNativeModule = {
  hasMotionSensor: () => Promise<boolean>;
  checkPermission: () => Promise<PermissionStatus>;
  requestPermission: () => Promise<PermissionStatus>;
  startOverlay: (
    dotSizeDp: number,
    sensitivity: number,
    dotCount: number,
    opacity: number,
    style: string,
    flowParams: string,
    notifTitle: string,
    notifText: string
  ) => void;
  stopOverlay: () => void;
  isOverlayActive: () => Promise<boolean>;
};

/** Localized foreground-service notification copy (source: i18next). */
export type OverlayNotification = {
  title: string;
  text: string;
};

const isAvailable =
  Platform.OS === "android" && !!NativeModules.MotionCuesModule;

const nativeModule = NativeModules.MotionCuesModule as
  | MotionCuesNativeModule
  | undefined;

let hasWarned = false;
function warnMissing(): void {
  if (hasWarned) return;
  hasWarned = true;
  console.warn(
    "MotionCuesModule native module not found. " +
      "Rebuild the Android project (npx expo prebuild --platform android --clean && npx expo run:android). " +
      "Overlay features are disabled until then."
  );
}

export const MotionCuesModule = {
  isAvailable,

  // Whether the device exposes the linear-acceleration sensor the overlay
  // relies on. Returns true when we can't determine it (non-Android or the
  // native module isn't built yet) so we don't falsely flag a device as
  // unsupported — the permission path surfaces the missing-module case.
  async hasMotionSensor(): Promise<boolean> {
    if (Platform.OS !== "android") return true;
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return true;
    }
    return nativeModule.hasMotionSensor();
  },

  async checkPermission(): Promise<PermissionStatus> {
    if (Platform.OS !== "android") return "granted";
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return "denied";
    }
    return nativeModule.checkPermission();
  },

  async requestPermission(): Promise<PermissionStatus> {
    if (Platform.OS !== "android") return "granted";
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return "denied";
    }
    return nativeModule.requestPermission();
  },

  startOverlay(config: OverlayConfig, notification: OverlayNotification): void {
    if (Platform.OS !== "android") return;
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return;
    }
    nativeModule.startOverlay(
      config.dotSizeDp,
      config.sensitivity,
      config.dotCount,
      config.opacity,
      config.style,
      JSON.stringify(config.flow),
      notification.title,
      notification.text
    );
  },

  stopOverlay(): void {
    if (Platform.OS !== "android") return;
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return;
    }
    nativeModule.stopOverlay();
  },

  // Whether the native overlay service is currently running. Lets the UI
  // resync its on/off state with reality after the app is reopened.
  async isOverlayActive(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return false;
    }
    return nativeModule.isOverlayActive();
  },
};
