import { createContext, useMemo, useState, useContext } from "react";
import { Question } from "@/types/generic";
import { useGlobalSearchParams } from "expo-router";
import { useFlash } from "./app-context";

export type SelectedAnswer = "right" | "left";

interface QuizState {
  idx: number;
  started: boolean;
  ended: boolean;
  currentScore: number;
  showHint: boolean;
  peekAnswer: boolean;
  currentQuestion: Question | null;
}

const initState: QuizState = {
  idx: 0,
  started: false,
  ended: false,
  currentScore: 0,
  showHint: false,
  peekAnswer: true,
  currentQuestion: null,
};

interface QuizCtx extends QuizState {
  deckName?: string;
  quizzes: Question[];
  quiz_count: number;
  onEndQuiz: () => void;
  onStartQuiz: () => void;
  onRetakeQuiz: () => void;
  onUpdateHint: (val: boolean) => void;
  onUpdatePeek: (val: boolean) => void;
  onAnswerQuestion: (selected: SelectedAnswer) => void;
}

export const QuizCtx = createContext<QuizCtx | null>(null);

interface Props {
  children: React.ReactNode;
}

export function QuizProvider({ children }: Readonly<Props>) {
  const { getDeckById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const quizzes = deck?.questions ?? [];
  const quiz_count = quizzes.length;

  const [state, setState] = useState<QuizState>(initState);

  const memoizedCtxValue = useMemo(() => {
    return {
      ...state,
      deckName: deck?.title,
      quizzes,
      quiz_count,
      onUpdateHint(val: boolean) {
        setState((prev) => ({ ...prev, showHint: val }));
      },
      onUpdatePeek(val: boolean) {
        setState((prev) => ({ ...prev, peekAnswer: val }));
      },
      onRetakeQuiz() {
        setState(() => ({
          ...initState,
          started: true,
          currentQuestion: quizzes[0],
        }));
      },
      onEndQuiz() {
        setState((prev) => ({
          ...prev,
          started: false,
          ended: true,
          currentQuestion: null,
        }));
      },
      onStartQuiz() {
        setState(() => ({
          ...initState,
          started: true,
          currentQuestion: quizzes[0],
        }));
      },
      onAnswerQuestion(selected: SelectedAnswer) {
        const ended = quiz_count === state.idx + 1;

        setState((prev) => ({
          ...prev,
          ended,
          idx: ended ? prev.idx : prev.idx + 1,
          currentScore:
            selected === "right" ? prev.currentScore + 1 : prev.currentScore,
          currentQuestion: ended ? quizzes[prev.idx] : quizzes[prev.idx + 1],
        }));
      },
    };
  }, [state]);

  return (
    <QuizCtx.Provider value={memoizedCtxValue}>{children}</QuizCtx.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizCtx);
  if (!context) {
    throw new Error("useQuiz must be used within an QuizProvider");
  }
  return context;
}
