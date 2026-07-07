import { useEffect } from "react";
import { View, Text, StyleSheet, AccessibilityInfo } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  spacing,
  letterSpacing,
  lineHeights,
  borderRadius,
  type ThemeColors,
} from "@/constants/theme";
import { AUDIO_CONFIG } from "@/constants/config";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PulsingDot } from "@/components/PulsingDot";
import { InlineNotice } from "@/components/InlineNotice";
import { useAudioSession } from "@/hooks/useAudioSession";
import { useHaptics } from "@/hooks/useHaptics";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";
import {
  useScreenEntrance,
  useStaggeredEntrance,
} from "@/hooks/useScreenEntrance";

export default function AudioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { state, remainingSeconds, start, stop, resume, restart } =
    useAudioSession();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const headerEntrance = useScreenEntrance(0);
  const timerEntrance = useStaggeredEntrance(1, 120);
  const guideEntrance = useStaggeredEntrance(2, 120);
  const actionsEntrance = useStaggeredEntrance(3, 120);

  useEffect(() => {
    if (state === "completed") {
      haptics.success();
      AccessibilityInfo.announceForAccessibility(
        t("audio.completedAnnouncement")
      );
      const timeout = setTimeout(() => {
        router.replace("/done");
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [state, router, haptics, t]);

  const handleStart = () => {
    haptics.medium();
    start();
  };

  const handleStop = () => {
    haptics.warning();
    stop();
  };

  const handleResume = () => {
    haptics.medium();
    resume();
  };

  const handleRestart = () => {
    haptics.medium();
    restart();
  };

  const isIdle = state === "idle";
  const isPlaying = state === "playing";
  const isInterrupted = state === "interrupted";
  const hasError = state === "error";

  return (
    <View style={styles.container}>
      <Animated.View style={headerEntrance}>
        <Header
          eyebrow={t("audio.eyebrow")}
          title={t("audio.title")}
          showBack
          compact
        />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={[styles.timerArea, timerEntrance]}>
          <CountdownTimer
            remainingSeconds={remainingSeconds}
            totalSeconds={AUDIO_CONFIG.duration}
            isActive={isPlaying}
          />
        </Animated.View>

        <Animated.View style={[styles.guideArea, guideEntrance]}>
          {isIdle && (
            <View style={styles.guideBox}>
              <View style={styles.guideHeader}>
                <View style={styles.headphoneBadge}>
                  <Ionicons
                    name="headset-outline"
                    size={14}
                    color={colors.textAccent}
                  />
                  <Text
                    style={styles.headphoneBadgeText}
                    maxFontSizeMultiplier={fontScaleCaps.control}
                  >
                    {t("audio.headphoneBadge")}
                  </Text>
                </View>
              </View>
              <Text
                style={styles.guideTitle}
                maxFontSizeMultiplier={fontScaleCaps.body}
              >
                {t("audio.volumeGuide")}
              </Text>
              <Text
                style={styles.guideTip}
                maxFontSizeMultiplier={fontScaleCaps.body}
              >
                {t("audio.volumeTip")}
              </Text>
              <Text
                style={styles.guideExplainer}
                maxFontSizeMultiplier={fontScaleCaps.body}
              >
                {t("audio.whyExplainer")}
              </Text>
            </View>
          )}

          {isPlaying && (
            <View style={styles.playingBox}>
              <PulsingDot color={colors.primary} size={8} pulse />
              <Text
                style={styles.playingText}
                maxFontSizeMultiplier={fontScaleCaps.control}
              >
                {t("audio.listening")}
              </Text>
            </View>
          )}

          {isInterrupted && (
            <InlineNotice variant="info" message={t("audio.interrupted")} />
          )}

          {hasError && (
            <InlineNotice
              variant="error"
              message={t("audio.error")}
              title={t("audio.errorHint")}
            />
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.actions,
            { paddingBottom: insets.bottom + spacing.lg },
            actionsEntrance,
          ]}
        >
          {isIdle && (
            <Button
              label={t("audio.startListening")}
              onPress={handleStart}
              size="lg"
              haptic="none"
              fullWidth
            />
          )}
          {isPlaying && (
            <Button
              label={t("common.stop")}
              onPress={handleStop}
              variant="outlined"
              size="md"
              haptic="none"
              fullWidth
            />
          )}
          {isInterrupted && (
            <>
              <Button
                label={t("audio.resume")}
                onPress={handleResume}
                size="lg"
                haptic="none"
                fullWidth
              />
              <Button
                label={t("audio.restart")}
                onPress={handleRestart}
                variant="ghost"
                size="md"
                haptic="none"
                fullWidth
              />
            </>
          )}
          {hasError && (
            <Button
              label={t("common.retry")}
              onPress={handleRestart}
              size="lg"
              haptic="none"
              fullWidth
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    timerArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl,
    },
    guideArea: {
      minHeight: 120,
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    guideBox: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    guideHeader: {
      flexDirection: "row",
      marginBottom: spacing.xs,
    },
    headphoneBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primarySoft,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: borderRadius.sm,
    },
    headphoneBadgeText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xs,
      color: colors.textAccent,
      letterSpacing: letterSpacing.wide + 0.5,
      textTransform: "uppercase",
    },
    guideTitle: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
      lineHeight: fontSizes.md * lineHeights.normal,
    },
    guideTip: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: fontSizes.sm * lineHeights.normal,
    },
    guideExplainer: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textTertiary,
      lineHeight: fontSizes.sm * lineHeights.normal,
      marginTop: spacing.xs,
    },
    playingBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    playingText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      letterSpacing: letterSpacing.wide,
      textTransform: "uppercase",
    },
    actions: {
      paddingTop: spacing.lg,
      gap: spacing.sm,
    },
  });
