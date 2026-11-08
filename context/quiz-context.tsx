import { createContext, useMemo, useState, useContext } from "react";
import { Question } from "@/types/generic";
import { useGlobalSearchParams } from "expo-router";
import { useFlash } from "./app-context";
import { shuffle } from "es-toolkit";

export type SelectedAnswer = "right" | "left";

interface QuizState {
  started: boolean;
  ended: boolean;
  currentScore: number;
  showHint: boolean;
  peekAnswer: boolean;
  currentQuestion: Question | null;
  currentPosition: number | null;
  randomizeQuestions: boolean;
  allowBack: boolean;
  timed: boolean;
  secondsPerQuestion: number;
  /** When the clock runs out, as a timestamp; null when the quiz is untimed or over. */
  endsAt: number | null;
  /** The quiz ended because time ran out, not because every question was answered. */
  timedOut: boolean;
  /** The answer given to each question so far, by position; changing one replaces it. */
  answers: (SelectedAnswer | undefined)[];
}

const initState: QuizState = {
  started: false,
  ended: false,
  currentScore: 0,
  showHint: false,
  peekAnswer: false,
  currentQuestion: null,
  currentPosition: null,
  randomizeQuestions: false,
  allowBack: false,
  timed: false,
  secondsPerQuestion: 30,
  endsAt: null,
  timedOut: false,
  answers: [],
};

// What the user chose on the options screen survives starting, retaking and leaving a quiz.
const keepOptions = (prev: QuizState) => ({
  showHint: prev.showHint,
  peekAnswer: prev.peekAnswer,
  randomizeQuestions: prev.randomizeQuestions,
  allowBack: prev.allowBack,
  timed: prev.timed,
  secondsPerQuestion: prev.secondsPerQuestion,
});

// The whole quiz shares one clock: every question gets the same share of it.
const deadline = (state: QuizState, questions: number) =>
  state.timed ? Date.now() + questions * state.secondsPerQuestion * 1000 : null;

const scoreOf = (answers: QuizState["answers"]) =>
  answers.filter((answer) => answer === "right").length;

interface QuizCtx extends QuizState {
  deckName?: string;
  quizzes: Question[];
  quiz_count: number;
  onEndQuiz: () => void;
  onStartQuiz: () => void;
  onRetakeQuiz: () => void;
  onUpdateHint: () => void;
  onUpdatePeek: () => void;
  onUpdateRandomizeQuestions: () => void;
  onUpdateAllowBack: () => void;
  onUpdateTimed: () => void;
  onSetSecondsPerQuestion: (seconds: number) => void;
  /** The clock ran out: unanswered questions count as missed. */
  onTimeUp: () => void;
  onAnswerQuestion: (selected: SelectedAnswer) => void;
  // Only when allowBack is on. Going forward again is just answering the question.
  onPreviousQuestion: () => void;
}

const QuizCtx = createContext<QuizCtx | null>(null);

interface Props {
  children: React.ReactNode;
}

export function QuizProvider({ children }: Readonly<Props>) {
  const { getDeckById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);

  const [state, setState] = useState<QuizState>(initState);
  // The order of the quiz in progress. Fixed when it starts so answering never reshuffles it.
  const [quizOrder, setQuizOrder] = useState<Question[] | null>(null);

  const deckQuestions = deck?.questions ?? [];

  const quizzes = quizOrder ?? deckQuestions;
  const quiz_count = quizzes.length;

  const prepareQuiz = (randomize: boolean) => {
    const order = randomize ? shuffle(deckQuestions) : deckQuestions;
    setQuizOrder(order);
    return order;
  };

  const memoizedCtxValue = useMemo(() => {
    return {
      ...state,
      deckName: deck?.title,
      quizzes,
      quiz_count,
      onUpdateHint() {
        setState((prev) => ({ ...prev, showHint: !prev.showHint }));
      },
      onUpdatePeek() {
        setState((prev) => ({ ...prev, peekAnswer: !prev.peekAnswer }));
      },
      onRetakeQuiz() {
        const order = prepareQuiz(state.randomizeQuestions);
        setState((prev) => ({
          ...initState,
          ...keepOptions(prev),
          started: true,
          endsAt: deadline(prev, order.length),
          currentPosition: 0,
          currentQuestion: order[0],
        }));
      },
      // Back to the options screen; a finished quiz has already saved its score.
      onEndQuiz() {
        setQuizOrder(null);
        setState((prev) => ({ ...initState, ...keepOptions(prev) }));
      },
      onStartQuiz() {
        const order = prepareQuiz(state.randomizeQuestions);
        setState((prev) => ({
          ...initState,
          ...keepOptions(prev),
          started: true,
          endsAt: deadline(prev, order.length),
          currentPosition: 0,
          currentQuestion: order[0],
        }));
      },
      onAnswerQuestion(selected: SelectedAnswer) {
        // Position 0 is the first question, so test for null, not falsy.
        if (state.currentPosition === null) {
          return;
        }
        const position = state.currentPosition;
        const ended = quiz_count === position + 1;
        // Score from the answers, so changing an earlier one never counts twice.
        const answers = [...state.answers];
        answers[position] = selected;

        setState((prev) => ({
          ...prev,
          ended,
          answers,
          endsAt: ended ? null : prev.endsAt,
          currentPosition: ended ? null : position + 1,
          currentScore: scoreOf(answers),
          currentQuestion: ended ? null : quizzes[position + 1],
        }));
      },
      onUpdateRandomizeQuestions() {
        setState((prev) => ({
          ...prev,
          randomizeQuestions: !prev.randomizeQuestions,
        }));
      },
      onUpdateAllowBack() {
        setState((prev) => ({ ...prev, allowBack: !prev.allowBack }));
      },
      onUpdateTimed() {
        setState((prev) => ({ ...prev, timed: !prev.timed }));
      },
      onSetSecondsPerQuestion(seconds: number) {
        setState((prev) => ({ ...prev, secondsPerQuestion: seconds }));
      },
      onTimeUp() {
        setState((prev) =>
          prev.ended
            ? prev
            : {
                ...prev,
                ended: true,
                timedOut: true,
                endsAt: null,
                currentPosition: null,
                currentQuestion: null,
                currentScore: scoreOf(prev.answers),
              },
        );
      },
      onPreviousQuestion() {
        if (!state.allowBack || !state.currentPosition) {
          return;
        }
        const currentPosition = state.currentPosition - 1;

        setState((prev) => ({
          ...prev,
          currentPosition,
          currentQuestion: quizzes[currentPosition],
        }));
      },
    };
  }, [state, quizOrder, deckQuestions]);

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
