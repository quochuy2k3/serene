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
import { useMotionCues } from "@/hooks/useMotionCues";

// Tab bar clearance (height + bottom margin + inset)
const TAB_BAR_CLEARANCE = 120;

function AudioGlyph() {
  return (
    <View style={glyphStyles.audioContainer}>
      <View style={glyphStyles.audioOuterRing} />
      <View style={glyphStyles.audioMiddleRing} />
      <View style={glyphStyles.audioInnerDot} />
    </View>
  );
}

function DotsGlyph() {
  const positions = [
    { top: 6, left: 20 },
    { top: 12, right: 4 },
    { top: 24, right: 0 },
    { bottom: 12, right: 4 },
    { bottom: 6, left: 20 },
    { bottom: 12, left: 4 },
    { top: 24, left: 0 },
    { top: 12, left: 4 },
  ];
  return (
    <View style={glyphStyles.dotsContainer}>
      {positions.map((pos, i) => (
        <View
          key={i}
          style={[glyphStyles.dot, pos, { opacity: 0.4 + (i % 3) * 0.25 }]}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isActive, iosOverlayEnabled } = useMotionCues();

  const overlayOn = Platform.OS === "android" ? isActive : iosOverlayEnabled;

  return (
    <View style={styles.container}>
      <Header
        eyebrow={t("home.greeting")}
        title={t("common.appName")}
        description={t("common.tagline")}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Audio Therapy Card */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push("/audio")}
        >
          <View style={styles.cardTop}>
            <View style={styles.cardIconBox}>
              <AudioGlyph />
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.cardEyebrow} numberOfLines={1}>
                {t("home.audioEyebrow")}
              </Text>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {t("home.listen100Hz")}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            {t("home.listenDescription")}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardCta}>{t("home.startSession")}</Text>
            <Text style={styles.cardCtaArrow}>→</Text>
          </View>
        </Pressable>

        {/* Motion Cues Card */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push("/(tabs)/motion-cues")}
        >
          <View style={styles.cardTop}>
            <View style={styles.cardIconBox}>
              <DotsGlyph />
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
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: overlayOn
                      ? colors.success
                      : colors.textTertiary,
                  },
                ]}
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
              {overlayOn ? t("home.manageOverlay") : t("home.activateOverlay")}
            </Text>
            <Text style={styles.cardCtaArrow}>→</Text>
          </View>
        </Pressable>

        {/* Research footer */}
        <Text style={styles.researchText}>{t("home.researchNote")}</Text>
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
    transform: [{ scale: 0.995 }],
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
  cardCtaArrow: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
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
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wide,
  },
  statusTextActive: {
    color: colors.success,
  },
  researchText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    textAlign: "center",
    lineHeight: fontSizes.xs * lineHeights.relaxed,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});

const glyphStyles = StyleSheet.create({
  audioContainer: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  audioOuterRing: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.2,
    borderColor: colors.primary,
    opacity: 0.4,
  },
  audioMiddleRing: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.primary,
    opacity: 0.75,
  },
  audioInnerDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  dotsContainer: {
    width: 36,
    height: 36,
    position: "relative",
  },
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
