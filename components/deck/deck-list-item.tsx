import { Deck } from "@/types/generic";
import { router } from "expo-router";
import Feather from "@react-native-vector-icons/feather";
import { Text, View } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useReorderableDrag } from "react-native-reorderable-list";
import { Card } from "../ui/card";

interface Props {
  deck: Deck;
}

export const DeckListItem = ({ deck }: Props) => {
  const { muted } = useAppTheme();
  const drag = useReorderableDrag();
  const count = deck.questions.length;

  return (
    <Card
      accessibilityLabel={`Open ${deck.title}`}
      onPress={() => router.push(`/${deck.id}`)}
      onLongPress={drag}
      className="flex-row items-center gap-4"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-ink-700">
        <Text className="text-xl font-extrabold text-primary-700 dark:text-primary-200">
          {deck.title.trim().charAt(0).toUpperCase() || "?"}
        </Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="text-lg font-bold text-neutral-900 dark:text-white"
        >
          {deck.title}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {count} {count === 1 ? "card" : "cards"} · pass mark {deck.passMark}%
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={muted} />
    </Card>
  );
};
