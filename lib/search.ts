import { Deck, Question } from "@/types/generic";

export type SearchHit = {
  deck: Deck;
  /** Cards whose question, answer or hint match; all cards when only the title matched. */
  cards: Question[];
  titleMatch: boolean;
};

const terms = (query: string) =>
  query.toLowerCase().split(/\s+/).filter(Boolean);

const matches = (text: string, words: string[]) => {
  const lower = text.toLowerCase();
  return words.every((word) => lower.includes(word));
};

/**
 * Decks whose title matches or that hold matching cards. Every word must appear (any order, any
 * case); a card matches across its question, answer and hint together. A blank query finds nothing.
 */
export const searchDecks = (decks: Deck[], query: string): SearchHit[] => {
  const words = terms(query);
  if (words.length === 0) return [];
  return decks.flatMap((deck) => {
    const titleMatch = matches(deck.title, words);
    const cards = deck.questions.filter((q) =>
      matches(`${q.question}\n${q.answer}\n${q.hint ?? ""}`, words),
    );
    return titleMatch || cards.length > 0 ? [{ deck, cards, titleMatch }] : [];
  });
};
