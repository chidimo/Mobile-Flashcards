import { Switch, Text, View } from "react-native";
import { cn } from "@/utils/cn";

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export const ToggleRow = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: Props) => (
  <View
    className={cn("flex-row items-center gap-4 py-3", disabled && "opacity-50")}
  >
    <View className="flex-1 gap-0.5">
      <Text className="text-base font-semibold text-neutral-900 dark:text-white">
        {label}
      </Text>
      {description ? (
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </Text>
      ) : null}
    </View>
    <Switch
      accessibilityLabel={label}
      value={value}
      disabled={disabled}
      onValueChange={onValueChange}
      trackColor={{ true: "#6a45f5" }}
    />
  </View>
);
