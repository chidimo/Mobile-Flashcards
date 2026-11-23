import { Deck, DeletedDeck, ScoreSaver, StoreValue } from "@/types/generic";
import { toSyncDeck } from "./deck-hash";
import { SyncDeck } from "./types";

/** The app's decks (with their scores) and deletions, in the shape the sync engine works on. */
export const snapshotFromStore = (store: StoreValue) => ({
  decks: Object.fromEntries(
    Object.values(store.flashcards ?? {}).map((deck) => [
      deck.id,
      toSyncDeck(deck, store.myScores?.[deck.id] ?? null),
    ]),
  ) as Record<string, SyncDeck>,
  deleted: Object.fromEntries(
    (store.deletedDecks ?? []).map((d) => [d.id, d.deletedAt]),
  ) as Record<string, string>,
});

const toDeck = ({ scores: _scores, ...deck }: SyncDeck): Deck => deck;

/** What a finished sync changes in the app's store. */
export type StoreChanges = {
  put: SyncDeck[];
  remove: string[];
  clearDeleted: string[];
};

/**
 * Applies downloaded decks and removals. Scores move with their deck. Deck order is left alone:
 * it is per device, and decks missing from it sort last. Deleted decks also lose their scores.
 */
export const applyChangesToStore = (
  store: StoreValue,
  { put, remove, clearDeleted }: StoreChanges,
): StoreValue => {
  const flashcards = { ...store.flashcards };
  const myScores: Record<string, ScoreSaver[]> = { ...store.myScores };
  for (const deck of put) {
    flashcards[deck.id] = toDeck(deck);
    myScores[deck.id] = deck.scores;
  }
  for (const id of remove) {
    delete flashcards[id];
    delete myScores[id];
  }
  const cleared = new Set(clearDeleted);
  const deletedDecks: DeletedDeck[] | undefined = store.deletedDecks?.filter(
    (d) => !cleared.has(d.id),
  );
  return {
    ...store,
    flashcards,
    myScores,
    ...(deletedDecks ? { deletedDecks } : {}),
  };
};
