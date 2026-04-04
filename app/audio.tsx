import { useEffect } from "react";
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
} from "@/constants/theme";
import { AUDIO_CONFIG } from "@/constants/config";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useAudioSession } from "@/hooks/useAudioSession";

export default function AudioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { state, remainingSeconds, start, stop } = useAudioSession();

  useEffect(() => {
    if (state === "completed") {
      const timeout = setTimeout(() => {
        router.replace("/done");
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [state, router]);

  const isIdle = state === "idle";
  const isPlaying = state === "playing";

  return (
    <View style={styles.container}>
      <Header
        eyebrow={t("audio.eyebrow")}
        title={t("audio.title")}
        showBack
        compact
      />

      <View style={styles.content}>
        <View style={styles.timerArea}>
          <CountdownTimer
            remainingSeconds={remainingSeconds}
            totalSeconds={AUDIO_CONFIG.duration}
            isActive={isPlaying}
          />
        </View>

        <View style={styles.guideArea}>
          {isIdle && (
            <View style={styles.guideBox}>
              <View style={styles.guideHeader}>
                <View style={styles.headphoneBadge}>
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
              <View style={styles.pulseDot} />
              <Text style={styles.playingText}>{t("audio.listening")}</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.actions,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          {isIdle && (
            <Button
              label={t("audio.startListening")}
              onPress={start}
              size="lg"
              fullWidth
            />
          )}
          {isPlaying && (
            <Button
              label={t("common.stop")}
              onPress={stop}
              variant="outlined"
              size="md"
              fullWidth
            />
          )}
        </View>
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
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
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
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
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
