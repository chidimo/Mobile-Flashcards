import { useFlash } from "@/context/app-context";
import { Feather } from "@expo/vector-icons";
import { router, useGlobalSearchParams } from "expo-router";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Text, View } from "react-native";
import { CardListItem } from "@/components/deck/card-list-item";
import { formatDate } from "@/utils/format-datetime";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { Screen } from "../ui/screen";
import { Stat } from "../ui/stat";

export const CardList = () => {
  const { deckId } = useGlobalSearchParams();
  const { getDeckById } = useFlash();
  const { primary } = useAppTheme();

  const deck = getDeckById(deckId as string);
  const questionList = deck?.questions ?? [];

  if (questionList.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="file-plus"
          title="No cards yet"
          message={`Add the first card to ${deck?.title ?? "this deck"}.`}
          actionTitle="Add your first card"
          onAction={() => router.push(`/${deck?.id}/add-card`)}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Card className="gap-4">
        <View className="gap-1">
          <Text className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {deck?.title}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Created {formatDate(deck?.addedOn)}
          </Text>
        </View>
        <View className="flex-row">
          <Stat value={String(questionList.length)} label="Cards" />
          <Stat value={`${deck?.passMark}%`} label="Pass mark" />
        </View>
        <View className="flex-row gap-3">
          <Button
            title="Start quiz"
            className="flex-1"
            onPress={() => router.push(`/${deck?.id}/take-quiz`)}
          />
          <Button
            title="Add card"
            variant="secondary"
            className="flex-1"
            icon={<Feather name="plus" size={18} color={primary} />}
            onPress={() => router.push(`/${deck?.id}/add-card`)}
          />
        </View>
      </Card>

      {questionList.map((qs, idx) => (
        <CardListItem
          key={qs.id}
          index={idx}
          question={qs}
          deckId={deckId as string}
        />
      ))}
    </Screen>
  );
};
