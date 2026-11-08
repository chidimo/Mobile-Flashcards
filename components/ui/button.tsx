import { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { cn } from "@/utils/cn";

export type ButtonVariant =
  "primary" | "secondary" | "success" | "danger" | "outline" | "ghost";

type Props = {
  title: string;
  size?: "md" | "lg";
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  /** Shown before the title (not while loading). */
  icon?: ReactNode;
  /** Sizing from the parent (e.g. "flex-1"); the look stays on the variant. */
  className?: string;
};

const container: Record<ButtonVariant, string> = {
  primary: "bg-primary-600",
  secondary: "bg-primary-50 dark:bg-ink-700",
  success: "bg-emerald-600 dark:bg-emerald-800",
  danger: "bg-red-600 dark:bg-red-900",
  outline: "border border-neutral-300 bg-transparent dark:border-ink-700",
  ghost: "bg-transparent",
};

const label: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-primary-700 dark:text-primary-100",
  success: "text-white dark:text-emerald-50",
  danger: "text-white dark:text-red-50",
  outline: "text-neutral-900 dark:text-white",
  ghost: "text-primary-600 dark:text-primary-200",
};

const height = { md: "h-12", lg: "h-14" };

const solid = (variant: ButtonVariant) =>
  variant === "primary" || variant === "success" || variant === "danger";

export const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  icon,
  className,
}: Props) => {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive }}
      onPress={onPress}
      disabled={inactive}
      className={cn(
        "flex-row items-center justify-center rounded-xl px-5",
        height[size],
        container[variant],
        inactive ? "opacity-50" : "active:opacity-80",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={solid(variant) ? "#fff" : "#6a45f5"} />
      ) : (
        <>
          {icon ? <View className="mr-2.5">{icon}</View> : null}
          <Text
            numberOfLines={1}
            className={cn(
              "font-semibold",
              size === "lg" ? "text-lg" : "text-base",
              label[variant],
            )}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};
