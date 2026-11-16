import { showNotification } from "@/components/notifier";
import { flashCardKey } from "@/constants";
import {
  // clearAll,
  getItemFromStorage,
  setItemToStorage,
} from "@/lib/work-with-storage";
import { orderDecks } from "@/lib/deck-order";
import {
  addTombstone,
  migrateStore,
  removeTombstone,
} from "@/lib/store-migration";
import { createContext, useMemo, useState, useContext, useEffect } from "react";
import { Deck, Question, ScoreSaver, StoreValue } from "@/types/generic";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";
import { isValidV4UUID } from "@/utils/validate-uuid";

interface FlashContext {
  deckNames: string[];
  /** Active (not archived) decks in the person's order. */
  deckOfCards: Deck[] | null;
  archivedDecks: Deck[];
  addDeck: (name: string, passMark: number) => void;
  updateDeck: (deckId: string, name: string, passMark: number) => void;
  updateCard: (
    deckId: string,
    qId: string,
    question: string,
    answer: string,
    hint?: string,
  ) => void;
  importDeck: (
    id: string | null,
    title: string,
    passMark: number,
    questions: Question[],
  ) => void;
  archiveDeck: (deckId: string) => void;
  unarchiveDeck: (deckId: string) => void;
  deleteDeck: (deckId: string) => void;
  /** Saves the decks in this order (all deck ids, first to last). */
  reorderDecks: (deckIds: string[]) => void;
  deleteCard: (deckId: string, qId: string) => void;
  getDeckById: (id: string) => Deck | null;
  getScoresById: (id: string) => ScoreSaver[] | null;
  getQuestionById: (deckId: string, qId: string) => Question | null;
  addCardToDeck: (
    id: string,
    question: string,
    answer: string,
    hint?: string,
  ) => void;
  saveMyScore: (deckId: string, actualScore: number, qstns: number) => void;
  resetScore: (deckId: string) => void;
}

const FlashContext = createContext<FlashContext | null>(null);

interface Props {
  children: React.ReactNode;
}

const now = () => new Date().toISOString();

/** The decks with this one's updatedAt set to now (scores live outside the deck but sync with it). */
const touchDeck = (decks: StoreValue["flashcards"], deckId: string) =>
  decks?.[deckId]
    ? { ...decks, [deckId]: { ...decks[deckId], updatedAt: now() } }
    : decks;

export function FlashProvider({ children }: Readonly<Props>) {
  const [state, setState] = useState<StoreValue>({
    flashcards: null,
    myScores: null,
  });
  const flashes = state.flashcards ?? {};

  useEffect(() => {
    getItemFromStorage<StoreValue>(flashCardKey, (data) => {
      if (data) setState(migrateStore(data));
    });
    // clearAll();
  }, []);

  const setDeckArchived = (deckId: string, isArchived: boolean) => {
    if (!state.flashcards?.[deckId]) return;
    const updated = {
      ...state,
      flashcards: {
        ...state.flashcards,
        [deckId]: {
          ...state.flashcards[deckId],
          isArchived,
          updatedAt: now(),
        },
      },
    };
    setItemToStorage(updated, flashCardKey);
    setState(updated);
  };

  const memoizedCtxValue = useMemo(() => {
    return {
      deckOfCards: orderDecks(flashes, state.deckOrder).filter(
        (deck) => !deck.isArchived,
      ),
      archivedDecks: orderDecks(flashes, state.deckOrder).filter(
        (deck) => deck.isArchived,
      ),
      deckNames: flashes ? Object.values(flashes).map((e) => e.title) : [],
      archiveDeck(deckId: string) {
        setDeckArchived(deckId, true);
      },
      unarchiveDeck(deckId: string) {
        setDeckArchived(deckId, false);
      },
      deleteDeck(deckId: string) {
        if (!state.flashcards) return;

        const updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
          },
        };
        delete updated.flashcards[deckId];
        updated.deckOrder = state.deckOrder?.filter((id) => id !== deckId);
        updated.deletedDecks = addTombstone(state.deletedDecks, deckId, now());
        setItemToStorage(updated, flashCardKey);
        setState(updated);
      },
      reorderDecks(deckIds: string[]) {
        const updated = { ...state, deckOrder: deckIds };
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
              updatedAt: now(),
              questions: [
                ...(state.flashcards?.[deckId].questions ?? []).filter(
                  (q) => q.id !== qId,
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
        hint?: string,
      ) {
        if (!state.flashcards) return;
        const id = Crypto.randomUUID();
        const stamp = now();
        const updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [deckId]: {
              ...state.flashcards[deckId],
              updatedAt: stamp,
              questions: [
                ...(state.flashcards?.[deckId].questions ?? []),
                { id, question, answer, hint, updatedAt: stamp },
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
        hint?: string,
      ) {
        if (!state.flashcards) return;
        const stamp = now();
        let updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [deckId]: {
              ...state.flashcards[deckId],
              updatedAt: stamp,
              questions: state.flashcards?.[deckId].questions.map((q) => {
                if (q.id === qId)
                  return { ...q, question, answer, hint, updatedAt: stamp };
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
        numberOfQuestions: number,
      ) {
        let updated = state;
        if (state.myScores === null) {
          state.myScores = {};
        }
        updated = {
          ...state,
          flashcards: touchDeck(state.flashcards, deckId),
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
              updatedAt: now(),
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
        const stamp = now();
        updated = {
          ...state,
          flashcards: {
            ...state.flashcards,
            [id]: {
              id,
              title: name,
              questions: [],
              passMark,
              addedOn: stamp,
              updatedAt: stamp,
            },
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
        showNotification("Success", "Deck added successfully!");
        router.push(`/${id}`);
      },
      importDeck(
        id: string | null,
        title: string,
        passMark: number,
        questions: Question[],
      ) {
        const newId = id && isValidV4UUID(id) ? id : Crypto.randomUUID();
        let updated = state;
        if (state.flashcards === null) {
          updated.flashcards = {};
        }
        const stamp = now();
        updated = {
          ...state,
          deletedDecks: removeTombstone(state.deletedDecks, newId),
          flashcards: {
            ...state.flashcards,
            [newId]: {
              id: newId,
              title,
              questions: questions.map((q) => ({ ...q, updatedAt: stamp })),
              passMark,
              addedOn: stamp,
              updatedAt: stamp,
            },
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
      },
      resetScore(deckId: string) {
        if (!state.myScores) return;
        let updated = {
          ...state,
          flashcards: touchDeck(state.flashcards, deckId),
          myScores: {
            ...state.myScores,
            [deckId]: [],
          },
        };
        setItemToStorage(updated, flashCardKey);
        setState(updated);
        showNotification("Success", "Scoreboard reset successfully!");
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
