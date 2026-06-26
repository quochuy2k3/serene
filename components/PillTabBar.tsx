import { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { TabIcon, type TabIconName } from "./TabIcon";
import { useHaptics } from "@/hooks/useHaptics";
import {
  colors,
  fonts,
  spacing,
  letterSpacing,
  shadows,
} from "@/constants/theme";

/**
 * Maps route name → TabIcon name. Keep in sync with app/(tabs)/ file names.
 */
const ICON_MAP: Record<string, TabIconName> = {
  index: "home",
  "motion-cues": "motion",
  settings: "settings",
};

export const TAB_BAR_HEIGHT = 64;
const SIDE_MARGIN = spacing.xl;
const INDICATOR_PADDING = 6;

export function PillTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const haptics = useHaptics();

  const barWidth = screenWidth - SIDE_MARGIN * 2;
  const tabWidth = barWidth / state.routes.length;
  const indicatorWidth = tabWidth - INDICATOR_PADDING * 2;

  const translateX = useSharedValue(
    state.index * tabWidth + INDICATOR_PADDING
  );

  useEffect(() => {
    translateX.value = withSpring(
      state.index * tabWidth + INDICATOR_PADDING,
      {
        damping: 18,
        stiffness: 180,
        mass: 0.6,
      }
    );
  }, [state.index, tabWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom > 0 ? insets.bottom : spacing.lg,
          paddingHorizontal: SIDE_MARGIN,
        },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            width: barWidth,
            height: TAB_BAR_HEIGHT,
          },
        ]}
      >
        {/* Sliding pill indicator */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              top: INDICATOR_PADDING,
              bottom: INDICATOR_PADDING,
              left: 0,
            },
            indicatorStyle,
          ]}
        />

        {/* Tab buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;
          const iconName = ICON_MAP[route.name] ?? "home";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              haptics.select();
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tab, { width: tabWidth }]}
            >
              <TabIcon name={iconName} focused={isFocused} size={22} />
              <Text
                style={[
                  styles.label,
                  isFocused && styles.labelActive,
                ]}
                numberOfLines={1}
              >
                {String(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 999, // Pill shape
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
    overflow: "hidden",
    ...shadows.lg,
  },
  indicator: {
    position: "absolute",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
  },
  tab: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  },
  labelActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
});
