import { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { AUDIO_CONFIG } from "@/constants/config";
import { Button } from "@/components/Button";
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
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [state, router]);

  const isIdle = state === "idle";
  const isPlaying = state === "playing";

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable onPress={() => router.back()} hitSlop={16}>
        <Text style={styles.backButton}>{t("common.back")}</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{t("audio.title")}</Text>

        {isIdle && (
          <View style={styles.guideBox}>
            <Text style={styles.guide}>{t("audio.volumeGuide")}</Text>
            <Text style={styles.tip}>{t("audio.volumeTip")}</Text>
          </View>
        )}

        <View style={styles.timerArea}>
          <CountdownTimer
            remainingSeconds={remainingSeconds}
            totalSeconds={AUDIO_CONFIG.duration}
          />
        </View>

        <View style={styles.actions}>
          {isIdle && (
            <Button
              label={t("audio.startListening")}
              onPress={start}
              size="lg"
              fullWidth
            />
          )}
          {isPlaying && (
            <>
              <Text style={styles.listening}>{t("audio.listening")}</Text>
              <Button
                label={t("common.stop")}
                onPress={stop}
                variant="outlined"
                size="md"
                fullWidth
              />
            </>
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
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.primary,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    paddingBottom: spacing["2xl"],
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["3xl"],
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  guideBox: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  guide: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  tip: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  timerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actions: {
    gap: spacing.md,
    alignItems: "center",
  },
  listening: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
});
