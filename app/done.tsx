import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, fonts, fontSizes, spacing, borderRadius } from "@/constants/theme";

export default function DoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("done.title")}</Text>
        <Text style={styles.message}>{t("done.message")}</Text>
        <Text style={styles.duration}>{t("done.effectDuration")}</Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/audio")}
          >
            <Text style={styles.primaryButtonText}>{t("done.listenAgain")}</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/motion-cues")}
          >
            <Text style={styles.secondaryButtonText}>{t("done.enableMotionCues")}</Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>{t("done.disclaimer")}</Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing["3xl"],
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["4xl"],
    color: colors.primary,
    marginBottom: spacing.md,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  duration: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing["2xl"],
  },
  actions: {
    gap: spacing.md,
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["2xl"],
    borderRadius: borderRadius.xl,
    width: "80%",
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textInverse,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["2xl"],
    borderRadius: borderRadius.xl,
    width: "80%",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.primary,
  },
  disclaimer: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 18,
  },
});
