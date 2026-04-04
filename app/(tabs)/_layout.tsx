import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { PillTabBar } from "@/components/PillTabBar";
import { colors } from "@/constants/theme";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
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
