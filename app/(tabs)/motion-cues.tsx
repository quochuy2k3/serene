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
  type LayoutChangeEvent,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  letterSpacing,
  spacing,
  borderRadius,
  shadows,
  motion,
  springs,
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
import {
  SettingsPathMockup,
  useStageLoop,
} from "@/components/SettingsPathMockup";
import { CollapsibleCard } from "@/components/CollapsibleCard";
import { PulsingDot } from "@/components/PulsingDot";
import { useMotionCues } from "@/hooks/useMotionCues";
import { useSettings } from "@/hooks/useSettings";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { useStaggeredEntrance } from "@/hooks/useScreenEntrance";
import type { MotionStyle } from "@/constants/config";

// ============================================================
// Android Onboarding Slides
// ============================================================

function AndroidSlideDemo({ focused }: { focused: boolean }) {
  const { t } = useTranslation();
  const slideStyles = useThemedStyles(createSlideStyles);
  // Pause the demo loop when the slide is offscreen or another tab is open
  // (tab scenes stay mounted because of detachInactiveScreens={false}).
  const tabFocused = useIsFocused();
  return (
    <View style={slideStyles.center}>
      <Animated.View entering={FadeInDown.duration(motion.slow)}>
        <DemoPhoneMockup paused={!focused || !tabFocused} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120).duration(motion.slow)}>
        <Text
          style={slideStyles.heading}
          maxFontSizeMultiplier={fontScaleCaps.heading}
        >
          {t("motionCues.android.onboarding.slide1Title")}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(220).duration(motion.slow)}>
        <Text
          style={slideStyles.caption}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.android.onboarding.slide1Caption")}
        </Text>
      </Animated.View>
    </View>
  );
}

function AndroidSlideExplanation() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.center}>
      <Animated.View
        entering={FadeInDown.duration(motion.slow)}
        style={slideStyles.iconBadge}
      >
        <Ionicons name="sync-outline" size={40} color={colors.primary} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100).duration(motion.slow)}>
        <Text
          style={slideStyles.heading}
          maxFontSizeMultiplier={fontScaleCaps.heading}
        >
          {t("motionCues.android.onboarding.slide2Title")}
        </Text>
      </Animated.View>
      <View style={slideStyles.flowList}>
        <Animated.View entering={FadeInDown.delay(180).duration(motion.slow)}>
          <FlowItem
            icon="eye-outline"
            text={t("motionCues.android.onboarding.slide2Eye")}
          />
        </Animated.View>
        <View style={slideStyles.flowArrow} />
        <Animated.View entering={FadeInDown.delay(280).duration(motion.slow)}>
          <FlowItem
            icon="ear-outline"
            text={t("motionCues.android.onboarding.slide2Ear")}
          />
        </Animated.View>
        <View style={slideStyles.flowArrow} />
        <Animated.View entering={FadeInDown.delay(380).duration(motion.slow)}>
          <FlowItem
            icon="sparkles-outline"
            text={t("motionCues.android.onboarding.slide2Brain")}
          />
        </Animated.View>
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

function AndroidSlidePermission({ focused }: { focused: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  const tabFocused = useIsFocused();
  // One looping timeline drives the mockup highlight and the step list.
  const stage = useStageLoop(4, focused && tabFocused);
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
      <SettingsPathMockup variant="android" stage={stage} />
      {/* Android 11+ opens the top-level app list, not Serene's page —
          walk the user through finding it. */}
      <View style={slideStyles.steps}>
        <StepItem
          number={1}
          text={t("motionCues.android.onboarding.slide3Step1")}
          active={stage === 0}
        />
        <StepItem
          number={2}
          text={t("motionCues.android.onboarding.slide3Step2")}
          active={stage === 1}
        />
        <StepItem
          number={3}
          text={t("motionCues.android.onboarding.slide3Step3")}
          active={stage === 2}
        />
        <StepItem
          number={4}
          text={t("motionCues.android.onboarding.slide3Step4")}
          active={stage === 3}
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
// Shared "Best results" Tips Slide
// ============================================================

const TIP_ITEMS = [
  { icon: "time-outline", key: "motionCues.tips.tip1" },
  { icon: "phone-portrait-outline", key: "motionCues.tips.tip2" },
  { icon: "headset-outline", key: "motionCues.tips.tip3" },
  { icon: "sunny-outline", key: "motionCues.tips.tip4" },
] as const;

function TipsSlide() {
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
          <Ionicons name="sparkles-outline" size={40} color={colors.primary} />
        </View>
        <Text
          style={slideStyles.heading}
          maxFontSizeMultiplier={fontScaleCaps.heading}
        >
          {t("motionCues.tips.title")}
        </Text>
        <Text
          style={slideStyles.caption}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.tips.subtitle")}
        </Text>
      </View>
      <View style={slideStyles.tipsList}>
        {TIP_ITEMS.map(({ icon, key }, i) => (
          <Animated.View
            key={key}
            entering={FadeInDown.delay(120 + i * 90).duration(motion.slow)}
          >
            <FlowItem icon={icon} text={t(key)} />
          </Animated.View>
        ))}
      </View>
      <Text
        style={slideStyles.source}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.tips.disclaimer")}
      </Text>
    </ScrollView>
  );
}

// ============================================================
// iOS Onboarding Slides
// ============================================================

function IOSSlideIntro() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.center}>
      <Animated.View
        entering={FadeInDown.duration(motion.slow)}
        style={slideStyles.iconBadge}
      >
        <Ionicons name="logo-apple" size={44} color={colors.textPrimary} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100).duration(motion.slow)}>
        <Text
          style={slideStyles.heading}
          maxFontSizeMultiplier={fontScaleCaps.heading}
        >
          {t("motionCues.ios.onboarding.slide1Title")}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(motion.slow)}>
        <Text
          style={slideStyles.subtitle}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.ios.onboarding.slide1Subtitle")}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(300).duration(motion.slow)}>
        <Text
          style={slideStyles.caption}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.ios.onboarding.slide1Description")}
        </Text>
      </Animated.View>
    </View>
  );
}

function IOSSlideGuide({ focused }: { focused: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  const tabFocused = useIsFocused();
  // One looping timeline drives the mockup highlight and the step list.
  const stage = useStageLoop(4, focused && tabFocused);
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
      <SettingsPathMockup variant="ios" stage={stage} />
      <View style={slideStyles.steps}>
        <StepItem
          number={1}
          text={t("motionCues.ios.onboarding.slide2Step1")}
          active={stage === 0}
        />
        <StepItem
          number={2}
          text={t("motionCues.ios.onboarding.slide2Step2")}
          active={stage === 1}
        />
        <StepItem
          number={3}
          text={t("motionCues.ios.onboarding.slide2Step3")}
          active={stage === 2}
        />
        <StepItem
          number={4}
          text={t("motionCues.ios.onboarding.slide2Step4")}
          active={stage === 3}
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

function IOSSlideDeepLink({ linkFailed }: { linkFailed: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  return (
    <View style={slideStyles.center}>
      <Animated.View
        entering={FadeInDown.duration(motion.slow)}
        style={slideStyles.iconBadge}
      >
        <Ionicons
          name="settings-outline"
          size={40}
          color={colors.primary}
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100).duration(motion.slow)}>
        <Text
          style={slideStyles.heading}
          maxFontSizeMultiplier={fontScaleCaps.heading}
        >
          {t("motionCues.ios.onboarding.slide3Title")}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(motion.slow)}>
        <Text
          style={slideStyles.subtitle}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.ios.onboarding.slide3Subtitle")}
        </Text>
      </Animated.View>
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

function StepItem({
  number,
  text,
  active,
}: {
  number: number;
  text: string;
  /** When set, the number chip animates between highlighted and dimmed. */
  active?: boolean;
}) {
  const { colors } = useTheme();
  const slideStyles = useThemedStyles(createSlideStyles);
  const isStatic = active === undefined;

  const chipStyle = useAnimatedStyle(() => {
    if (isStatic) {
      return {};
    }
    return {
      backgroundColor: withTiming(
        active ? colors.primary : colors.surfaceTinted,
        { duration: motion.normal }
      ),
      // Emphasize by shrinking the inactive chips — scaling the active one
      // up would poke past the slide ScrollView's bounds and get clipped.
      transform: [
        { scale: withTiming(active ? 1 : 0.92, { duration: motion.normal }) },
      ],
    };
  }, [active, isStatic, colors]);

  const numberStyle = useAnimatedStyle(() => {
    if (isStatic) {
      return {};
    }
    return {
      color: withTiming(active ? colors.textOnPrimary : colors.textSecondary, {
        duration: motion.normal,
      }),
    };
  }, [active, isStatic, colors]);

  return (
    <View style={slideStyles.stepItem}>
      <Animated.View style={[slideStyles.stepNumber, chipStyle]}>
        <Animated.Text
          style={[slideStyles.stepNumberText, numberStyle]}
          maxFontSizeMultiplier={fontScaleCaps.control}
        >
          {number}
        </Animated.Text>
      </Animated.View>
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
// Help & Troubleshooting Section
// ============================================================

const ANDROID_HELP = [
  ["motionCues.android.help.q1", "motionCues.android.help.a1"],
  ["motionCues.android.help.q2", "motionCues.android.help.a2"],
  ["motionCues.android.help.q3", "motionCues.android.help.a3"],
  ["motionCues.android.help.q4", "motionCues.android.help.a4"],
] as const;

const IOS_HELP = [
  ["motionCues.ios.help.q1", "motionCues.ios.help.a1"],
  ["motionCues.ios.help.q2", "motionCues.ios.help.a2"],
  ["motionCues.ios.help.q3", "motionCues.ios.help.a3"],
] as const;

function HelpSection({ items }: { items: typeof ANDROID_HELP | typeof IOS_HELP }) {
  const { t } = useTranslation();
  const controlStyles = useThemedStyles(createControlStyles);
  return (
    <View style={controlStyles.helpSection}>
      <Text
        style={controlStyles.sectionLabel}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.helpTitle")}
      </Text>
      {items.map(([q, a]) => (
        <CollapsibleCard key={q} title={t(q)}>
          <Text
            style={controlStyles.helpBody}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t(a)}
          </Text>
        </CollapsibleCard>
      ))}
    </View>
  );
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

const SEGMENT_PADDING = 4;
const SEGMENT_GAP = 2;

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const controlStyles = useThemedStyles(createControlStyles);

  const labelStyle = useAnimatedStyle(
    () => ({
      color: withTiming(active ? colors.textOnPrimary : colors.textSecondary, {
        duration: motion.normal,
      }),
    }),
    [active, colors]
  );

  return (
    <Pressable
      onPress={onPress}
      style={controlStyles.segment}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: active }}
    >
      <Animated.Text
        style={[controlStyles.segmentText, labelStyle]}
        maxFontSizeMultiplier={fontScaleCaps.control}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

function MotionStylePicker({
  value,
  onChange,
}: {
  value: MotionStyle;
  onChange: (style: MotionStyle) => void;
}) {
  const { t } = useTranslation();
  const controlStyles = useThemedStyles(createControlStyles);
  const [trackWidth, setTrackWidth] = useState(0);

  const index = Math.max(
    0,
    MOTION_STYLE_OPTIONS.findIndex((o) => o.value === value)
  );
  const activeDescKey = MOTION_STYLE_OPTIONS[index].descKey;

  const thumbWidth =
    trackWidth > 0
      ? (trackWidth - SEGMENT_PADDING * 2 - SEGMENT_GAP) /
        MOTION_STYLE_OPTIONS.length
      : 0;

  const thumbStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: withSpring(
            index * (thumbWidth + SEGMENT_GAP),
            springs.pill
          ),
        },
      ],
    }),
    [index, thumbWidth]
  );

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={controlStyles.card}>
      <Text
        style={controlStyles.cardTitle}
        maxFontSizeMultiplier={fontScaleCaps.body}
      >
        {t("motionCues.android.control.styleTitle")}
      </Text>
      <View
        style={controlStyles.segmented}
        accessibilityRole="radiogroup"
        onLayout={handleTrackLayout}
      >
        {thumbWidth > 0 && (
          <Animated.View
            style={[
              controlStyles.segmentThumb,
              { width: thumbWidth },
              thumbStyle,
            ]}
          />
        )}
        {MOTION_STYLE_OPTIONS.map(({ value: v, labelKey }) => (
          <Segment
            key={v}
            label={t(labelKey)}
            active={value === v}
            onPress={() => onChange(v)}
          />
        ))}
      </View>
      <Animated.View
        key={activeDescKey}
        entering={FadeIn.duration(motion.normal)}
      >
        <Text
          style={controlStyles.cardDescription}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t(activeDescKey)}
        </Text>
      </Animated.View>
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
  const tabFocused = useIsFocused();

  const statusEntrance = useStaggeredEntrance(0);
  const pickerEntrance = useStaggeredEntrance(1);
  const actionEntrance = useStaggeredEntrance(2);
  const helpEntrance = useStaggeredEntrance(3);

  // Set once the user has been sent to the system settings list —
  // if they come back still without the permission, show the walk-through
  // instead of the generic ask.
  const [hasRequested, setHasRequested] = useState(false);

  const handleGrant = async () => {
    setHasRequested(true);
    await requestAndroidPermission();
  };

  const showDenied = hasRequested && !hasPermission;

  const statusBorderStyle = useAnimatedStyle(
    () => ({
      borderLeftColor: withTiming(
        isActive ? colors.success : colors.surface,
        { duration: motion.normal }
      ),
    }),
    [isActive, colors]
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        controlStyles.scroll,
        { paddingBottom: tabBarClearance },
      ]}
    >
      {persistError && (
        <Animated.View
          entering={FadeIn.duration(motion.normal)}
          exiting={FadeOut.duration(motion.quick)}
          layout={LinearTransition.duration(motion.normal)}
        >
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
        </Animated.View>
      )}

      <Animated.View
        style={[controlStyles.statusCard, statusBorderStyle, statusEntrance]}
        layout={LinearTransition.duration(motion.normal)}
      >
        <View style={controlStyles.statusRow}>
          <PulsingDot
            color={isActive ? colors.success : colors.secondary}
            size={8}
            pulse={isActive && tabFocused}
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
      </Animated.View>

      {!hasMotionSensor && (
        <Animated.View
          style={controlStyles.warningCard}
          entering={FadeIn.duration(motion.normal)}
          exiting={FadeOut.duration(motion.quick)}
          layout={LinearTransition.duration(motion.normal)}
        >
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
        </Animated.View>
      )}

      {hasMotionSensor && !hasPermission && (
        <Animated.View
          style={controlStyles.warningCard}
          entering={FadeIn.duration(motion.normal)}
          exiting={FadeOut.duration(motion.quick)}
          layout={LinearTransition.duration(motion.normal)}
        >
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
        </Animated.View>
      )}

      <Animated.View
        style={pickerEntrance}
        layout={LinearTransition.duration(motion.normal)}
      >
        <MotionStylePicker
          value={settings.motionStyle}
          onChange={(style) => updateSettings({ motionStyle: style })}
        />
      </Animated.View>

      <Animated.View
        style={[controlStyles.actionButton, actionEntrance]}
        layout={LinearTransition.duration(motion.normal)}
      >
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
      </Animated.View>

      <Animated.View
        style={helpEntrance}
        layout={LinearTransition.duration(motion.normal)}
      >
        <Text
          style={controlStyles.description}
          maxFontSizeMultiplier={fontScaleCaps.body}
        >
          {t("motionCues.howItWorks")}
        </Text>

        <HelpSection items={ANDROID_HELP} />

        <Button
          label={t("motionCues.reviewGuide")}
          onPress={onReviewGuide}
          variant="ghost"
          size="md"
          fullWidth
        />
      </Animated.View>
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

  const appleCardEntrance = useStaggeredEntrance(0);
  const overlayCardEntrance = useStaggeredEntrance(1);
  const helpEntrance = useStaggeredEntrance(2);

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
        <Animated.View
          entering={FadeIn.duration(motion.normal)}
          exiting={FadeOut.duration(motion.quick)}
          layout={LinearTransition.duration(motion.normal)}
        >
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
        </Animated.View>
      )}

      {isUnsupported && (
        <Animated.View
          style={controlStyles.warningCard}
          entering={FadeIn.duration(motion.normal)}
          layout={LinearTransition.duration(motion.normal)}
        >
          <Text
            style={controlStyles.warningText}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t("motionCues.ios.control.unsupportedVersion")}
          </Text>
        </Animated.View>
      )}

      <Animated.View
        style={[controlStyles.card, appleCardEntrance]}
        layout={LinearTransition.duration(motion.normal)}
      >
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
          <Animated.View
            style={controlStyles.cardStatusRow}
            entering={FadeIn.duration(motion.normal)}
          >
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
          </Animated.View>
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
          <Animated.View
            entering={FadeIn.duration(motion.normal)}
            exiting={FadeOut.duration(motion.quick)}
          >
            <InlineNotice
              variant="warning"
              message={t("motionCues.ios.control.openSettingsFailed")}
              title={t("motionCues.ios.control.openSettingsFallback")}
            />
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View
        style={[controlStyles.card, overlayCardEntrance]}
        layout={LinearTransition.duration(motion.normal)}
      >
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
      </Animated.View>

      <Animated.View
        style={helpEntrance}
        layout={LinearTransition.duration(motion.normal)}
      >
        <HelpSection items={IOS_HELP} />

        <Button
          label={t("motionCues.reviewGuide")}
          onPress={onReviewGuide}
          variant="ghost"
          size="md"
          fullWidth
        />
      </Animated.View>
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
              render: (focused) => <AndroidSlideDemo focused={focused} />,
              primaryCta: {
                label: t("common.next"),
                onPress: () => {},
              },
            },
            {
              key: "a2",
              render: () => <AndroidSlideExplanation />,
              primaryCta: {
                label: t("common.next"),
                onPress: () => {},
              },
            },
            {
              key: "a3",
              render: () => <TipsSlide />,
              primaryCta: {
                label: t("common.next"),
                onPress: () => {},
              },
            },
            {
              key: "a4",
              render: (focused) => (
                <AndroidSlidePermission focused={focused} />
              ),
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
              render: () => <IOSSlideIntro />,
              primaryCta: {
                label: t("motionCues.ios.onboarding.slide1Cta"),
                onPress: () => {},
              },
            },
            {
              key: "i2",
              render: (focused) => <IOSSlideGuide focused={focused} />,
              primaryCta: {
                label: t("motionCues.ios.onboarding.slide2Cta"),
                onPress: () => {},
              },
            },
            {
              key: "i3",
              render: () => <TipsSlide />,
              primaryCta: {
                label: t("common.next"),
                onPress: () => {},
              },
            },
            {
              key: "i4",
              render: () => <IOSSlideDeepLink linkFailed={slideLinkFailed} />,
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
        <OnboardingSlides slides={slides} onSkip={handleComplete} />
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
    tipsList: {
      gap: spacing.sm,
      marginVertical: spacing.md,
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
      borderLeftWidth: 4,
      borderLeftColor: colors.surface,
      ...shadows.sm,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
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
    helpSection: {
      gap: spacing.sm,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    sectionLabel: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xs,
      color: colors.textTertiary,
      letterSpacing: letterSpacing.wide + 0.5,
      textTransform: "uppercase",
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.xs,
    },
    helpBody: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
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
      padding: SEGMENT_PADDING,
      gap: SEGMENT_GAP,
    },
    segmentThumb: {
      position: "absolute",
      top: SEGMENT_PADDING,
      bottom: SEGMENT_PADDING,
      left: SEGMENT_PADDING,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.primary,
    },
    segment: {
      flex: 1,
      minHeight: 48,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
    },
  });
