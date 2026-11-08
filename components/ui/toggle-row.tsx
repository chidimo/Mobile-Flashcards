import { Switch, Text, View } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
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
}: Props) => {
  const { primary } = useAppTheme();

  return (
    <View
      className={cn(
        "flex-row items-center gap-4 py-3",
        disabled && "opacity-50",
      )}
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
        trackColor={{ true: primary }}
      />
    </View>
  );
};
