import { Text, View } from "react-native";

type Props = { value: string; label: string };

/** A big number with a small caption, for summary cards. */
export const Stat = ({ value, label }: Props) => (
  <View className="flex-1 items-center gap-0.5">
    <Text className="text-2xl font-extrabold text-primary-600 dark:text-primary-200">
      {value}
    </Text>
    <Text className="text-xs text-neutral-500 dark:text-neutral-400">
      {label}
    </Text>
  </View>
);
