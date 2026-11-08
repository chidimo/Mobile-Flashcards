import { Text, View } from "react-native";

type Props = { title: string; subtitle?: string };

export const PageTitle = ({ title, subtitle }: Props) => (
  <View className="gap-1">
    <Text
      accessibilityRole="header"
      className="text-3xl font-extrabold text-neutral-900 dark:text-white"
    >
      {title}
    </Text>
    {subtitle ? (
      <Text className="text-base text-neutral-500 dark:text-neutral-400">
        {subtitle}
      </Text>
    ) : null}
  </View>
);
