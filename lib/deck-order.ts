import { Deck } from "@/types/generic";

/**
 * Decks in the person's saved order. Decks missing from the order (new ones, or data saved before
 * ordering existed) keep their stored order after it; ids in the order that no longer exist are skipped.
 */
export const orderDecks = (
  decks: Record<string, Deck>,
  deckOrder: string[] = [],
): Deck[] => {
  const ids = [...new Set([...deckOrder, ...Object.keys(decks)])];
  return ids.flatMap((id) => (decks[id] ? [decks[id]] : []));
};
