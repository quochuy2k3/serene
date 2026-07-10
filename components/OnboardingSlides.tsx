import { useRef, useState, type ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  FadeIn,
  FadeOut,
  LinearTransition,
  type SharedValue,
} from "react-native-reanimated";
import {
  fonts,
  fontSizes,
  fontScaleCaps,
  spacing,
  motion,
  type ThemeColors,
} from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { Button } from "./Button";

export type Slide = {
  key: string;
  /** isFocused is false while the slide is offscreen — use it to pause
   * looping demo animations so hidden slides don't burn frames. */
  render: (isFocused: boolean) => ReactNode;
  primaryCta: {
    label: string;
    onPress: () => void;
  };
  secondaryCta?: {
    label: string;
    onPress: () => void;
    variant?: "ghost" | "outlined";
    size?: "md" | "lg";
  };
};

type OnboardingSlidesProps = {
  slides: Slide[];
  title?: string;
  onSkip?: () => void;
};

/**
 * A slide fades/scales away as it leaves the viewport while its content
 * parallaxes at a slower rate — the transition tracks the finger.
 */
function SlideItem({
  index,
  width,
  scrollX,
  children,
}: {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  children: ReactNode;
}) {
  const styles = useThemedStyles(createStyles);
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const frameStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      inputRange,
      [0.35, 1, 0.35],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          scrollX.value,
          inputRange,
          [0.94, 1, 0.94],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          inputRange,
          [width * 0.25, 0, -width * 0.25],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[{ width }, styles.slide, frameStyle]}>
      <Animated.View style={[styles.slideInner, parallaxStyle]}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

/** Pagination dot that morphs into a pill as its slide scrolls into focus. */
function PagerDot({
  index,
  width,
  scrollX,
}: {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const dotStyle = useAnimatedStyle(() => ({
    width: interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP
    ),
    backgroundColor: interpolateColor(scrollX.value, inputRange, [
      colors.borderStrong,
      colors.primary,
      colors.borderStrong,
    ]),
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

export function OnboardingSlides({
  slides,
  title,
  onSkip,
}: OnboardingSlidesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const tabBarClearance = useTabBarClearance();
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      slides[currentIndex].primaryCta.onPress();
    }
  };

  const current = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {title && (
        <Text style={styles.title} maxFontSizeMultiplier={fontScaleCaps.heading}>
          {title}
        </Text>
      )}

      {onSkip && (
        <View style={styles.skipRow}>
          {!isLast && (
            <Animated.View
              entering={FadeIn.duration(motion.quick)}
              exiting={FadeOut.duration(motion.quick)}
            >
              <Button
                label={t("common.skip")}
                onPress={onSkip}
                variant="ghost"
                size="sm"
              />
            </Animated.View>
          )}
        </View>
      )}

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        extraData={currentIndex}
        renderItem={({ item, index }) => (
          <SlideItem index={index} width={width} scrollX={scrollX}>
            {item.render(index === currentIndex)}
          </SlideItem>
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={[styles.footer, { paddingBottom: tabBarClearance }]}>
        <View
          style={styles.dots}
          accessible
          accessibilityLabel={t("common.stepIndicator", {
            current: currentIndex + 1,
            total: slides.length,
          })}
          accessibilityLiveRegion="polite"
        >
          {slides.map((_, i) => (
            <PagerDot key={i} index={i} width={width} scrollX={scrollX} />
          ))}
        </View>

        <Animated.View
          style={styles.actions}
          layout={LinearTransition.duration(motion.normal)}
        >
          {current.secondaryCta && (
            <Animated.View
              key={`secondary-${current.secondaryCta.label}`}
              entering={FadeIn.duration(motion.normal)}
              exiting={FadeOut.duration(motion.quick)}
            >
              <Button
                label={current.secondaryCta.label}
                onPress={current.secondaryCta.onPress}
                variant={current.secondaryCta.variant ?? "ghost"}
                size={current.secondaryCta.size ?? "md"}
                fullWidth
              />
            </Animated.View>
          )}
          <Animated.View
            key={`primary-${current.primaryCta.label}`}
            entering={FadeIn.duration(motion.normal)}
          >
            <Button
              label={current.primaryCta.label}
              onPress={isLast ? current.primaryCta.onPress : goNext}
              variant="primary"
              size="lg"
              fullWidth
            />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontFamily: fonts.bold,
      fontSize: fontSizes["2xl"],
      color: colors.textPrimary,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    skipRow: {
      minHeight: 36,
      alignItems: "flex-end",
      paddingHorizontal: spacing.lg,
    },
    slide: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    slideInner: {
      flex: 1,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.lg,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.sm,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    actions: {
      gap: spacing.sm,
    },
  });
