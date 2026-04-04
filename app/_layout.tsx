import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { i18nPromise } from "@/i18n";
import { SettingsProvider } from "@/hooks/useSettings";
import { MotionDotsOverlay } from "@/components/MotionDotsOverlay";
import { useMotionCues } from "@/hooks/useMotionCues";
import { colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

function IOSOverlay() {
  const { iosOverlayEnabled, isFirstTime } = useMotionCues();
  const pathname = usePathname();

  if (Platform.OS !== "ios") return null;

  // Hide overlay on motion-cues/settings screens (would overlap controls)
  // and during first-time onboarding (would overlap slides).
  const hideOnScreen =
    pathname.includes("motion-cues") ||
    pathname.includes("settings") ||
    isFirstTime === true;

  if (hideOnScreen) return null;

  return <MotionDotsOverlay visible={iosOverlayEnabled} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    i18nPromise.then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nReady]);

  if ((!fontsLoaded && !fontError) || !i18nReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="audio"
              options={{
                presentation: "modal",
                animation: "fade_from_bottom",
              }}
            />
            <Stack.Screen
              name="done"
              options={{
                presentation: "modal",
                animation: "fade",
              }}
            />
          </Stack>
          <IOSOverlay />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
