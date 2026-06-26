import { useRef, useState, type ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { Button } from "./Button";

export type Slide = {
  key: string;
  render: () => ReactNode;
  primaryCta: {
    label: string;
    onPress: () => void;
  };
  secondaryCta?: {
    label: string;
    onPress: () => void;
  };
};

type OnboardingSlidesProps = {
  slides: Slide[];
  title?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function OnboardingSlides({ slides, title }: OnboardingSlidesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const tabBarClearance = useTabBarClearance();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
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

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={styles.slide}>{item.render()}</View>
        )}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View style={[styles.footer, { paddingBottom: tabBarClearance }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {current.secondaryCta && (
            <Button
              label={current.secondaryCta.label}
              onPress={current.secondaryCta.onPress}
              variant="ghost"
              size="md"
              fullWidth
            />
          )}
          <Button
            label={current.primaryCta.label}
            onPress={
              currentIndex < slides.length - 1
                ? goNext
                : current.primaryCta.onPress
            }
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutralDark,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  actions: {
    gap: spacing.sm,
  },
});
