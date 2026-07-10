import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import {
  palettes,
  fonts,
  fontSizes,
  borderRadius,
  spacing,
  shadows,
  motion,
} from "@/constants/theme";
import { PulsingDot } from "./PulsingDot";

// Like DemoPhoneMockup, this is an illustration — it keeps the light-scheme
// colors in both themes so the mockup reads the same everywhere.
const illustration = palettes.light;

/**
 * Cycles 0..stageCount-1 on a timer. Drives a SettingsPathMockup and the
 * step list next to it so both highlight the same stage in sync.
 * Pass enabled=false while the slide isn't visible — the timer stops and
 * the stage parks at -1 (nothing highlighted), so hidden slides cost nothing.
 */
export function useStageLoop(
  stageCount: number,
  enabled = true,
  dwellMs = 2000
): number {
  const [stage, setStage] = useState(enabled ? 0 : -1);

  useEffect(() => {
    if (!enabled) {
      setStage(-1);
      return;
    }
    setStage(0);
    const id = setInterval(() => {
      setStage((s) => (s + 1) % stageCount);
    }, dwellMs);
    return () => clearInterval(id);
  }, [stageCount, enabled, dwellMs]);

  return stage;
}

function MockToggle({ on }: { on: boolean }) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      on ? illustration.primary : illustration.borderStrong,
      { duration: motion.normal }
    ),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(on ? 14 : 0, { duration: motion.normal }) },
    ],
  }));

  return (
    <Animated.View style={[styles.toggleTrack, trackStyle]}>
      <Animated.View style={[styles.toggleKnob, knobStyle]} />
    </Animated.View>
  );
}

function MockRow({
  label,
  icon,
  active,
  trailing,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  active: boolean;
  trailing?: "chevron" | "toggle-off" | "toggle-on";
}) {
  const highlightStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      active ? illustration.primarySoft : "rgba(0, 0, 0, 0)",
      { duration: motion.normal }
    ),
  }));

  return (
    <Animated.View style={[styles.row, highlightStyle]}>
      {icon && (
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={13} color={illustration.primary} />
        </View>
      )}
      <Text style={styles.rowLabel} numberOfLines={1} allowFontScaling={false}>
        {label}
      </Text>
      <View style={styles.rowTrailing}>
        {active && <PulsingDot color={illustration.primary} size={7} />}
        {trailing === "chevron" && (
          <Ionicons
            name="chevron-forward"
            size={13}
            color={illustration.borderStrong}
          />
        )}
        {(trailing === "toggle-off" || trailing === "toggle-on") && (
          <MockToggle on={trailing === "toggle-on"} />
        )}
      </View>
    </Animated.View>
  );
}

/** A grey placeholder row — stands in for unrelated apps/settings. */
function FillerRow({ barWidth }: { barWidth: number }) {
  return (
    <View style={styles.row}>
      <View style={styles.fillerIcon} />
      <View style={[styles.fillerBar, { width: barWidth }]} />
    </View>
  );
}

type SettingsPathMockupProps = {
  variant: "android" | "ios";
  /** Current stage from useStageLoop — 0..3, one per guide step. */
  stage: number;
};

/**
 * Stylized illustration of the system-settings screen the user must reach.
 * Android: the "Display over other apps" list with Serene's toggle.
 * iOS: the Settings → Accessibility → Motion → Vehicle Motion Cues path.
 * Purely decorative — hidden from screen readers (the step list carries
 * the same information as text).
 */
export function SettingsPathMockup({ variant, stage }: SettingsPathMockupProps) {
  const { t } = useTranslation();

  const doneStage = 3;

  return (
    <View
      style={styles.wrapper}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.card}>
        {variant === "android" ? (
          <>
            <Text
              style={styles.cardTitle}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {t("motionCues.android.onboarding.slide3Feature")}
            </Text>
            <FillerRow barWidth={70} />
            <MockRow
              label={t("common.appName")}
              icon="ellipse"
              active={stage === 1}
              trailing={stage >= 2 ? "toggle-on" : "toggle-off"}
            />
            <FillerRow barWidth={54} />
            <FillerRow barWidth={82} />
          </>
        ) : (
          <>
            <MockRow
              label={t("motionCues.ios.mockup.settings")}
              icon="settings-outline"
              active={stage === 0}
              trailing="chevron"
            />
            <MockRow
              label={t("motionCues.ios.mockup.accessibility")}
              icon="accessibility-outline"
              active={stage === 1}
              trailing="chevron"
            />
            <MockRow
              label={t("motionCues.ios.mockup.motionRow")}
              icon="move-outline"
              active={stage === 2}
              trailing="chevron"
            />
            <MockRow
              label={t("motionCues.ios.mockup.vehicleCues")}
              icon="car-outline"
              active={stage === 3}
              trailing={stage >= 3 ? "toggle-on" : "toggle-off"}
            />
          </>
        )}

        {stage >= doneStage && (
          <Animated.View
            style={styles.doneBadge}
            entering={FadeIn.duration(motion.normal)}
            exiting={FadeOut.duration(motion.quick)}
          >
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={illustration.success}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  card: {
    width: 264,
    backgroundColor: illustration.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: illustration.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: 2,
    ...shadows.md,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: illustration.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  rowIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: illustration.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: illustration.textPrimary,
  },
  rowTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  fillerIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: illustration.surfaceTinted,
  },
  fillerBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: illustration.surfaceTinted,
  },
  toggleTrack: {
    width: 32,
    height: 18,
    borderRadius: 9,
    padding: 2,
  },
  toggleKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: illustration.white,
  },
  doneBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: illustration.surface,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
});
