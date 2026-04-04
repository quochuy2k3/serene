import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, fonts, fontSizes, spacing, borderRadius } from "@/constants/theme";

export default function AudioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backButton}>{t("common.back")}</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{t("audio.title")}</Text>
        <Text style={styles.guide}>{t("audio.volumeGuide")}</Text>
        <Text style={styles.tip}>{t("audio.volumeTip")}</Text>

        {/* TODO: CountdownTimer component */}
        {/* TODO: AudioEngine WebView component */}

        <Pressable
          style={styles.startButton}
          onPress={() => {
            // TODO: Start audio session
            router.push("/done");
          }}
        >
          <Text style={styles.startButtonText}>{t("audio.startListening")}</Text>
        </Pressable>
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
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing["3xl"],
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["3xl"],
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  guide: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  tip: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing["2xl"],
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["2xl"],
    borderRadius: borderRadius.xl,
  },
  startButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textInverse,
  },
});
