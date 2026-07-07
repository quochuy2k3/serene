import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  spacing,
  borderRadius,
  letterSpacing,
  lineHeights,
  shadows,
  type ThemeColors,
} from "@/constants/theme";
import { APP_CONFIG, MOTION_CUES_CONFIG } from "@/constants/config";
import { Header } from "@/components/Header";
import { InlineNotice } from "@/components/InlineNotice";
import { useSettings, type ThemeMode } from "@/hooks/useSettings";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";
import { useHaptics } from "@/hooks/useHaptics";
import {
  useScreenEntrance,
  useStaggeredEntrance,
} from "@/hooks/useScreenEntrance";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";

type SegmentOption<T extends string> = { label: string; value: T };

type SegmentedRowProps<T extends string> = {
  label: string;
  options: SegmentOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  styles: ReturnType<typeof createStyles>;
};

function SegmentedRow<T extends string>({
  label,
  options,
  selected,
  onSelect,
  styles,
}: SegmentedRowProps<T>) {
  return (
    <>
      <Text
        style={styles.sectionLabel}
        maxFontSizeMultiplier={fontScaleCaps.control}
      >
        {label}
      </Text>
      <View style={styles.segmented} accessibilityRole="radiogroup">
        {options.map(({ label: optionLabel, value }) => {
          const active = selected === value;
          return (
            <Pressable
              key={value}
              onPress={() => onSelect(value)}
              style={[styles.segment, active && styles.segmentActive]}
              accessibilityRole="radio"
              accessibilityLabel={optionLabel}
              accessibilityState={{ checked: active }}
            >
              <Text
                style={[
                  styles.segmentText,
                  active && styles.segmentTextActive,
                ]}
                maxFontSizeMultiplier={fontScaleCaps.control}
              >
                {optionLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings, storageError, clearStorageError } =
    useSettings();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const haptics = useHaptics();
  const tabBarClearance = useTabBarClearance();

  const headerEntrance = useScreenEntrance(0);
  const appearanceEntrance = useStaggeredEntrance(1);
  const sizeEntrance = useStaggeredEntrance(2);
  const densityEntrance = useStaggeredEntrance(3);
  const opacityEntrance = useStaggeredEntrance(4);
  const sensitivityEntrance = useStaggeredEntrance(5);
  const languageEntrance = useStaggeredEntrance(6);
  const aboutEntrance = useStaggeredEntrance(7);

  const toggleLanguage = () => {
    haptics.select();
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  const selectSegment = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    haptics.select();
    updateSettings({ [key]: value });
  };

  const [opacityDraft, setOpacityDraft] = useState(settings.dotOpacity);
  useEffect(() => {
    setOpacityDraft(settings.dotOpacity);
  }, [settings.dotOpacity]);

  const themeOptions: SegmentOption<ThemeMode>[] = [
    { label: t("settings.themeSystem"), value: "system" },
    { label: t("settings.themeLight"), value: "light" },
    { label: t("settings.themeDark"), value: "dark" },
  ];

  const dotSizeOptions = [
    { label: t("settings.dotSizeSmall"), value: "small" as const },
    { label: t("settings.dotSizeMedium"), value: "medium" as const },
    { label: t("settings.dotSizeLarge"), value: "large" as const },
  ];

  const dotDensityOptions = [
    { label: t("settings.densityLow"), value: "low" as const },
    { label: t("settings.densityMedium"), value: "medium" as const },
    { label: t("settings.densityHigh"), value: "high" as const },
  ];

  const sensitivityOptions = [
    { label: t("settings.sensitivityLow"), value: "low" as const },
    { label: t("settings.sensitivityMedium"), value: "medium" as const },
    { label: t("settings.sensitivityHigh"), value: "high" as const },
  ];

  const opacityMinPercent = Math.round(
    MOTION_CUES_CONFIG.opacityRange.min * 100
  );
  const opacityMaxPercent = Math.round(
    MOTION_CUES_CONFIG.opacityRange.max * 100
  );
  const previewDotSize = MOTION_CUES_CONFIG.dotSizes[settings.dotSize];

  return (
    <View style={styles.container}>
      <Animated.View style={headerEntrance}>
        <Header
          eyebrow={t("settings.eyebrow")}
          title={t("settings.title")}
          description={t("settings.description")}
        />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarClearance },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {storageError && (
          <InlineNotice
            variant="warning"
            message={
              storageError === "load"
                ? t("errors.storageLoad")
                : t("errors.storageSave")
            }
            dismissLabel={t("common.done")}
            onDismiss={clearStorageError}
          />
        )}

        {/* Appearance */}
        <Animated.View style={[styles.section, appearanceEntrance]}>
          <SegmentedRow
            label={t("settings.appearance")}
            options={themeOptions}
            selected={settings.themeMode}
            onSelect={(value) => selectSegment("themeMode", value)}
            styles={styles}
          />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={colors.primary}
              />
              <View style={styles.rowTextColumn}>
                <Text
                  style={styles.rowLabel}
                  maxFontSizeMultiplier={fontScaleCaps.body}
                >
                  {t("settings.reduceMotion")}
                </Text>
                <Text
                  style={styles.rowCaption}
                  maxFontSizeMultiplier={fontScaleCaps.body}
                >
                  {t("settings.reduceMotionDescription")}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.reduceMotion}
              onValueChange={(value) => selectSegment("reduceMotion", value)}
              trackColor={{
                false: colors.sliderTrack,
                true: colors.primaryLight,
              }}
              thumbColor={colors.white}
              accessibilityLabel={t("settings.reduceMotion")}
            />
          </View>
        </Animated.View>

        {/* Dot Size */}
        <Animated.View style={[styles.section, sizeEntrance]}>
          <SegmentedRow
            label={t("settings.dotSize")}
            options={dotSizeOptions}
            selected={settings.dotSize}
            onSelect={(value) => selectSegment("dotSize", value)}
            styles={styles}
          />
        </Animated.View>

        {/* Dot Density */}
        <Animated.View style={[styles.section, densityEntrance]}>
          <SegmentedRow
            label={t("settings.dotDensity")}
            options={dotDensityOptions}
            selected={settings.dotDensity}
            onSelect={(value) => selectSegment("dotDensity", value)}
            styles={styles}
          />
        </Animated.View>

        {/* Dot Opacity */}
        <Animated.View style={[styles.section, opacityEntrance]}>
          <View style={styles.opacityHeader}>
            <Text
              style={styles.sectionLabel}
              maxFontSizeMultiplier={fontScaleCaps.control}
            >
              {t("settings.dotOpacity")} — {Math.round(opacityDraft * 100)}%
            </Text>
            <View
              style={styles.previewSwatch}
              importantForAccessibility="no"
              accessibilityElementsHidden
            >
              <View
                style={[
                  styles.previewDot,
                  {
                    width: previewDotSize,
                    height: previewDotSize,
                    borderRadius: previewDotSize / 2,
                    opacity: opacityDraft,
                  },
                ]}
              />
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MOTION_CUES_CONFIG.opacityRange.min}
            maximumValue={MOTION_CUES_CONFIG.opacityRange.max}
            step={0.05}
            value={opacityDraft}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.sliderTrack}
            thumbTintColor={colors.primary}
            onValueChange={setOpacityDraft}
            onSlidingComplete={(v) => {
              haptics.select();
              updateSettings({ dotOpacity: v });
            }}
            accessibilityLabel={t("settings.dotOpacity")}
          />
          <View style={styles.sliderScale}>
            <Text
              style={styles.sliderScaleText}
              maxFontSizeMultiplier={fontScaleCaps.control}
            >
              {opacityMinPercent}%
            </Text>
            <Text
              style={styles.sliderScaleText}
              maxFontSizeMultiplier={fontScaleCaps.control}
            >
              {opacityMaxPercent}%
            </Text>
          </View>
        </Animated.View>

        {/* Sensitivity */}
        <Animated.View style={[styles.section, sensitivityEntrance]}>
          <SegmentedRow
            label={t("settings.sensitivity")}
            options={sensitivityOptions}
            selected={settings.sensitivity}
            onSelect={(value) => selectSegment("sensitivity", value)}
            styles={styles}
          />
        </Animated.View>

        {/* Language */}
        <Animated.View style={[styles.section, languageEntrance]}>
          <Text
            style={styles.sectionLabel}
            maxFontSizeMultiplier={fontScaleCaps.control}
          >
            {t("settings.language")}
          </Text>
          <Pressable
            style={styles.row}
            onPress={toggleLanguage}
            accessibilityRole="button"
            accessibilityLabel={`${t("settings.language")}: ${
              i18n.language === "en" ? "English" : "Tiếng Việt"
            }`}
            accessibilityHint={t("settings.languageHint")}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="language-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                style={styles.rowLabel}
                maxFontSizeMultiplier={fontScaleCaps.body}
              >
                {i18n.language === "en" ? "English" : "Tiếng Việt"}
              </Text>
            </View>
            <Ionicons
              name="swap-horizontal"
              size={18}
              color={colors.textTertiary}
            />
          </Pressable>
        </Animated.View>

        {/* About */}
        <Animated.View style={[styles.aboutCard, aboutEntrance]}>
          <View style={styles.aboutIconRow}>
            <View style={styles.aboutIconBox}>
              <Ionicons
                name="leaf-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={styles.aboutEyebrow}
                maxFontSizeMultiplier={fontScaleCaps.control}
              >
                {t("settings.about")}
              </Text>
              <Text
                style={styles.aboutTitle}
                maxFontSizeMultiplier={fontScaleCaps.heading}
              >
                {APP_CONFIG.name}
              </Text>
            </View>
          </View>
          <Text
            style={styles.aboutText}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t("settings.aboutDescription")}
          </Text>
          <View style={styles.aboutDivider} />
          <View style={styles.aboutFooter}>
            <Ionicons
              name="school-outline"
              size={14}
              color={colors.primary}
            />
            <Text
              style={styles.research}
              maxFontSizeMultiplier={fontScaleCaps.body}
            >
              {t("settings.research")}
            </Text>
          </View>
          <Text
            style={styles.version}
            maxFontSizeMultiplier={fontScaleCaps.body}
          >
            {t("settings.version")} {APP_CONFIG.version}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.xl,
      gap: spacing.xl,
    },
    section: {
      gap: spacing.md,
    },
    sectionLabel: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xs,
      color: colors.textTertiary,
      letterSpacing: letterSpacing.wide + 0.5,
      textTransform: "uppercase",
    },
    segmented: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: 4,
      gap: 2,
      ...shadows.xs,
    },
    segment: {
      flex: 1,
      minHeight: 48,
      paddingVertical: spacing.md,
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
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      minHeight: 48,
      gap: spacing.md,
      ...shadows.xs,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      flex: 1,
    },
    rowTextColumn: {
      flex: 1,
      gap: 2,
    },
    rowLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
    },
    rowCaption: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textTertiary,
      lineHeight: fontSizes.xs * lineHeights.normal,
    },
    opacityHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    previewSwatch: {
      width: 44,
      height: 28,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.textPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    previewDot: {
      backgroundColor: colors.background,
    },
    slider: {
      width: "100%",
      height: 40,
    },
    sliderScale: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: -spacing.sm,
    },
    sliderScaleText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textTertiary,
    },
    aboutCard: {
      backgroundColor: colors.surface,
      padding: spacing.xl,
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
      ...shadows.sm,
    },
    aboutIconRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.xs,
    },
    aboutIconBox: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    aboutEyebrow: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xs,
      color: colors.textAccent,
      letterSpacing: letterSpacing.wide + 0.5,
      textTransform: "uppercase",
    },
    aboutFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    aboutTitle: {
      fontFamily: fonts.bold,
      fontSize: fontSizes["2xl"],
      color: colors.textPrimary,
      letterSpacing: letterSpacing.tight,
    },
    aboutText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: fontSizes.sm * lineHeights.normal,
    },
    aboutDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    research: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.xs,
      color: colors.textAccent,
    },
    version: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textTertiary,
    },
  });
