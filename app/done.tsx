import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  letterSpacing,
  lineHeights,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { Button } from "@/components/Button";

export default function DoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing["2xl"],
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Decorative check badge */}
        <View style={styles.badgeOuter}>
          <View style={styles.badgeInner}>
            <Text style={styles.badgeCheck}>✓</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>{t("done.eyebrow")}</Text>
        <Text style={styles.title}>{t("done.title")}</Text>
        <Text style={styles.message}>{t("done.message")}</Text>

        <View style={styles.durationCard}>
          <Text style={styles.durationLabel}>{t("done.durationLabel")}</Text>
          <Text style={styles.durationValue}>{t("done.effectDuration")}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label={t("done.enableMotionCues")}
          onPress={() => router.replace("/(tabs)/motion-cues")}
          variant="primary"
          size="lg"
          fullWidth
        />
        <Button
          label={t("done.backHome")}
          onPress={() => router.replace("/(tabs)")}
          variant="ghost"
          size="md"
          fullWidth
        />
      </View>

      <Text style={styles.disclaimer}>{t("done.disclaimer")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  badgeInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  badgeCheck: {
    fontSize: 44,
    color: colors.textInverse,
    fontFamily: fonts.bold,
    lineHeight: 48,
  },
  eyebrow: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wide + 0.5,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: fontSizes["4xl"],
    color: colors.textPrimary,
    textAlign: "center",
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSizes["4xl"] * lineHeights.tight,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: fontSizes.md * lineHeights.normal,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  durationCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    ...shadows.xs,
  },
  durationLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wide + 0.5,
    marginBottom: 2,
  },
  durationValue: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  disclaimer: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    textAlign: "center",
    lineHeight: fontSizes.xs * lineHeights.relaxed,
  },
});
