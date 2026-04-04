import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  letterSpacing,
  lineHeights,
  shadows,
} from "@/constants/theme";
import { APP_CONFIG } from "@/constants/config";
import { Header } from "@/components/Header";
import { useSettings } from "@/hooks/useSettings";

const TAB_BAR_CLEARANCE = 120;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  const dotSizeOptions = [
    { key: "settings.dotSizeSmall" as const, value: "small" as const },
    { key: "settings.dotSizeMedium" as const, value: "medium" as const },
    { key: "settings.dotSizeLarge" as const, value: "large" as const },
  ];

  const sensitivityOptions = [
    { key: "settings.sensitivityLow" as const, value: "low" as const },
    { key: "settings.sensitivityMedium" as const, value: "medium" as const },
    { key: "settings.sensitivityHigh" as const, value: "high" as const },
  ];

  return (
    <View style={styles.container}>
      <Header
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dot Size */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("settings.dotSize")}</Text>
          <View style={styles.segmented}>
            {dotSizeOptions.map(({ key, value }) => {
              const active = settings.dotSize === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => updateSettings({ dotSize: value })}
                  style={[styles.segment, active && styles.segmentActive]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {t(key)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sensitivity */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("settings.sensitivity")}</Text>
          <View style={styles.segmented}>
            {sensitivityOptions.map(({ key, value }) => {
              const active = settings.sensitivity === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => updateSettings({ sensitivity: value })}
                  style={[styles.segment, active && styles.segmentActive]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {t(key)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("settings.language")}</Text>
          <Pressable style={styles.row} onPress={toggleLanguage}>
            <Text style={styles.rowLabel}>
              {i18n.language === "en" ? "English" : "Tiếng Việt"}
            </Text>
            <Text style={styles.rowChevron}>→</Text>
          </Pressable>
        </View>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutEyebrow}>{t("settings.about")}</Text>
          <Text style={styles.aboutTitle}>{APP_CONFIG.name}</Text>
          <Text style={styles.aboutText}>
            {t("settings.aboutDescription")}
          </Text>
          <View style={styles.aboutDivider} />
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    letterSpacing: letterSpacing.wide + 0.5,
    textTransform: "uppercase",
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    gap: 2,
    ...shadows.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textInverse,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.xs,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  rowChevron: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    color: colors.primary,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  aboutEyebrow: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wide + 0.5,
    textTransform: "uppercase",
  },
  aboutTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["2xl"],
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  aboutText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  research: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.primary,
  },
  version: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
  },
});
