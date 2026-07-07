import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  Switch,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
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
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { InlineNotice } from "@/components/InlineNotice";
import {
  OnboardingSlides,
  type Slide,
} from "@/components/OnboardingSlides";
import { DemoPhoneMockup } from "@/components/DemoPhoneMockup";
import { useMotionCues } from "@/hooks/useMotionCues";
import { useSettings } from "@/hooks/useSettings";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import type { MotionStyle } from "@/constants/config";

// ============================================================
// Android Onboarding Slides
// ============================================================

function AndroidSlide1Demo() {
  const { t } = useTranslation();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.center}>
      <DemoPhoneMockup />
      <Text
        style={slideStyles.heading}
        maxFontSizeMultiplier={fontScaleCaps.heading}
      >
        {t("motionCues.android.onboarding.slide1Title")}
      </Text>
      <Text
        style={slideStyles.caption}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.android.onboarding.slide1Caption")}
      </Text>
    </View>
  );
}

function AndroidSlide2Explanation() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.center}>
      <View style={slideStyles.iconBadge}>
        <Ionicons name="sync-outline" size={40} color={colors.primary} />
      </View>
      <Text
        style={slideStyles.heading}
        maxFontSizeMultiplier={fontScaleCaps.heading}
      >
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
      <Text
        style={slideStyles.source}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.android.onboarding.slide2Source")}
      </Text>
    </View>
  );
}

function AndroidSlide3Permission() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={slideStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={slideStyles.centerHorizontal}>
        <View style={slideStyles.iconBadge}>
          <Ionicons
            name="shield-checkmark-outline"
            size={40}
            color={colors.primary}
          />
        </View>
        <Text
          style={slideStyles.heading}
          maxFontSizeMultiplier={fontScaleCaps.heading}
        >
          {t("motionCues.android.onboarding.slide3Title")}
        </Text>
      </View>
      <View style={slideStyles.permissionCard}>
        <View style={slideStyles.permissionHeader}>
          <Ionicons name="layers-outline" size={20} color={colors.primary} />
          <Text
            style={slideStyles.permissionFeature}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t("motionCues.android.onboarding.slide3Feature")}
          </Text>
        </View>
        <Text
          style={slideStyles.permissionReason}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.android.onboarding.slide3Reason")}
        </Text>
      </View>
      {/* Android 11+ opens the top-level app list, not Serene's page —
          walk the user through finding it. */}
      <View style={slideStyles.steps}>
        <StepItem
          number={1}
          text={t("motionCues.android.onboarding.slide3Step1")}
        />
        <StepItem
          number={2}
          text={t("motionCues.android.onboarding.slide3Step2")}
        />
        <StepItem
          number={3}
          text={t("motionCues.android.onboarding.slide3Step3")}
        />
        <StepItem
          number={4}
          text={t("motionCues.android.onboarding.slide3Step4")}
        />
      </View>
      <View style={slideStyles.privacyRow}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.primary} />
        <Text
          style={slideStyles.privacy}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.android.onboarding.slide3Privacy")}
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================
// iOS Onboarding Slides
// ============================================================

function IOSSlide1Intro() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.center}>
      <View style={slideStyles.iconBadge}>
        <Ionicons name="logo-apple" size={44} color={colors.textPrimary} />
      </View>
      <Text
        style={slideStyles.heading}
        maxFontSizeMultiplier={fontScaleCaps.heading}
      >
        {t("motionCues.ios.onboarding.slide1Title")}
      </Text>
      <Text
        style={slideStyles.subtitle}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.ios.onboarding.slide1Subtitle")}
      </Text>
      <Text
        style={slideStyles.caption}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.ios.onboarding.slide1Description")}
      </Text>
    </View>
  );
}

function IOSSlide2Guide() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={slideStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={slideStyles.heading}
        maxFontSizeMultiplier={fontScaleCaps.heading}
      >
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
        <Text
          style={slideStyles.tip}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.ios.onboarding.slide2Tip")}
        </Text>
      </View>
    </ScrollView>
  );
}

function IOSSlide3DeepLink({ linkFailed }: { linkFailed: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.center}>
      <View style={slideStyles.iconBadge}>
        <Ionicons
          name="settings-outline"
          size={40}
          color={colors.primary}
        />
      </View>
      <Text
        style={slideStyles.heading}
        maxFontSizeMultiplier={fontScaleCaps.heading}
      >
        {t("motionCues.ios.onboarding.slide3Title")}
      </Text>
      <Text
        style={slideStyles.subtitle}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.ios.onboarding.slide3Subtitle")}
      </Text>
      {linkFailed && (
        <InlineNotice
          variant="warning"
          message={t("motionCues.ios.control.openSettingsFailed")}
          title={t("motionCues.ios.control.openSettingsFallback")}
        />
      )}
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
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.flowItem}>
      <View style={slideStyles.flowIconBox}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text
        style={slideStyles.flowText}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {text}
      </Text>
    </View>
  );
}

function StepItem({ number, text }: { number: number; text: string }) {
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.stepItem}>
      <View style={slideStyles.stepNumber}>
        <Text
          style={slideStyles.stepNumberText}
          maxFontSizeMultiplier={fontScaleCaps.control}
        >
          {number}
        </Text>
      </View>
      <Text
        style={slideStyles.stepText}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {text}
      </Text>
    </View>
  );
}

/** Returns true if a settings screen was opened. */
async function openAccessibilitySettings(): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL("App-prefs:Accessibility");
    if (supported) {
      await Linking.openURL("App-prefs:Accessibility");
      return true;
    }
  } catch {
    // Fall through to the app-settings fallback
  }
  try {
    await Linking.openURL("app-settings:");
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// Motion Style Picker (Android — Regular v1 / Dynamic v2)
// ============================================================

const MOTION_STYLE_OPTIONS = [
  {
    value: "regular",
    labelKey: "motionCues.android.control.styleRegular",
    descKey: "motionCues.android.control.styleRegularDescription",
  },
  {
    value: "dynamic",
    labelKey: "motionCues.android.control.styleDynamic",
    descKey: "motionCues.android.control.styleDynamicDescription",
  },
] as const;

function MotionStylePicker({
  value,
  onChange,
}: {
  value: MotionStyle;
  onChange: (style: MotionStyle) => void;
}) {
  const { t } = useTranslation();
  const controlStyles = useThemedStyles(createControlStyles);
  const activeDescKey = MOTION_STYLE_OPTIONS.find((o) => o.value === value)
    ?.descKey;

  return (
    <View style={controlStyles.card}>
      <Text
        style={controlStyles.cardTitle}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.android.control.styleTitle")}
      </Text>
      <View style={controlStyles.segmented} accessibilityRole="radiogroup">
        {MOTION_STYLE_OPTIONS.map(({ value: v, labelKey }) => {
          const active = value === v;
          return (
            <Pressable
              key={v}
              onPress={() => onChange(v)}
              style={[
                controlStyles.segment,
                active && controlStyles.segmentActive,
              ]}
              accessibilityRole="radio"
              accessibilityLabel={t(labelKey)}
              accessibilityState={{ checked: active }}
            >
              <Text
                style={[
                  controlStyles.segmentText,
                  active && controlStyles.segmentTextActive,
                ]}
                maxFontSizeMultiplier={fontScaleCaps.control}
              >
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {activeDescKey && (
        <Text
          style={controlStyles.cardDescription}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t(activeDescKey)}
        </Text>
      )}
    </View>
  );
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
  const tabBarClearance = useTabBarClearance();
  const { colors } = useTheme();
  const controlStyles = useThemedStyles(createControlStyles);
  const {
    hasPermission,
    hasMotionSensor,
    isActive,
    startOverlay,
    stopOverlay,
    requestAndroidPermission,
    persistError,
    clearPersistError,
  } = useMotionCues();
  const { settings, updateSettings } = useSettings();

  // Set once the user has been sent to the system settings list —
  // if they come back still without the permission, show the walk-through
  // instead of the generic ask.
  const [hasRequested, setHasRequested] = useState(false);

  const handleGrant = async () => {
    setHasRequested(true);
    await requestAndroidPermission();
  };

  const showDenied = hasRequested && !hasPermission;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        controlStyles.scroll,
        { paddingBottom: tabBarClearance },
      ]}
    >
      {persistError && (
        <InlineNotice
          variant="warning"
          message={
            persistError === "load"
              ? t("errors.storageLoad")
              : t("errors.storageSave")
          }
          dismissLabel={t("common.done")}
          onDismiss={clearPersistError}
        />
      )}

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
          <Text
            style={controlStyles.statusText}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {isActive
              ? t("motionCues.android.control.active")
              : t("motionCues.android.control.inactive")}
          </Text>
        </View>
        <Text
          style={controlStyles.statusDescription}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {isActive
            ? t("motionCues.android.control.activeDescription")
            : t("motionCues.android.control.inactiveDescription")}
        </Text>
      </View>

      {!hasMotionSensor && (
        <View style={controlStyles.warningCard}>
          <Text
            style={controlStyles.warningTitle}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t("motionCues.android.control.sensorMissing")}
          </Text>
          <Text
            style={controlStyles.warningText}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t("motionCues.android.control.sensorMissingDescription")}
          </Text>
        </View>
      )}

      {hasMotionSensor && !hasPermission && (
        <View style={controlStyles.warningCard}>
          <Text
            style={controlStyles.warningTitle}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {showDenied
              ? t("motionCues.android.control.deniedTitle")
              : t("motionCues.android.control.permissionRequired")}
          </Text>
          <Text
            style={controlStyles.warningText}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {showDenied
              ? t("motionCues.android.control.deniedDescription")
              : t("motionCues.android.control.permissionDescription")}
          </Text>
          <Button
            label={
              showDenied
                ? t("motionCues.android.control.reopenSettings")
                : t("motionCues.android.control.grantPermission")
            }
            onPress={handleGrant}
            variant="primary"
            size="md"
            fullWidth
          />
        </View>
      )}

      <MotionStylePicker
        value={settings.motionStyle}
        onChange={(style) => updateSettings({ motionStyle: style })}
      />

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
            disabled={!hasPermission || !hasMotionSensor}
          />
        )}
      </View>

      <Text
        style={controlStyles.description}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
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
  const tabBarClearance = useTabBarClearance();
  const { colors } = useTheme();
  const controlStyles = useThemedStyles(createControlStyles);
  const {
    iosOverlayEnabled,
    iosAppleCuesConfirmed,
    toggleIOSOverlay,
    persistError,
    clearPersistError,
  } = useMotionCues();
  const [linkFailed, setLinkFailed] = useState(false);

  const iosMajor =
    Platform.OS === "ios"
      ? parseInt(String(Platform.Version).split(".")[0] ?? "0", 10)
      : 0;
  const isUnsupported = Platform.OS === "ios" && iosMajor < 18;

  const handleOpenSettings = async () => {
    const opened = await openAccessibilitySettings();
    setLinkFailed(!opened);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        controlStyles.scroll,
        { paddingBottom: tabBarClearance },
      ]}
    >
      {persistError && (
        <InlineNotice
          variant="warning"
          message={
            persistError === "load"
              ? t("errors.storageLoad")
              : t("errors.storageSave")
          }
          dismissLabel={t("common.done")}
          onDismiss={clearPersistError}
        />
      )}

      {isUnsupported && (
        <View style={controlStyles.warningCard}>
          <Text
            style={controlStyles.warningText}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t("motionCues.ios.control.unsupportedVersion")}
          </Text>
        </View>
      )}

      <View style={controlStyles.card}>
        <View style={controlStyles.cardTitleRow}>
          <Ionicons name="logo-apple" size={18} color={colors.textPrimary} />
          <Text
            style={controlStyles.cardTitle}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t("motionCues.ios.control.appleCues")}
          </Text>
        </View>
        {iosAppleCuesConfirmed && (
          <View style={controlStyles.cardStatusRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.success}
            />
            <Text
              style={controlStyles.cardStatus}
              maxFontSizeMultiplier={fontScaleCaps.body}
            >
              {t("motionCues.ios.control.appleCuesEnabled")}
            </Text>
          </View>
        )}
        <Text
          style={controlStyles.cardDescription}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.ios.control.appleCuesDescription")}
        </Text>
        <Button
          label={t("motionCues.ios.control.openSettings")}
          onPress={handleOpenSettings}
          variant="outlined"
          size="md"
          fullWidth
        />
        {linkFailed && (
          <InlineNotice
            variant="warning"
            message={t("motionCues.ios.control.openSettingsFailed")}
            title={t("motionCues.ios.control.openSettingsFallback")}
          />
        )}
      </View>

      <View style={controlStyles.card}>
        <View style={controlStyles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={controlStyles.cardTitle}
              maxFontSizeMultiplier={fontScaleCaps.body}
            >
              {t("motionCues.ios.control.inAppOverlay")}
            </Text>
            <Text
              style={controlStyles.cardDescription}
              maxFontSizeMultiplier={fontScaleCaps.body}
            >
              {t("motionCues.ios.control.inAppDescription")}
            </Text>
          </View>
          <Switch
            value={iosOverlayEnabled}
            onValueChange={toggleIOSOverlay}
            trackColor={{ false: colors.sliderTrack, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel={t("motionCues.ios.control.inAppOverlay")}
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
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const {
    isFirstTime,
    completeOnboarding,
    resetOnboarding,
    requestAndroidPermission,
    confirmIOSAppleCues,
  } = useMotionCues();

  const [forceOnboarding, setForceOnboarding] = useState(false);
  const [slideLinkFailed, setSlideLinkFailed] = useState(false);

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
    return (
      <View style={[styles.container, styles.loading]}>
        <Animated.View entering={FadeIn.delay(150).duration(motion.quick)}>
          <ActivityIndicator color={colors.primary} />
        </Animated.View>
      </View>
    );
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
                variant: "outlined",
                size: "lg",
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
              render: () => <IOSSlide3DeepLink linkFailed={slideLinkFailed} />,
              primaryCta: {
                label: t("motionCues.ios.onboarding.slide3Cta"),
                onPress: async () => {
                  const opened = await openAccessibilitySettings();
                  setSlideLinkFailed(!opened);
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loading: {
      alignItems: "center",
      justifyContent: "center",
    },
  });

const createSlideStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
    },
    centerHorizontal: {
      alignItems: "center",
      gap: spacing.md,
    },
    scrollContent: {
      paddingVertical: spacing.md,
      gap: spacing.md,
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
      color: colors.textAccent,
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
      color: colors.textAccent,
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
      color: colors.textOnPrimary,
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

const createControlStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.xl,
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
      backgroundColor: colors.warningSoft,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    warningTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.warning,
    },
    warningText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
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
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    cardTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.textPrimary,
    },
    cardStatusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
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
    segmented: {
      flexDirection: "row",
      backgroundColor: colors.surfaceTinted,
      borderRadius: borderRadius.md,
      padding: 4,
      gap: 2,
    },
    segment: {
      flex: 1,
      minHeight: 48,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentActive: {
      backgroundColor: colors.primary,
    },
    segmentText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    segmentTextActive: {
      color: colors.textOnPrimary,
    },
  });
