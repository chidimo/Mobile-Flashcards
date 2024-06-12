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
    })
  ),
});

export interface TImportDeck {
  title: string;
  passMark: number;
  importString: z.infer<typeof ImportSchema>;
}

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
}

export interface Deck {
  id: string;
  title: string;
  questions: Question[];
  passMark: number;
  addedOn: string;
}

export interface ScoreSaver {
  numberOfQuestions: number;
  actualScore: number;
  date: string;
}

export type StoreValue = {
  flashcards: Record<string, Deck> | null;
  myScores: Record<string, ScoreSaver[]> | null;
};
