import { showNotification } from "@/components/notifier";
import { flashCardKey } from "@/constants";
import {
  // clearAll,
  getItemFromStorage,
  setItemToStorage,
} from "@/lib/work-with-storage";
import { createContext, useMemo, useState, useContext, useEffect } from "react";
import { Deck, Question, ScoreSaver, StoreValue } from "@/types/generic";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";

export interface FlashContext {
  deckNames: string[];
  deckOfCards: Deck[] | null;
  addDeck: (name: string, passMark: number) => void;
  updateDeck: (deckId: string, name: string, passMark: number) => void;
  updateCard: (
    deckId: string,
    qId: string,
    question: string,
    answer: string,
    hint?: string
  ) => void;
  importDeck: (title: string, passMark: number, questions: Question[]) => void;
  deleteDeck: (deckId: string) => void;
  deleteCard: (deckId: string, qId: string) => void;
  getDeckById: (id: string) => Deck | null;
  getScoresById: (id: string) => ScoreSaver[] | null;
  getQuestionById: (deckId: string, qId: string) => Question | null;
  addCardToDeck: (
    id: string,
    question: string,
    answer: string,
    hint?: string
  ) => void;
  saveMyScore: (deckId: string, actualScore: number, qstns: number) => void;
}

const FlashContext = createContext<FlashContext | null>(null);

interface Props {
  children: React.ReactNode;
}

export function FlashProvider({ children }: Readonly<Props>) {
  const [state, setState] = useState<StoreValue>({
    flashcards: null,
    myScores: null,
  });
  const flashes = state.flashcards ?? {};

  useEffect(() => {
    getItemFromStorage<StoreValue>(flashCardKey, (data) => {
      if (data) setState(data);
    });
    // clearAll();
  }, []);

  const memoizedCtxValue = useMemo(() => {
    return {
      deckOfCards: flashes ? Object.values(flashes) : [],
      deckNames: flashes ? Object.values(flashes).map((e) => e.title) : [],
      deleteDeck(deckId: string) {
        if (!state.flashcards) return;

        const updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
          },
        };
        delete updated.flashcards[deckId];
        setItemToStorage(updated, flashCardKey);
        setState(updated);
      },
      deleteCard(deckId: string, qId: string) {
        if (!state.flashcards) return;

        const updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [deckId]: {
              ...state.flashcards[deckId],
              questions: [
                ...(state.flashcards?.[deckId].questions ?? []).filter(
                  (q) => q.id !== qId
                ),
              ],
            },
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
      },
      getDeckById(id: string) {
        return flashes[id] ?? null;
      },
      getScoresById(id: string) {
        return state.myScores?.[id] ?? null;
      },
      getQuestionById(deckId: string, qId: string) {
        const deck = flashes[deckId] ?? null;
        if (deck) return deck.questions.find((q) => q.id === qId) ?? null;
        return null;
      },
      addCardToDeck(
        deckId: string,
        question: string,
        answer: string,
        hint?: string
      ) {
        if (!state.flashcards) return;
        const id = Crypto.randomUUID();
        const updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [deckId]: {
              ...state.flashcards[deckId],
              questions: [
                ...(state.flashcards?.[deckId].questions ?? []),
                { id, question, answer, hint },
              ],
            },
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
      },
      updateCard(
        deckId: string,
        qId: string,
        question: string,
        answer: string,
        hint?: string
      ) {
        if (!state.flashcards) return;
        let updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [deckId]: {
              ...state.flashcards[deckId],
              questions: state.flashcards?.[deckId].questions.map((q) => {
                if (q.id === qId) return { ...q, question, answer, hint };
                return q;
              }),
            },
          },
        };

        setItemToStorage(updated, flashCardKey);
        setState(updated);
      },
      saveMyScore(
        deckId: string,
        actualScore: number,
        numberOfQuestions: number
      ) {
        let updated = state;
        if (state.myScores === null) {
          state.myScores = {};
        }
        updated = {
          ...state,
          myScores: {
            ...state.myScores,
            [deckId]: [
              ...(state.myScores?.[deckId] ?? []),
              {
                numberOfQuestions,
                actualScore,
                date: new Date().toISOString(),
              },
            ],
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
        showNotification("Success", "Score saved successfully!");
      },
      updateDeck(deckId: string, title: string, passMark: number) {
        if (!state.flashcards) return;
        let updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [deckId]: {
              ...state.flashcards[deckId],
              title,
              passMark,
            },
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
      },
      addDeck(name: string, passMark: number) {
        const id = Crypto.randomUUID();
        let updated = state;
        if (state.flashcards === null) {
          updated.flashcards = {};
        }
        if (state.flashcards && name in state.flashcards) {
          showNotification("Fail", "Deck already exists");
          return;
        }
        updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [id]: {
              id,
              title: name,
              questions: [],
              passMark,
              addedOn: new Date().toISOString(),
            },
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
        showNotification("Success", "Deck added successfully!");
        router.push(`/${id}`);
      },
      importDeck(title: string, passMark: number, questions: Question[]) {
        const id = Crypto.randomUUID();
        let updated = state;
        if (state.flashcards === null) {
          updated.flashcards = {};
        }
        updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [id]: {
              id,
              title,
              questions,
              passMark,
              addedOn: new Date().toISOString(),
            },
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
      },
    };
  }, [state]);

  return (
    <FlashContext.Provider value={memoizedCtxValue}>
      {children}
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error("useFlash must be used within an FlashProvider");
  }
  return context;
}
