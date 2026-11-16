import { useFlash } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { router } from "expo-router";
import Feather from "@react-native-vector-icons/feather";
import { FlatList, Pressable, Text, View } from "react-native";
import { Card } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";

export const ArchivedList = () => {
  const { archivedDecks, unarchiveDeck } = useFlash();
  const { primary } = useAppTheme();

  if (archivedDecks.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="archive"
          title="Nothing archived"
          message="Archive a deck from its Manage tab to tuck it away without deleting it."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={archivedDecks}
        keyExtractor={(deck) => deck.id}
        ListHeaderComponent={
          <View className="pb-4">
            <PageTitle
              title="Archived"
              subtitle={`${archivedDecks.length} ${archivedDecks.length === 1 ? "deck" : "decks"}`}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View className="pb-4">
            <Card
              accessibilityLabel={`Open ${item.title}`}
              onPress={() => router.push(`/${item.id}`)}
              className="flex-row items-center gap-4"
            >
              <View className="flex-1 gap-0.5">
                <Text
                  numberOfLines={1}
                  className="text-lg font-bold text-neutral-900 dark:text-white"
                >
                  {item.title}
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  {item.questions.length}{" "}
                  {item.questions.length === 1 ? "card" : "cards"}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Unarchive ${item.title}`}
                onPress={() => unarchiveDeck(item.id)}
                hitSlop={8}
                className="p-2"
              >
                <Feather name="inbox" size={22} color={primary} />
              </Pressable>
            </Card>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};
