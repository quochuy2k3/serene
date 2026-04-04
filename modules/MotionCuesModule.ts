import { NativeModules, Platform } from "react-native";

export type PermissionStatus = "granted" | "denied" | "pending";

type MotionCuesNativeModule = {
  checkPermission: () => Promise<PermissionStatus>;
  requestPermission: () => Promise<PermissionStatus>;
  startOverlay: () => void;
  stopOverlay: () => void;
};

const LINKING_ERROR =
  "MotionCuesModule is only available on Android. " +
  "Make sure you rebuilt the native project after adding the module.";

const nativeModule: MotionCuesNativeModule =
  Platform.OS === "android" && NativeModules.MotionCuesModule
    ? NativeModules.MotionCuesModule
    : (new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      ) as MotionCuesNativeModule);

export const MotionCuesModule = {
  isAvailable: Platform.OS === "android" && !!NativeModules.MotionCuesModule,

  async checkPermission(): Promise<PermissionStatus> {
    if (Platform.OS !== "android") return "granted";
    return nativeModule.checkPermission();
  },

  async requestPermission(): Promise<PermissionStatus> {
    if (Platform.OS !== "android") return "granted";
    return nativeModule.requestPermission();
  },

  startOverlay(): void {
    if (Platform.OS !== "android") return;
    nativeModule.startOverlay();
  },

  stopOverlay(): void {
    if (Platform.OS !== "android") return;
    nativeModule.stopOverlay();
  },
};
