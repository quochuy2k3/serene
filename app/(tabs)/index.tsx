import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  spacing,
  borderRadius,
  letterSpacing,
  lineHeights,
  shadows,
  motion,
  type ThemeColors,
} from "@/constants/theme";
import { AUDIO_CONFIG } from "@/constants/config";
import { Header } from "@/components/Header";
import { PulsingDot } from "@/components/PulsingDot";
import { useMotionCues } from "@/hooks/useMotionCues";
import { useHaptics } from "@/hooks/useHaptics";
import { useSettings } from "@/hooks/useSettings";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";
import { useScreenEntrance, useStaggeredEntrance } from "@/hooks/useScreenEntrance";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isActive, iosOverlayEnabled } = useMotionCues();
  const haptics = useHaptics();
  const tabBarClearance = useTabBarClearance();
  const { settings, updateSettings, isLoaded } = useSettings();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const overlayOn = Platform.OS === "android" ? isActive : iosOverlayEnabled;
  const showWelcome = isLoaded && !settings.welcomeSeen;

  const headerEntrance = useScreenEntrance(0);
  const card1Entrance = useStaggeredEntrance(1);
  const card2Entrance = useStaggeredEntrance(2);
  const footerEntrance = useStaggeredEntrance(3);

  const handleAudioPress = () => {
    haptics.tap();
    router.push("/audio");
  };

  const handleMotionPress = () => {
    haptics.tap();
    router.push("/(tabs)/motion-cues");
  };

  const dismissWelcome = () => {
    haptics.select();
    updateSettings({ welcomeSeen: true });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={headerEntrance}>
        <Header
          eyebrow={t("home.greeting")}
          title={t("common.appName")}
          description={t("common.tagline")}
        />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarClearance },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* First-run welcome card */}
        {showWelcome && (
          <Animated.View
            exiting={FadeOut.duration(motion.quick)}
            layout={LinearTransition.duration(motion.normal)}
          >
            <View style={styles.welcomeCard}>
              <Text
                style={styles.welcomeTitle}
                maxFontSizeMultiplier={fontScaleCaps.heading}
              >
                {t("home.welcomeTitle")}
              </Text>
              <Text
                style={styles.welcomeBody}
                maxFontSizeMultiplier={fontScaleCaps.body}
              >
                {t("home.welcomeBody")}
              </Text>
              <Pressable
                onPress={dismissWelcome}
                style={styles.welcomeDismiss}
                accessibilityRole="button"
                accessibilityLabel={t("home.welcomeDismiss")}
              >
                <Text
                  style={styles.welcomeDismissLabel}
                  maxFontSizeMultiplier={fontScaleCaps.control}
                >
                  {t("home.welcomeDismiss")}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Audio Therapy Card */}
        <Animated.View
          style={card1Entrance}
          layout={LinearTransition.duration(motion.normal)}
        >
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={handleAudioPress}
            accessibilityRole="button"
            accessibilityLabel={`${t("home.audioEyebrow")}, ${t("home.listen100Hz")}`}
            accessibilityHint={t("home.audioCardHint")}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardIconBox}>
                <Ionicons name="headset-outline" size={28} color={colors.primary} />
              </View>
              <View style={styles.cardMeta}>
                <Text
                  style={styles.cardEyebrow}
                  numberOfLines={1}
                  maxFontSizeMultiplier={fontScaleCaps.control}
                >
                  {t("home.audioEyebrow")}
                </Text>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={1}
                  maxFontSizeMultiplier={fontScaleCaps.heading}
                >
                  {t("home.listen100Hz")}
                </Text>
              </View>
              <View style={styles.cardDuration}>
                <Text
                  style={styles.cardDurationText}
                  maxFontSizeMultiplier={fontScaleCaps.control}
                >
                  {t("home.durationPill", { seconds: AUDIO_CONFIG.duration })}
                </Text>
              </View>
            </View>
            <Text
              style={styles.cardDescription}
              maxFontSizeMultiplier={fontScaleCaps.body}
            >
              {t("home.listenDescription")}
            </Text>
            <View style={styles.cardFooter}>
              <Text
                style={styles.cardCta}
                maxFontSizeMultiplier={fontScaleCaps.control}
              >
                {t("home.startSession")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.primary}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Motion Cues Card */}
        <Animated.View
          style={card2Entrance}
          layout={LinearTransition.duration(motion.normal)}
        >
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={handleMotionPress}
            accessibilityRole="button"
            accessibilityLabel={`${t("home.motionEyebrow")}, ${t("home.motionCues")}, ${
              overlayOn ? t("common.on") : t("common.off")
            }`}
            accessibilityHint={t("home.motionCardHint")}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardIconBox}>
                <Ionicons
                  name="pulse-outline"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <View style={styles.cardMeta}>
                <Text
                  style={styles.cardEyebrow}
                  numberOfLines={1}
                  maxFontSizeMultiplier={fontScaleCaps.control}
                >
                  {t("home.motionEyebrow")}
                </Text>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={1}
                  maxFontSizeMultiplier={fontScaleCaps.heading}
                >
                  {t("home.motionCues")}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  overlayOn && styles.statusBadgeActive,
                ]}
              >
                <PulsingDot
                  color={overlayOn ? colors.success : colors.textTertiary}
                  size={6}
                  pulse={overlayOn}
                />
                <Text
                  style={[
                    styles.statusText,
                    overlayOn && styles.statusTextActive,
                  ]}
                  maxFontSizeMultiplier={fontScaleCaps.control}
                >
                  {overlayOn ? t("common.on") : t("common.off")}
                </Text>
              </View>
            </View>
            <Text
              style={styles.cardDescription}
              maxFontSizeMultiplier={fontScaleCaps.body}
            >
              {t("home.motionCuesDescription")}
            </Text>
            <View style={styles.cardFooter}>
              <Text
                style={styles.cardCta}
                maxFontSizeMultiplier={fontScaleCaps.control}
              >
                {overlayOn
                  ? t("home.manageOverlay")
                  : t("home.activateOverlay")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.primary}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Research footer */}
        <Animated.View
          style={footerEntrance}
          layout={LinearTransition.duration(motion.normal)}
        >
          <View style={styles.researchRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={colors.textTertiary}
            />
            <Text
              style={styles.researchText}
              maxFontSizeMultiplier={fontScaleCaps.body}
            >
              {t("home.researchNote")}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.xl,
      gap: spacing.lg,
    },
    welcomeCard: {
      backgroundColor: colors.primarySoft,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.primaryLight,
      padding: spacing.xl,
      gap: spacing.sm,
    },
    welcomeTitle: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.lg,
      color: colors.textPrimary,
      letterSpacing: letterSpacing.tight,
    },
    welcomeBody: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: fontSizes.sm * lineHeights.normal,
    },
    welcomeDismiss: {
      alignSelf: "flex-start",
      minHeight: 48,
      justifyContent: "center",
    },
    welcomeDismissLabel: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: colors.textAccent,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      gap: spacing.md,
      ...shadows.sm,
    },
    cardPressed: {
      backgroundColor: colors.surfaceTinted,
      transform: [{ scale: 0.99 }],
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    cardIconBox: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    cardMeta: {
      flex: 1,
      minWidth: 0,
    },
    cardEyebrow: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xs,
      color: colors.textTertiary,
      letterSpacing: letterSpacing.wide + 0.5,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    cardTitle: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xl,
      color: colors.textPrimary,
      letterSpacing: letterSpacing.tight,
    },
    cardDuration: {
      backgroundColor: colors.surfaceTinted,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    cardDurationText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      letterSpacing: letterSpacing.wide,
    },
    cardDescription: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      lineHeight: fontSizes.md * lineHeights.normal,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.xs,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cardCta: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.sm,
      color: colors.textAccent,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceTinted,
    },
    statusBadgeActive: {
      backgroundColor: colors.successSoft,
    },
    statusText: {
      fontFamily: fonts.bold,
      fontSize: fontSizes.xs,
      color: colors.textTertiary,
      textTransform: "uppercase",
      letterSpacing: letterSpacing.wide,
    },
    statusTextActive: {
      color: colors.success,
    },
    researchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    researchText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.xs,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: fontSizes.xs * lineHeights.relaxed,
      flex: 1,
    },
  });
