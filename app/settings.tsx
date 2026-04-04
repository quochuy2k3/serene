import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from "@/constants/theme";
import { APP_CONFIG } from "@/constants/config";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backButton}>{t("common.back")}</Text>
      </Pressable>

      <Text style={styles.title}>{t("settings.title")}</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Dot Size */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>{t("settings.dotSize")}</Text>
          <View style={styles.optionRow}>
            {([
              { key: "settings.dotSizeSmall" as const, value: "small" },
              { key: "settings.dotSizeMedium" as const, value: "medium" },
              { key: "settings.dotSizeLarge" as const, value: "large" },
            ]).map(({ key, value }) => (
              <Pressable key={value} style={[styles.optionButton, value === "medium" && styles.optionActive]}>
                <Text style={[styles.optionText, value === "medium" && styles.optionTextActive]}>
                  {t(key)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sensitivity */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>{t("settings.sensitivity")}</Text>
          <View style={styles.optionRow}>
            {([
              { key: "settings.sensitivityLow" as const, value: "low" },
              { key: "settings.sensitivityMedium" as const, value: "medium" },
              { key: "settings.sensitivityHigh" as const, value: "high" },
            ]).map(({ key, value }) => (
              <Pressable key={value} style={[styles.optionButton, value === "medium" && styles.optionActive]}>
                <Text style={[styles.optionText, value === "medium" && styles.optionTextActive]}>
                  {t(key)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>{t("settings.language")}</Text>
          <Pressable style={styles.languageButton} onPress={toggleLanguage}>
            <Text style={styles.languageText}>
              {i18n.language === "en" ? "English" : "Tiếng Việt"}
            </Text>
          </Pressable>
        </View>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>{t("settings.about")}</Text>
          <Text style={styles.aboutText}>{t("settings.aboutDescription")}</Text>
          <Text style={styles.research}>{t("settings.research")}</Text>
          <Text style={styles.version}>
            {t("settings.version")} {APP_CONFIG.version}
          </Text>
        </View>
      </ScrollView>
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
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["3xl"],
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  settingGroup: {
    marginBottom: spacing.lg,
  },
  settingLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.textInverse,
  },
  languageButton: {
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: "flex-start",
    ...shadows.sm,
  },
  languageText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  aboutCard: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  aboutTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  aboutText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  research: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  version: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
});
