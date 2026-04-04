import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.header}>
        <Text style={styles.appName}>{t("common.appName")}</Text>
        <Text style={styles.tagline}>{t("common.tagline")}</Text>
      </View>

      <View style={styles.cards}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push("/audio")}
        >
          <Text style={styles.cardTitle}>{t("home.listen100Hz")}</Text>
          <Text style={styles.cardDescription}>{t("home.listenDescription")}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push("/motion-cues")}
        >
          <Text style={styles.cardTitle}>{t("home.motionCues")}</Text>
          <Text style={styles.cardDescription}>{t("home.motionCuesDescription")}</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push("/settings")}
      >
        <Text style={styles.settingsText}>{t("common.settings")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  appName: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["4xl"],
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
  },
  cards: {
    gap: spacing.md,
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  settingsButton: {
    alignSelf: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  settingsText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.secondary,
  },
});
