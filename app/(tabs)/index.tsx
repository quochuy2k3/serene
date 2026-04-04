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
import { Header } from "@/components/Header";
import { PulsingDot } from "@/components/PulsingDot";
import { useMotionCues } from "@/hooks/useMotionCues";
import { useHaptics } from "@/hooks/useHaptics";
import { useScreenEntrance, useStaggeredEntrance } from "@/hooks/useScreenEntrance";

const TAB_BAR_CLEARANCE = 120;

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isActive, iosOverlayEnabled } = useMotionCues();
  const haptics = useHaptics();

  const overlayOn = Platform.OS === "android" ? isActive : iosOverlayEnabled;

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Audio Therapy Card */}
        <Animated.View style={card1Entrance}>
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={handleAudioPress}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardIconBox}>
                <Ionicons name="headset-outline" size={28} color={colors.primary} />
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.cardEyebrow} numberOfLines={1}>
                  {t("home.audioEyebrow")}
                </Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {t("home.listen100Hz")}
                </Text>
              </View>
              <View style={styles.cardDuration}>
                <Text style={styles.cardDurationText}>60s</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>
              {t("home.listenDescription")}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCta}>{t("home.startSession")}</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.primary}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Motion Cues Card */}
        <Animated.View style={card2Entrance}>
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={handleMotionPress}
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
                <Text style={styles.cardEyebrow} numberOfLines={1}>
                  {t("home.motionEyebrow")}
                </Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
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
                >
                  {overlayOn ? t("common.on") : t("common.off")}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>
              {t("home.motionCuesDescription")}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCta}>
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
        <Animated.View style={footerEntrance}>
          <View style={styles.researchRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={colors.textTertiary}
            />
            <Text style={styles.researchText}>{t("home.researchNote")}</Text>
          </View>
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
    gap: spacing.lg,
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
    color: colors.primary,
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
