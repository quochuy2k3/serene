import { StyleSheet, Text, View, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  lineHeights,
  spacing,
  borderRadius,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";
import { Button } from "@/components/Button";

type NoticeVariant = "error" | "warning" | "info";

type InlineNoticeProps = {
  variant: NoticeVariant;
  message: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  dismissLabel?: string;
  onDismiss?: () => void;
};

const VARIANT_ICON: Record<NoticeVariant, keyof typeof Ionicons.glyphMap> = {
  error: "alert-circle",
  warning: "warning",
  info: "information-circle",
};

export function InlineNotice({
  variant,
  message,
  title,
  actionLabel,
  onAction,
  dismissLabel,
  onDismiss,
}: InlineNoticeProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const accent =
    variant === "error"
      ? colors.error
      : variant === "warning"
        ? colors.warning
        : colors.primary;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.container, styles[`container_${variant}`]]}
      accessibilityRole="alert"
    >
      <View style={styles.row}>
        <Ionicons name={VARIANT_ICON[variant]} size={20} color={accent} />
        <View style={styles.textColumn}>
          {title ? (
            <Text
              style={styles.title}
              maxFontSizeMultiplier={fontScaleCaps.body}
            >
              {title}
            </Text>
          ) : null}
          <Text
            style={styles.message}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {message}
          </Text>
        </View>
      </View>
      {actionLabel || dismissLabel ? (
        <View style={styles.actions}>
          {actionLabel && onAction ? (
            <Button
              label={actionLabel}
              onPress={onAction}
              variant="outlined"
              size="sm"
            />
          ) : null}
          {dismissLabel && onDismiss ? (
            <Pressable
              onPress={onDismiss}
              style={styles.dismiss}
              accessibilityRole="button"
              accessibilityLabel={dismissLabel}
            >
              <Text
                style={styles.dismissLabel}
                maxFontSizeMultiplier={fontScaleCaps.control}
              >
                {dismissLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  container_error: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
  },
  container_warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
  },
  container_info: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryLight,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  textColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dismiss: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  dismissLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textAccent,
  },
});
