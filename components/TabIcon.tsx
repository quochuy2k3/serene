import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

export type TabIconName = "home" | "motion" | "settings";

type TabIconProps = {
  name: TabIconName;
  focused: boolean;
  size?: number;
};

const ICONS: Record<TabIconName, { active: string; inactive: string }> = {
  home: { active: "home", inactive: "home-outline" },
  motion: { active: "pulse", inactive: "pulse-outline" },
  settings: { active: "settings", inactive: "settings-outline" },
};

export function TabIcon({ name, focused, size = 22 }: TabIconProps) {
  const iconName = focused ? ICONS[name].active : ICONS[name].inactive;
  const color = focused ? colors.primary : colors.textTertiary;

  return (
    <View style={styles.container}>
      <Ionicons name={iconName as never} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
