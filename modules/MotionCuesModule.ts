import { NativeModules, Platform } from "react-native";

export type PermissionStatus = "granted" | "denied" | "pending";

type MotionCuesNativeModule = {
  hasMotionSensor: () => Promise<boolean>;
  checkPermission: () => Promise<PermissionStatus>;
  requestPermission: () => Promise<PermissionStatus>;
  startOverlay: () => void;
  stopOverlay: () => void;
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

  startOverlay(): void {
    if (Platform.OS !== "android") return;
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return;
    }
    nativeModule.startOverlay();
  },

  stopOverlay(): void {
    if (Platform.OS !== "android") return;
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return;
    }
    nativeModule.stopOverlay();
  },
};
