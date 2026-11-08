import { View } from "react-native";
import { cn } from "@/utils/cn";

type Props = {
  percent: number;
  tone?: "primary" | "success" | "danger";
  className?: string;
};

const fill = {
  primary: "bg-primary-500",
  success: "bg-emerald-500 dark:bg-emerald-600",
  danger: "bg-red-500 dark:bg-red-700",
};

export const ProgressBar = ({
  percent,
  tone = "primary",
  className,
}: Props) => (
  <View
    accessibilityRole="progressbar"
    className={cn(
      "h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-ink-700",
      className,
    )}
  >
    <View
      className={cn("h-full rounded-full", fill[tone])}
      style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
    />
  </View>
);
