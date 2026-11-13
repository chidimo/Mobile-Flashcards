import { useFlash } from "@/context/app-context";
import { searchDecks } from "@/lib/search";
import { markdownToPlain } from "@/utils/markdown-plain";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Card } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { Screen } from "../ui/screen";

const CARDS_SHOWN = 5;

export const SearchScreen = () => {
  const { deckOfCards, archivedDecks } = useFlash();
  const [query, setQuery] = useState("");
  const hits = useMemo(
    () => searchDecks([...(deckOfCards ?? []), ...archivedDecks], query),
    [deckOfCards, archivedDecks, query],
  );
  const searching = query.trim() !== "";

  return (
    <Screen>
      <TextInput
        accessibilityLabel="Search decks and cards"
        placeholder="Search decks and cards"
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        className="h-12 rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
      />
      {searching && hits.length === 0 ? (
        <EmptyState
          icon="search"
          title="No matches"
          message={`Nothing in your decks matches "${query.trim()}".`}
        />
      ) : null}
      <FlatList
        data={hits}
        keyExtractor={(hit) => hit.deck.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="pb-4">
            <Card
              accessibilityLabel={`Open ${item.deck.title}`}
              onPress={() => router.push(`/${item.deck.id}`)}
              className="gap-2"
            >
              <Text
                numberOfLines={1}
                className="text-lg font-bold text-neutral-900 dark:text-white"
              >
                {item.deck.title}
                {item.deck.isArchived ? " · Archived" : ""}
              </Text>
              {item.titleMatch && item.cards.length === 0 ? (
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Deck name matches
                </Text>
              ) : null}
              {item.cards.slice(0, CARDS_SHOWN).map((card) => (
                <Pressable
                  key={card.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open card ${markdownToPlain(card.question, 40)}`}
                  onPress={() =>
                    router.push(`/${item.deck.id}/edit-card?cardId=${card.id}`)
                  }
                  className="rounded-lg bg-neutral-100 px-3 py-2 active:opacity-60 dark:bg-ink-700"
                >
                  <Text
                    numberOfLines={1}
                    className="text-base text-neutral-900 dark:text-white"
                  >
                    {markdownToPlain(card.question)}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-sm text-neutral-500 dark:text-neutral-400"
                  >
                    {markdownToPlain(card.answer)}
                  </Text>
                </Pressable>
              ))}
              {item.cards.length > CARDS_SHOWN ? (
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  +{item.cards.length - CARDS_SHOWN} more cards in this deck
                </Text>
              ) : null}
            </Card>
          </View>
        )}
      />
    </Screen>
  );
};
