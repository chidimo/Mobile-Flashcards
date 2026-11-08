import { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { cn } from "@/utils/cn";

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  /** Sizing from the parent (e.g. "mb-4"). */
  className?: string;
};

/** A labelled input that highlights on focus and shows its error underneath. */
export const TextField = ({
  label,
  error,
  className,
  multiline,
  onFocus,
  onBlur,
  ...input
}: Props) => {
  const [focused, setFocused] = useState(false);
  return (
    <View className={cn("gap-1.5", className)}>
      <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#9ca3af"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "rounded-xl border bg-white px-4 text-base text-neutral-900 dark:bg-ink-800 dark:text-white",
          multiline ? "min-h-28 py-3" : "h-12",
          error && "border-red-500",
          !error && focused && "border-primary-500",
          !error && !focused && "border-neutral-300 dark:border-ink-700",
        )}
        {...input}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
};
