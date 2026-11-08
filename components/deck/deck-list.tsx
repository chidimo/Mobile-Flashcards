import { DeckListItem } from "@/components/deck/deck-list-item";
import { useFlash } from "@/context/app-context";
import { router } from "expo-router";
import { Text, View } from "react-native";
import ReorderableList, { reorderItems } from "react-native-reorderable-list";
import { EmptyState } from "../ui/empty-state";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";

export const DeckList = () => {
  const { deckOfCards, reorderDecks } = useFlash();
  const decks = deckOfCards ?? [];

  if (decks.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="layers"
          title="Welcome to Flashcards"
          message="Create your first deck to start learning."
          actionTitle="Add your first deck"
          onAction={() => router.push("/add-deck")}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ReorderableList
        data={decks}
        keyExtractor={(deck) => deck.id}
        onReorder={({ from, to }) =>
          reorderDecks(reorderItems(decks, from, to).map((deck) => deck.id))
        }
        renderItem={({ item }) => (
          <View className="pb-4">
            <DeckListItem deck={item} />
          </View>
        )}
        ListHeaderComponent={
          <View className="pb-4">
            <PageTitle
              title="Your decks"
              subtitle={`${decks.length} ${decks.length === 1 ? "deck" : "decks"}`}
            />
            {decks.length > 1 ? (
              <Text className="pt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Press and hold a deck to drag it into place.
              </Text>
            ) : null}
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};
