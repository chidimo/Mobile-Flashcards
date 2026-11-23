import { DeletedDeck, StoreValue } from "@/types/generic";

/**
 * Fills in `updatedAt` for data saved before sync existed: a deck and its cards take the deck's
 * `addedOn`. Deterministic, so every device that migrates the same data gets the same values.
 */
export const migrateStore = (store: StoreValue): StoreValue => {
  if (!store.flashcards) return store;
  const flashcards = Object.fromEntries(
    Object.entries(store.flashcards).map(([id, deck]) => {
      const updatedAt = deck.updatedAt ?? deck.addedOn;
      return [
        id,
        {
          ...deck,
          updatedAt,
          questions: deck.questions.map((q) => ({
            ...q,
            updatedAt: q.updatedAt ?? updatedAt,
          })),
        },
      ];
    }),
  );
  return { ...store, flashcards };
};

/** Records that a deck was deleted, so a sync can tell "deleted here" from "never had it". */
export const addTombstone = (
  deleted: DeletedDeck[] = [],
  id: string,
  deletedAt: string,
): DeletedDeck[] => [...deleted.filter((d) => d.id !== id), { id, deletedAt }];

/** Forgets a deletion when a deck with that id comes back (imported again). */
export const removeTombstone = (
  deleted: DeletedDeck[] | undefined,
  id: string,
) => deleted?.filter((d) => d.id !== id);
