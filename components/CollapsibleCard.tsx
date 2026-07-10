import { useState, type ReactNode } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  spacing,
  borderRadius,
  shadows,
  motion,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";

type CollapsibleCardProps = {
  title: string;
  children: ReactNode;
};

/**
 * A tappable card that expands to reveal its body — used for the
 * help/troubleshooting entries on the Motion Cues control screens.
 */
export function CollapsibleCard({ title, children }: CollapsibleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(expanded ? "180deg" : "0deg", {
          duration: motion.normal,
        }),
      },
    ],
  }));

  return (
    <Animated.View
      style={styles.card}
      layout={LinearTransition.duration(motion.normal)}
    >
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={title}
      >
        <Text
          style={styles.title}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {title}
        </Text>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View
          style={styles.body}
          entering={FadeIn.duration(motion.normal)}
          exiting={FadeOut.duration(motion.quick)}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      overflow: "hidden",
      ...shadows.xs,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      flex: 1,
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
    },
    body: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
  });
