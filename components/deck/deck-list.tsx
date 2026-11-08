import { DeckListItem } from "@/components/deck/deck-list-item";
import { useFlash } from "@/context/app-context";
import { router } from "expo-router";
import { EmptyState } from "../ui/empty-state";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";

export const DeckList = () => {
  const { deckOfCards } = useFlash();
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
    <Screen scroll>
      <PageTitle
        title="Your decks"
        subtitle={`${decks.length} ${decks.length === 1 ? "deck" : "decks"}`}
      />
      {decks.map((deck) => (
        <DeckListItem key={deck.id} deck={deck} />
      ))}
    </Screen>
  );
};
