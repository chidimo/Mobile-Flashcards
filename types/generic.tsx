export interface TCreateDeck {
  name: string;
  passMark: number;
}

export interface TCreateCard {
  question: string;
  answer: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
}

export interface Deck {
  id: string;
  title: string;
  questions: Question[];
  passMark: number;
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
