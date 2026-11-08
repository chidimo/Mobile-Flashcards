import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
import { cn } from "@/utils/cn";

type Props = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
};

/** A tappable row for a list of actions, styled like olamma's drawer items. */
export const ActionRow = ({
  icon,
  label,
  description,
  onPress,
  destructive = false,
}: Props) => {
  const { primary, danger, muted } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-xl px-3 py-3 active:bg-neutral-100 dark:active:bg-neutral-800"
    >
      <View
        className={cn(
          "h-10 w-10 items-center justify-center rounded-xl",
          destructive
            ? "bg-red-100 dark:bg-red-950"
            : "bg-primary-100 dark:bg-ink-700",
        )}
      >
        <Feather name={icon} size={20} color={destructive ? danger : primary} />
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            "text-base font-semibold",
            destructive
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-900 dark:text-white",
          )}
        >
          {label}
        </Text>
        {description ? (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color={muted} />
    </Pressable>
  );
};
