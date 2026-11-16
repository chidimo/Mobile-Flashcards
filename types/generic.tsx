import { z } from "zod";

export interface TCreateDeck {
  title: string;
  passMark: number;
}

export const ImportSchema = z.object({
  id: z.string(),
  title: z.string(),
  passMark: z.string().or(z.number()),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      hint: z.string().optional(),
    }),
  ),
});

export interface TCreateCard {
  question: string;
  answer: string;
  hint?: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  /** When the card was last changed (ISO). Drives sync; filled in by migrateStore for old data. */
  updatedAt?: string;
}

export interface Deck {
  id: string;
  title: string;
  questions: Question[];
  passMark: number;
  addedOn: string;
  /** Hidden from Home and listed under Archived; absent on decks saved before archiving existed. */
  isArchived?: boolean;
  /** When the deck, its cards, its archive state or its scores last changed (ISO). */
  updatedAt?: string;
}

/** A deleted deck, kept so a sync can tell it was deleted here rather than never existing. */
export interface DeletedDeck {
  id: string;
  deletedAt: string;
}

export interface ScoreSaver {
  numberOfQuestions: number;
  actualScore: number;
  date: string;
}

export type StoreValue = {
  flashcards: Record<string, Deck> | null;
  myScores: Record<string, ScoreSaver[]> | null;
  /** Deck ids in the order the person arranged them; absent until they first reorder. */
  deckOrder?: string[];
  deletedDecks?: DeletedDeck[];
};
