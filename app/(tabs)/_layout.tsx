import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { PillTabBar } from "@/components/PillTabBar";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { settings } = useSettings();

  return (
    <Tabs
      // Keep scenes attached: bottom-tabs `animation` + detachInactiveScreens
      // (default true) races on rapid tab switches, leaving the incoming
      // scene detached/blank (react-navigation#12755).
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        animation: settings.reduceMotion ? "none" : "fade",
      }}
      tabBar={(props) => <PillTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: t("tabs.home") }} />
      <Tabs.Screen
        name="motion-cues"
        options={{ title: t("tabs.motion") }}
      />
      <Tabs.Screen name="settings" options={{ title: t("tabs.settings") }} />
    </Tabs>
  );
}
