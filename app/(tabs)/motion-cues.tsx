import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  Switch,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  letterSpacing,
  lineHeights,
} from "@/constants/theme";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { PulsingDot } from "@/components/PulsingDot";
import {
  OnboardingSlides,
  type Slide,
} from "@/components/OnboardingSlides";
import { DemoPhoneMockup } from "@/components/DemoPhoneMockup";
import { useMotionCues } from "@/hooks/useMotionCues";

const TAB_BAR_CLEARANCE = 120;

// ============================================================
// Android Onboarding Slides
// ============================================================

function AndroidSlide1Demo() {
  const { t } = useTranslation();
  return (
    <View style={slideStyles.center}>
      <DemoPhoneMockup />
      <Text style={slideStyles.heading}>
        {t("motionCues.android.onboarding.slide1Title")}
      </Text>
      <Text style={slideStyles.caption}>
        {t("motionCues.android.onboarding.slide1Caption")}
      </Text>
    </View>
  );
}

function AndroidSlide2Explanation() {
  const { t } = useTranslation();
  return (
    <View style={slideStyles.center}>
      <View style={slideStyles.iconBadge}>
        <Ionicons name="sync-outline" size={40} color={colors.primary} />
      </View>
      <Text style={slideStyles.heading}>
        {t("motionCues.android.onboarding.slide2Title")}
      </Text>
      <View style={slideStyles.flowList}>
        <FlowItem
          icon="eye-outline"
          text={t("motionCues.android.onboarding.slide2Eye")}
        />
        <View style={slideStyles.flowArrow} />
        <FlowItem
          icon="ear-outline"
          text={t("motionCues.android.onboarding.slide2Ear")}
        />
        <View style={slideStyles.flowArrow} />
        <FlowItem
          icon="sparkles-outline"
          text={t("motionCues.android.onboarding.slide2Brain")}
        />
      </View>
      <Text style={slideStyles.source}>
        {t("motionCues.android.onboarding.slide2Source")}
      </Text>
    </View>
  );
}

function AndroidSlide3Permission() {
  const { t } = useTranslation();
  return (
    <View style={slideStyles.center}>
      <View style={slideStyles.iconBadge}>
        <Ionicons
          name="shield-checkmark-outline"
          size={40}
          color={colors.primary}
        />
      </View>
      <Text style={slideStyles.heading}>
        {t("motionCues.android.onboarding.slide3Title")}
      </Text>
      <View style={slideStyles.permissionCard}>
        <View style={slideStyles.permissionHeader}>
          <Ionicons name="layers-outline" size={20} color={colors.primary} />
          <Text style={slideStyles.permissionFeature}>
            {t("motionCues.android.onboarding.slide3Feature")}
          </Text>
        </View>
        <Text style={slideStyles.permissionReason}>
          {t("motionCues.android.onboarding.slide3Reason")}
        </Text>
      </View>
      <View style={slideStyles.privacyRow}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.primary} />
        <Text style={slideStyles.privacy}>
          {t("motionCues.android.onboarding.slide3Privacy")}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// iOS Onboarding Slides
// ============================================================

function IOSSlide1Intro() {
  const { t } = useTranslation();
  return (
    <View style={slideStyles.center}>
      <View style={slideStyles.iconBadge}>
        <Ionicons name="logo-apple" size={44} color={colors.textPrimary} />
      </View>
      <Text style={slideStyles.heading}>
        {t("motionCues.ios.onboarding.slide1Title")}
      </Text>
      <Text style={slideStyles.subtitle}>
        {t("motionCues.ios.onboarding.slide1Subtitle")}
      </Text>
      <Text style={slideStyles.caption}>
        {t("motionCues.ios.onboarding.slide1Description")}
      </Text>
    </View>
  );
}

function IOSSlide2Guide() {
  const { t } = useTranslation();
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={slideStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={slideStyles.heading}>
        {t("motionCues.ios.onboarding.slide2Title")}
      </Text>
      <View style={slideStyles.steps}>
        <StepItem
          number={1}
          text={t("motionCues.ios.onboarding.slide2Step1")}
        />
        <StepItem
          number={2}
          text={t("motionCues.ios.onboarding.slide2Step2")}
        />
        <StepItem
          number={3}
          text={t("motionCues.ios.onboarding.slide2Step3")}
        />
        <StepItem
          number={4}
          text={t("motionCues.ios.onboarding.slide2Step4")}
        />
      </View>
      <View style={slideStyles.tipRow}>
        <Ionicons
          name="bulb-outline"
          size={14}
          color={colors.textTertiary}
        />
        <Text style={slideStyles.tip}>
          {t("motionCues.ios.onboarding.slide2Tip")}
        </Text>
      </View>
    </ScrollView>
  );
}

function IOSSlide3DeepLink() {
  const { t } = useTranslation();
  return (
    <View style={slideStyles.center}>
      <View style={slideStyles.iconBadge}>
        <Ionicons
          name="settings-outline"
          size={40}
          color={colors.primary}
        />
      </View>
      <Text style={slideStyles.heading}>
        {t("motionCues.ios.onboarding.slide3Title")}
      </Text>
      <Text style={slideStyles.subtitle}>
        {t("motionCues.ios.onboarding.slide3Subtitle")}
      </Text>
    </View>
  );
}

// ============================================================
// Helpers
// ============================================================

function FlowItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={slideStyles.flowItem}>
      <View style={slideStyles.flowIconBox}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={slideStyles.flowText}>{text}</Text>
    </View>
  );
}

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={slideStyles.stepItem}>
      <View style={slideStyles.stepNumber}>
        <Text style={slideStyles.stepNumberText}>{number}</Text>
      </View>
      <Text style={slideStyles.stepText}>{text}</Text>
    </View>
  );
}

async function openAccessibilitySettings(): Promise<void> {
  try {
    const supported = await Linking.canOpenURL("App-prefs:Accessibility");
    if (supported) {
      await Linking.openURL("App-prefs:Accessibility");
      return;
    }
  } catch {
    // Fall through
  }
  try {
    await Linking.openURL("app-settings:");
  } catch {
    // Ignore
  }
}

// ============================================================
// Android Control Screen
// ============================================================

function AndroidControlScreen({
  onReviewGuide,
}: {
  onReviewGuide: () => void;
}) {
  const { t } = useTranslation();
  const {
    hasPermission,
    isActive,
    startOverlay,
    stopOverlay,
    requestAndroidPermission,
  } = useMotionCues();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={controlStyles.scroll}
    >
      <View
        style={[
          controlStyles.statusCard,
          isActive && controlStyles.statusCardActive,
        ]}
      >
        <View style={controlStyles.statusRow}>
          <View
            style={[
              controlStyles.statusDot,
              { backgroundColor: isActive ? colors.success : colors.secondary },
            ]}
          />
          <Text style={controlStyles.statusText}>
            {isActive
              ? t("motionCues.android.control.active")
              : t("motionCues.android.control.inactive")}
          </Text>
        </View>
        <Text style={controlStyles.statusDescription}>
          {isActive
            ? t("motionCues.android.control.activeDescription")
            : t("motionCues.android.control.inactiveDescription")}
        </Text>
      </View>

      {!hasPermission && (
        <View style={controlStyles.warningCard}>
          <Text style={controlStyles.warningTitle}>
            {t("motionCues.android.control.permissionRequired")}
          </Text>
          <Text style={controlStyles.warningText}>
            {t("motionCues.android.control.permissionDescription")}
          </Text>
          <Button
            label={t("motionCues.android.control.grantPermission")}
            onPress={requestAndroidPermission}
            variant="primary"
            size="md"
            fullWidth
          />
        </View>
      )}

      <View style={controlStyles.actionButton}>
        {isActive ? (
          <Button
            label={t("motionCues.android.control.stopOverlay")}
            onPress={stopOverlay}
            variant="outlined"
            size="lg"
            fullWidth
          />
        ) : (
          <Button
            label={t("motionCues.android.control.startOverlay")}
            onPress={startOverlay}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!hasPermission}
          />
        )}
      </View>

      <Text style={controlStyles.description}>
        {t("motionCues.howItWorks")}
      </Text>

      <Button
        label={t("motionCues.reviewGuide")}
        onPress={onReviewGuide}
        variant="ghost"
        size="md"
        fullWidth
      />
    </ScrollView>
  );
}

// ============================================================
// iOS Control Screen
// ============================================================

function IOSControlScreen({
  onReviewGuide,
}: {
  onReviewGuide: () => void;
}) {
  const { t } = useTranslation();
  const {
    iosOverlayEnabled,
    iosAppleCuesConfirmed,
    toggleIOSOverlay,
  } = useMotionCues();

  const iosMajor =
    Platform.OS === "ios"
      ? parseInt(String(Platform.Version).split(".")[0] ?? "0", 10)
      : 0;
  const isUnsupported = Platform.OS === "ios" && iosMajor < 18;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={controlStyles.scroll}
    >
      {isUnsupported && (
        <View style={controlStyles.warningCard}>
          <Text style={controlStyles.warningText}>
            {t("motionCues.ios.control.unsupportedVersion")}
          </Text>
        </View>
      )}

      <View style={controlStyles.card}>
        <Text style={controlStyles.cardTitle}>
          🍎 {t("motionCues.ios.control.appleCues")}
        </Text>
        {iosAppleCuesConfirmed && (
          <Text style={controlStyles.cardStatus}>
            ✓ {t("motionCues.ios.control.appleCuesEnabled")}
          </Text>
        )}
        <Text style={controlStyles.cardDescription}>
          {t("motionCues.ios.control.appleCuesDescription")}
        </Text>
        <Button
          label={t("motionCues.ios.control.openSettings")}
          onPress={openAccessibilitySettings}
          variant="outlined"
          size="md"
          fullWidth
        />
      </View>

      <View style={controlStyles.card}>
        <View style={controlStyles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={controlStyles.cardTitle}>
              {t("motionCues.ios.control.inAppOverlay")}
            </Text>
            <Text style={controlStyles.cardDescription}>
              {t("motionCues.ios.control.inAppDescription")}
            </Text>
          </View>
          <Switch
            value={iosOverlayEnabled}
            onValueChange={toggleIOSOverlay}
            trackColor={{ false: colors.neutralDark, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <Button
        label={t("motionCues.reviewGuide")}
        onPress={onReviewGuide}
        variant="ghost"
        size="md"
        fullWidth
      />
    </ScrollView>
  );
}

// ============================================================
// Main Screen
// ============================================================

export default function MotionCuesScreen() {
  const { t } = useTranslation();
  const {
    isFirstTime,
    completeOnboarding,
    resetOnboarding,
    requestAndroidPermission,
    confirmIOSAppleCues,
  } = useMotionCues();

  const [forceOnboarding, setForceOnboarding] = useState(false);

  const showOnboarding = isFirstTime === true || forceOnboarding;

  const handleComplete = useCallback(async () => {
    await completeOnboarding();
    setForceOnboarding(false);
  }, [completeOnboarding]);

  const handleReview = useCallback(async () => {
    await resetOnboarding();
    setForceOnboarding(true);
  }, [resetOnboarding]);

  if (isFirstTime === null) {
    return <View style={styles.container} />;
  }

  if (showOnboarding) {
    const slides: Slide[] =
      Platform.OS === "android"
        ? [
            {
              key: "a1",
              render: () => <AndroidSlide1Demo />,
              primaryCta: {
                label: t("common.next"),
                onPress: () => {},
              },
            },
            {
              key: "a2",
              render: () => <AndroidSlide2Explanation />,
              primaryCta: {
                label: t("common.next"),
                onPress: () => {},
              },
            },
            {
              key: "a3",
              render: () => <AndroidSlide3Permission />,
              primaryCta: {
                label: t("motionCues.android.onboarding.slide3Grant"),
                onPress: async () => {
                  await requestAndroidPermission();
                  await handleComplete();
                },
              },
              secondaryCta: {
                label: t("motionCues.android.onboarding.slide3Later"),
                onPress: handleComplete,
              },
            },
          ]
        : [
            {
              key: "i1",
              render: () => <IOSSlide1Intro />,
              primaryCta: {
                label: t("motionCues.ios.onboarding.slide1Cta"),
                onPress: () => {},
              },
            },
            {
              key: "i2",
              render: () => <IOSSlide2Guide />,
              primaryCta: {
                label: t("motionCues.ios.onboarding.slide2Cta"),
                onPress: () => {},
              },
            },
            {
              key: "i3",
              render: () => <IOSSlide3DeepLink />,
              primaryCta: {
                label: t("motionCues.ios.onboarding.slide3Cta"),
                onPress: async () => {
                  await openAccessibilitySettings();
                },
              },
              secondaryCta: {
                label: t("motionCues.ios.onboarding.slide3Confirm"),
                onPress: async () => {
                  await confirmIOSAppleCues();
                  await handleComplete();
                },
              },
            },
          ];

    return (
      <View style={styles.container}>
        <Header
          eyebrow={t("motionCues.eyebrow")}
          title={t("motionCues.title")}
          compact
        />
        <OnboardingSlides slides={slides} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        eyebrow={t("motionCues.eyebrow")}
        title={t("motionCues.title")}
        description={t("motionCues.howItWorks")}
      />

      {Platform.OS === "android" ? (
        <AndroidControlScreen onReviewGuide={handleReview} />
      ) : (
        <IOSControlScreen onReviewGuide={handleReview} />
      )}
    </View>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

const slideStyles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["2xl"],
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.primary,
    textAlign: "center",
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  flowList: {
    alignItems: "center",
    marginVertical: spacing.md,
    gap: spacing.xs,
  },
  flowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 260,
    ...shadows.xs,
  },
  flowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  flowText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    flex: 1,
  },
  flowArrow: {
    width: 2,
    height: 18,
    backgroundColor: colors.secondary,
    marginVertical: 2,
  },
  source: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
    fontStyle: "italic",
  },
  permissionCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    width: "100%",
    ...shadows.sm,
  },
  permissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  permissionFeature: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  permissionReason: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  privacy: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.primary,
    textAlign: "center",
    flex: 1,
  },
  steps: {
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
  },
  stepText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    flex: 1,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tip: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
});

const controlStyles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  statusCardActive: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  statusDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  warningCard: {
    backgroundColor: "#FFF8E1",
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  warningTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: "#8D6E00",
  },
  warningText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: "#8D6E00",
    lineHeight: 20,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  cardStatus: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.success,
  },
  cardDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
});
