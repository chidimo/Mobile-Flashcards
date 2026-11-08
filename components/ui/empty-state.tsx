import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Button } from "./button";

type Props = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  icon,
  title,
  message,
  actionTitle,
  onAction,
}: Props) => {
  const { primary } = useAppTheme();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-4">
      <View className="mb-2 h-20 w-20 items-center justify-center rounded-3xl bg-primary-100 dark:bg-ink-700">
        <Feather name={icon} size={34} color={primary} />
      </View>
      <Text className="text-center text-xl font-bold text-neutral-900 dark:text-white">
        {title}
      </Text>
      <Text className="mb-3 text-center text-base text-neutral-500 dark:text-neutral-400">
        {message}
      </Text>
      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          className="self-stretch"
        />
      ) : null}
    </View>
  );
};
