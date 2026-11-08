import { useFlash } from "@/context/app-context";
import Feather from "@react-native-vector-icons/feather";
import { useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Question } from "@/types/generic";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Card } from "../ui/card";
import { markdownToPlain } from "@/utils/markdown-plain";
import { Markdown } from "../ui/markdown";
import { ConfirmDialog } from "../ui/confirm-dialog";

interface Props {
  index: number;
  deckId: string;
  question: Question;
}

export const CardListItem = ({ index, deckId, question }: Props) => {
  const { deleteCard } = useFlash();
  const { danger, primary } = useAppTheme();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
            onPress={() => setConfirmingDelete(true)}
            className="active:opacity-60"
          >
            <Feather name="trash-2" size={20} color={danger} />
          </Pressable>
        </View>
      </View>

      <Markdown size={17} bold>
        {question.question}
      </Markdown>
      <Markdown size={16}>{question.answer}</Markdown>
      {question.hint ? (
        <View className="opacity-70">
          <Markdown size={14}>{`*Hint:* ${question.hint}`}</Markdown>
        </View>
      ) : null}

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this card?"
        message={`This deletes "${markdownToPlain(question.question, 60)}". You can't undo this.`}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          deleteCard(deckId, question.id);
        }}
      />
    </Card>
  );
};
