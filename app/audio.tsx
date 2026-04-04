import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  letterSpacing,
  lineHeights,
  borderRadius,
} from "@/constants/theme";
import { AUDIO_CONFIG } from "@/constants/config";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PulsingDot } from "@/components/PulsingDot";
import { useAudioSession } from "@/hooks/useAudioSession";
import { useHaptics } from "@/hooks/useHaptics";
import {
  useScreenEntrance,
  useStaggeredEntrance,
} from "@/hooks/useScreenEntrance";

export default function AudioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { state, remainingSeconds, start, stop } = useAudioSession();
  const haptics = useHaptics();

  const headerEntrance = useScreenEntrance(0);
  const timerEntrance = useStaggeredEntrance(1, 120);
  const guideEntrance = useStaggeredEntrance(2, 120);
  const actionsEntrance = useStaggeredEntrance(3, 120);

  useEffect(() => {
    if (state === "completed") {
      haptics.success();
      const timeout = setTimeout(() => {
        router.replace("/done");
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [state, router, haptics]);

  const handleStart = () => {
    haptics.medium();
    start();
  };

  const handleStop = () => {
    haptics.warning();
    stop();
  };

  const isIdle = state === "idle";
  const isPlaying = state === "playing";

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
                    color={colors.primary}
                  />
                  <Text style={styles.headphoneBadgeText}>
                    {t("audio.headphoneBadge")}
                  </Text>
                </View>
              </View>
              <Text style={styles.guideTitle}>{t("audio.volumeGuide")}</Text>
              <Text style={styles.guideTip}>{t("audio.volumeTip")}</Text>
            </View>
          )}

          {isPlaying && (
            <View style={styles.playingBox}>
              <PulsingDot color={colors.primary} size={8} pulse />
              <Text style={styles.playingText}>{t("audio.listening")}</Text>
            </View>
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
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colors.primary,
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
  },
});
