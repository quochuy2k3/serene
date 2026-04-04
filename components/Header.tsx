import { View, Text, StyleSheet, Pressable, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHaptics } from "@/hooks/useHaptics";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  letterSpacing,
  lineHeights,
} from "@/constants/theme";

type HeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  showBack?: boolean;
  onBack?: () => void;
  align?: "left" | "center";
  compact?: boolean;
  style?: ViewStyle;
};

/**
 * Shared screen header — handles safe area top padding, eyebrow, title, optional back.
 * Guarantees consistent spacing and prevents title overflow.
 */
export function Header({
  eyebrow,
  title,
  description,
  showBack = false,
  onBack,
  align = "left",
  compact = false,
  style,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();

  const handleBack = () => {
    haptics.tap();
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + (compact ? spacing.md : spacing.xl) },
        compact && styles.containerCompact,
        style,
      ]}
    >
      {showBack && (
        <Pressable
          onPress={handleBack}
          hitSlop={16}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </View>
        </Pressable>
      )}

      <View style={[align === "center" && styles.centerWrap]}>
        {eyebrow && (
          <Text
            style={[styles.eyebrow, align === "center" && styles.textCenter]}
            numberOfLines={1}
          >
            {eyebrow}
          </Text>
        )}
        <Text
          style={[styles.title, align === "center" && styles.textCenter]}
          numberOfLines={2}
          allowFontScaling={false}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              align === "center" && styles.textCenter,
            ]}
            numberOfLines={3}
          >
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  containerCompact: {
    paddingBottom: spacing.md,
  },
  backButton: {
    marginBottom: spacing.md,
    alignSelf: "flex-start",
  },
  backIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  centerWrap: {
    alignItems: "center",
  },
  eyebrow: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wide + 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: fontSizes["4xl"],
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSizes["4xl"] * lineHeights.tight,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: fontSizes.md * lineHeights.normal,
    marginTop: spacing.xs,
  },
  textCenter: {
    textAlign: "center",
  },
});
