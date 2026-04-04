import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
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
import { useHaptics } from "@/hooks/useHaptics";
import {
  useScreenEntrance,
  useStaggeredEntrance,
} from "@/hooks/useScreenEntrance";

const TAB_BAR_CLEARANCE = 120;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const haptics = useHaptics();

  const headerEntrance = useScreenEntrance(0);
  const section1Entrance = useStaggeredEntrance(1);
  const section2Entrance = useStaggeredEntrance(2);
  const section3Entrance = useStaggeredEntrance(3);
  const aboutEntrance = useStaggeredEntrance(4);

  const toggleLanguage = () => {
    haptics.select();
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  const handleSegmentPress = (updater: () => void) => {
    haptics.select();
    updater();
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
      <Animated.View style={headerEntrance}>
        <Header
          eyebrow={t("settings.eyebrow")}
          title={t("settings.title")}
          description={t("settings.description")}
        />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dot Size */}
        <Animated.View style={[styles.section, section1Entrance]}>
          <Text style={styles.sectionLabel}>{t("settings.dotSize")}</Text>
          <View style={styles.segmented}>
            {dotSizeOptions.map(({ key, value }) => {
              const active = settings.dotSize === value;
              return (
                <Pressable
                  key={value}
                  onPress={() =>
                    handleSegmentPress(() => updateSettings({ dotSize: value }))
                  }
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
        </Animated.View>

        {/* Sensitivity */}
        <Animated.View style={[styles.section, section2Entrance]}>
          <Text style={styles.sectionLabel}>{t("settings.sensitivity")}</Text>
          <View style={styles.segmented}>
            {sensitivityOptions.map(({ key, value }) => {
              const active = settings.sensitivity === value;
              return (
                <Pressable
                  key={value}
                  onPress={() =>
                    handleSegmentPress(() =>
                      updateSettings({ sensitivity: value })
                    )
                  }
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
        </Animated.View>

        {/* Language */}
        <Animated.View style={[styles.section, section3Entrance]}>
          <Text style={styles.sectionLabel}>{t("settings.language")}</Text>
          <Pressable style={styles.row} onPress={toggleLanguage}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="language-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.rowLabel}>
                {i18n.language === "en" ? "English" : "Tiếng Việt"}
              </Text>
            </View>
            <Ionicons
              name="swap-horizontal"
              size={18}
              color={colors.textTertiary}
            />
          </Pressable>
        </Animated.View>

        {/* About */}
        <Animated.View style={[styles.aboutCard, aboutEntrance]}>
          <View style={styles.aboutIconRow}>
            <View style={styles.aboutIconBox}>
              <Ionicons
                name="leaf-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aboutEyebrow}>{t("settings.about")}</Text>
              <Text style={styles.aboutTitle}>{APP_CONFIG.name}</Text>
            </View>
          </View>
          <Text style={styles.aboutText}>
            {t("settings.aboutDescription")}
          </Text>
          <View style={styles.aboutDivider} />
          <View style={styles.aboutFooter}>
            <Ionicons
              name="school-outline"
              size={14}
              color={colors.primary}
            />
            <Text style={styles.research}>{t("settings.research")}</Text>
          </View>
          <Text style={styles.version}>
            {t("settings.version")} {APP_CONFIG.version}
          </Text>
        </Animated.View>
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
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  aboutIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  aboutIconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutEyebrow: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wide + 0.5,
    textTransform: "uppercase",
  },
  aboutFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
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
