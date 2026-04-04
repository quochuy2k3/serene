import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from "@/constants/theme";

function AndroidMotionCues() {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>{t("motionCues.status")}</Text>
        <Text style={styles.statusValue}>{t("common.off")}</Text>
      </View>

      <Text style={styles.description}>{t("motionCues.howItWorks")}</Text>

      {/* TODO: Permission check + overlay toggle */}
      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>
          {t("motionCues.android.startOverlay")}
        </Text>
      </Pressable>
    </View>
  );
}

function IOSMotionCues() {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.description}>{t("motionCues.howItWorks")}</Text>

      {/* TODO: In-app overlay toggle */}
      {/* TODO: Apple Vehicle Motion Cues guide with screenshots */}

      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>{t("motionCues.ios.appleGuide")}</Text>
        <Text style={styles.guideIntro}>{t("motionCues.ios.guideIntro")}</Text>
        <Text style={styles.step}>1. {t("motionCues.ios.step1")}</Text>
        <Text style={styles.step}>2. {t("motionCues.ios.step2")}</Text>
        <Text style={styles.step}>3. {t("motionCues.ios.step3")}</Text>
        <Text style={styles.step}>4. {t("motionCues.ios.step4")}</Text>
      </View>

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>
          {t("motionCues.ios.openSettings")}
        </Text>
      </Pressable>
    </View>
  );
}

export default function MotionCuesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backButton}>{t("common.back")}</Text>
      </Pressable>

      <Text style={styles.title}>{t("motionCues.title")}</Text>

      {Platform.OS === "android" ? <AndroidMotionCues /> : <IOSMotionCues />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.primary,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["3xl"],
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  section: {
    flex: 1,
    gap: spacing.md,
  },
  statusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  statusLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  statusValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  guideCard: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  guideTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  guideIntro: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  step: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    paddingLeft: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    marginTop: spacing.md,
  },
  primaryButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
  },
});
