import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

type Tone = "neutral" | "success" | "danger" | "primary";

const container: Record<Tone, string> = {
  neutral: "bg-neutral-100 dark:bg-ink-700",
  success: "bg-emerald-100 dark:bg-emerald-950",
  danger: "bg-red-100 dark:bg-red-950",
  primary: "bg-primary-100 dark:bg-ink-700",
};

const label: Record<Tone, string> = {
  neutral: "text-neutral-700 dark:text-neutral-200",
  success: "text-emerald-700 dark:text-emerald-300",
  danger: "text-red-700 dark:text-red-300",
  primary: "text-primary-700 dark:text-primary-200",
};

export const Pill = ({
  text,
  tone = "neutral",
  className = "self-start",
}: {
  text: string;
  tone?: Tone;
  /** Alignment within the parent. */
  className?: string;
}) => (
  <View className={cn("rounded-full px-3 py-1", container[tone], className)}>
    <Text className={cn("text-xs font-semibold", label[tone])}>{text}</Text>
  </View>
);
