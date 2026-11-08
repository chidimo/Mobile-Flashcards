import { Pressable, Text, View } from "react-native";
import { cn } from "@/utils/cn";

type Props<T extends string | number> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** A short row of mutually exclusive choices. */
export const ChoiceChips = <T extends string | number>({
  label,
  options,
  value,
  onChange,
}: Props<T>) => (
  <View
    className="flex-row gap-2"
    accessibilityRole="radiogroup"
    accessibilityLabel={label}
  >
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityLabel={`${option.label} ${label}`}
          accessibilityState={{ selected }}
          onPress={() => onChange(option.value)}
          className={cn(
            "flex-1 items-center rounded-xl border py-2.5 active:opacity-70",
            selected
              ? "border-primary-600 bg-primary-100 dark:border-primary-400 dark:bg-ink-700"
              : "border-neutral-200 dark:border-ink-700",
          )}
        >
          <Text
            className={cn(
              "text-sm font-semibold",
              selected
                ? "text-primary-700 dark:text-primary-200"
                : "text-neutral-600 dark:text-neutral-300",
            )}
          >
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);
