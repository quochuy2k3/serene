import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { useMotionCues } from "@/hooks/useMotionCues";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isActive, iosOverlayEnabled } = useMotionCues();

  const overlayOn = Platform.OS === "android" ? isActive : iosOverlayEnabled;

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
          <Text style={styles.cardIcon}>🎧</Text>
          <Text style={styles.cardTitle}>{t("home.listen100Hz")}</Text>
          <Text style={styles.cardDescription}>
            {t("home.listenDescription")}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push("/motion-cues")}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>✨</Text>
            <View
              style={[
                styles.statusBadge,
                overlayOn && styles.statusBadgeActive,
              ]}
            >
              <View
                style={[
                  styles.statusBadgeDot,
                  {
                    backgroundColor: overlayOn
                      ? colors.success
                      : colors.secondary,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  overlayOn && styles.statusBadgeTextActive,
                ]}
              >
                {overlayOn
                  ? t("home.overlayActive")
                  : t("home.overlayInactive")}
              </Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{t("home.motionCues")}</Text>
          <Text style={styles.cardDescription}>
            {t("home.motionCuesDescription")}
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push("/settings")}
      >
        <Text style={styles.settingsText}>⚙️ {t("common.settings")}</Text>
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.neutral,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusBadgeActive: {
    backgroundColor: colors.tertiaryLight,
  },
  statusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  statusBadgeTextActive: {
    color: colors.primaryDark,
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
