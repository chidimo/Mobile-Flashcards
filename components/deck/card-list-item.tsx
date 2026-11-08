import { useFlash } from "@/context/app-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Question } from "@/types/generic";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Card } from "../ui/card";

interface Props {
  index: number;
  deckId: string;
  question: Question;
}

export const CardListItem = ({ index, deckId, question }: Props) => {
  const { deleteCard } = useFlash();
  const { danger, primary } = useAppTheme();

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="rounded-full bg-primary-100 px-3 py-1 dark:bg-ink-700">
          <Text className="text-xs font-bold text-primary-700 dark:text-primary-200">
            Card {index + 1}
          </Text>
        </View>
        <View className="flex-row items-center gap-5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit card ${index + 1}`}
            hitSlop={10}
            onPress={() =>
              router.push(`/${deckId}/edit-card?cardId=${question.id}`)
            }
            className="active:opacity-60"
          >
            <Feather name="edit-2" size={20} color={primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete card ${index + 1}`}
            hitSlop={10}
            onPress={() => deleteCard(deckId, question.id)}
            className="active:opacity-60"
          >
            <Feather name="trash-2" size={20} color={danger} />
          </Pressable>
        </View>
      </View>

      <Text className="text-lg font-bold text-neutral-900 dark:text-white">
        {question.question}
      </Text>
      <Text className="text-base text-neutral-600 dark:text-neutral-300">
        {question.answer}
      </Text>
      {question.hint ? (
        <Text className="text-sm italic text-neutral-500 dark:text-neutral-400">
          Hint: {question.hint}
        </Text>
      ) : null}
    </Card>
  );
};
