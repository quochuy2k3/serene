import { View, Text, StyleSheet, Pressable, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useHaptics } from "@/hooks/useHaptics";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  spacing,
  letterSpacing,
  lineHeights,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";

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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

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
          accessibilityLabel={t("common.back")}
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
            maxFontSizeMultiplier={fontScaleCaps.control}
          >
            {eyebrow}
          </Text>
        )}
        <Text
          style={[styles.title, align === "center" && styles.textCenter]}
          numberOfLines={2}
          maxFontSizeMultiplier={fontScaleCaps.heading}
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
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    color: colors.textAccent,
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
