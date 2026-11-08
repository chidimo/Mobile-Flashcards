import { PropsWithChildren } from "react";
import { Pressable, View } from "react-native";
import { cn } from "@/utils/cn";

type Props = PropsWithChildren<{
  className?: string;
  /** Makes the whole card tappable. */
  onPress?: () => void;
  accessibilityLabel?: string;
}>;

const base =
  "rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm shadow-primary-700/10 dark:border-ink-700 dark:bg-ink-800";

export const Card = ({
  children,
  className,
  onPress,
  accessibilityLabel,
}: Props) => {
  if (!onPress) return <View className={cn(base, className)}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(base, "active:opacity-80", className)}
    >
      {children}
    </Pressable>
  );
};
