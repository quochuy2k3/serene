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
import type { DotSize, Sensitivity } from "@/constants/config";
import { MOTION_CUES_CONFIG } from "@/constants/config";

const STORAGE_KEY = "serene_settings";

export type Settings = {
  dotSize: DotSize;
  dotOpacity: number;
  sensitivity: Sensitivity;
};

const DEFAULT_SETTINGS: Settings = {
  dotSize: MOTION_CUES_CONFIG.defaultDotSize,
  dotOpacity: MOTION_CUES_CONFIG.defaultOpacity,
  sensitivity: MOTION_CUES_CONFIG.defaultSensitivity,
};

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  isLoaded: boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<Settings>;
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch {
        // Fall back to defaults
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
          // Ignore storage errors
        });
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ settings, updateSettings, isLoaded }),
    [settings, updateSettings, isLoaded]
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
