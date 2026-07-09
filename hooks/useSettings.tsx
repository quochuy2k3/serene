import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  DotSize,
  DotDensity,
  Sensitivity,
  MotionStyle,
} from "@/constants/config";
import { MOTION_CUES_CONFIG } from "@/constants/config";

const STORAGE_KEY = "serene_settings";

export type ThemeMode = "system" | "light" | "dark";

export type Settings = {
  dotSize: DotSize;
  dotDensity: DotDensity;
  dotOpacity: number;
  sensitivity: Sensitivity;
  motionStyle: MotionStyle;
  themeMode: ThemeMode;
  reduceMotion: boolean;
  welcomeSeen: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  dotSize: MOTION_CUES_CONFIG.defaultDotSize,
  dotDensity: MOTION_CUES_CONFIG.defaultDotDensity,
  dotOpacity: MOTION_CUES_CONFIG.defaultOpacity,
  sensitivity: MOTION_CUES_CONFIG.defaultSensitivity,
  motionStyle: MOTION_CUES_CONFIG.defaultMotionStyle,
  themeMode: "system",
  reduceMotion: false,
  welcomeSeen: false,
};

export type StorageError = "load" | "save" | null;

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  isLoaded: boolean;
  storageError: StorageError;
  clearStorageError: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<StorageError>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<Settings>;
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch {
        setStorageError("load");
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateSettings = useCallback(
    async (partial: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
          setStorageError("save");
        });
        return next;
      });
    },
    []
  );

  const clearStorageError = useCallback(() => setStorageError(null), []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      isLoaded,
      storageError,
      clearStorageError,
    }),
    [settings, updateSettings, isLoaded, storageError, clearStorageError]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
