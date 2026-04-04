import { ReactNode } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { colors, fonts, fontSizes, spacing, borderRadius } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";

type ButtonVariant = "primary" | "secondary" | "inverted" | "outlined" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  haptic?: "tap" | "medium" | "success" | "none";
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  haptic = "tap",
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const haptics = useHaptics();

  const handlePress = () => {
    if (haptic !== "none") {
      haptics[haptic]?.();
    }
    onPress?.();
  };

  const containerStyle: StyleProp<ViewStyle>[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle: StyleProp<TextStyle>[] = [
    styles.labelBase,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    isDisabled && styles.labelDisabled,
  ];

  const spinnerColor =
    variant === "primary" || variant === "inverted"
      ? colors.textInverse
      : colors.primary;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        containerStyle,
        pressed && !isDisabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {icon}
          <Text style={labelStyle}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },

  // Variants
  variant_primary: {
    backgroundColor: colors.primary,
  },
  variant_secondary: {
    backgroundColor: colors.tertiaryLight,
  },
  variant_inverted: {
    backgroundColor: colors.textPrimary,
  },
  variant_outlined: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  variant_ghost: {
    backgroundColor: "transparent",
  },

  // Label base
  labelBase: {
    fontFamily: fonts.semiBold,
    textAlign: "center",
  },
  labelDisabled: {
    opacity: 0.8,
  },

  // Label sizes
  labelSize_sm: {
    fontSize: fontSizes.sm,
  },
  labelSize_md: {
    fontSize: fontSizes.md,
  },
  labelSize_lg: {
    fontSize: fontSizes.lg,
  },

  // Label variants
  label_primary: {
    color: colors.textInverse,
  },
  label_secondary: {
    color: colors.primary,
  },
  label_inverted: {
    color: colors.textInverse,
  },
  label_outlined: {
    color: colors.primary,
  },
  label_ghost: {
    color: colors.primary,
  },
});
