import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_HEIGHT } from "@/components/PillTabBar";
import { spacing } from "@/constants/theme";

/**
 * Vertical space occupied by the floating pill tab bar, including the safe-area
 * inset it rests on. Use as `paddingBottom` on a screen's scroll content so the
 * last item is never hidden behind the bar.
 *
 *   const clearance = useTabBarClearance();
 *   <ScrollView contentContainerStyle={[styles.content, { paddingBottom: clearance }]} />
 *
 * @param gap extra breathing room above the bar (defaults to `spacing.xl`).
 */
export function useTabBarClearance(gap = spacing.xl): number {
  const insets = useSafeAreaInsets();
  const barBottom = insets.bottom > 0 ? insets.bottom : spacing.lg;
  return barBottom + TAB_BAR_HEIGHT + gap;
}
