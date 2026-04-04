import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import vi from "./locales/vi.json";

const LANGUAGE_KEY = "serene_language";

export const defaultNS = "translation";
export const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const;

const getStoredLanguage = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored) return stored;
  } catch {
    // Ignore storage errors, fall through to device locale
  }
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? "en";
  return deviceLang === "vi" ? "vi" : "en";
};

const initI18n = async () => {
  const lng = await getStoredLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "en",
    defaultNS,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
};

i18n.on("languageChanged", async (lng) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // Ignore storage errors
  }
});

export const i18nPromise = initI18n();
export default i18n;
