import { act, create } from "react-test-renderer";

import { QuizProvider, useQuiz } from "../quiz-context";

const questions = [
  { id: "1", question: "Q1", answer: "A1" },
  { id: "2", question: "Q2", answer: "A2" },
];

jest.mock("expo-router", () => ({
  useGlobalSearchParams: () => ({ deckId: "deck" }),
}));
jest.mock("../app-context", () => ({
  useFlash: () => ({
    getDeckById: () => ({ id: "deck", title: "Deck", questions }),
  }),
}));

type Quiz = ReturnType<typeof useQuiz>;

const setup = () => {
  const ref: { current: Quiz | null } = { current: null };
  const Probe = () => {
    ref.current = useQuiz();
    return null;
  };
  act(() => {
    create(
      <QuizProvider>
        <Probe />
      </QuizProvider>,
    );
  });
  return () => ref.current as Quiz;
};

describe("quiz context", () => {
  it("moves past the first question when it is answered", () => {
    const quiz = setup();
    act(() => quiz().onStartQuiz());
    expect(quiz().currentQuestion?.id).toBe("1");

    act(() => quiz().onAnswerQuestion("right"));

    expect(quiz().currentQuestion?.id).toBe("2");
    expect(quiz().currentPosition).toBe(1);
    expect(quiz().currentScore).toBe(1);
  });

  it("ends after the last question and keeps the score", () => {
    const quiz = setup();
    act(() => quiz().onStartQuiz());
    act(() => quiz().onAnswerQuestion("right"));
    act(() => quiz().onAnswerQuestion("left"));

    expect(quiz().ended).toBe(true);
    expect(quiz().currentQuestion).toBeNull();
    expect(quiz().currentScore).toBe(1);
  });

  it("returns to the start screen without ending when the quiz is exited", () => {
    const quiz = setup();
    act(() => quiz().onStartQuiz());
    act(() => quiz().onEndQuiz());

    expect(quiz().ended).toBe(false);
    expect(quiz().currentQuestion).toBeNull();
  });

  it("keeps the same order across answers when shuffling", () => {
    const quiz = setup();
    act(() => quiz().onUpdateRandomizeQuestions());
    act(() => quiz().onStartQuiz());
    const order = quiz().quizzes.map((q) => q.id);

    act(() => quiz().onAnswerQuestion("right"));

    expect(quiz().quizzes.map((q) => q.id)).toEqual(order);
  });

  it("ignores Previous unless going back is allowed", () => {
    const quiz = setup();
    act(() => quiz().onStartQuiz());
    act(() => quiz().onAnswerQuestion("right"));

    act(() => quiz().onPreviousQuestion());

    expect(quiz().currentQuestion?.id).toBe("2");
  });

  it("goes back to the previous question when allowed", () => {
    const quiz = setup();
    act(() => quiz().onUpdateAllowBack());
    act(() => quiz().onStartQuiz());
    act(() => quiz().onAnswerQuestion("right"));

    act(() => quiz().onPreviousQuestion());

    expect(quiz().currentQuestion?.id).toBe("1");
    expect(quiz().currentPosition).toBe(0);
    expect(quiz().answers[0]).toBe("right");
  });

  it("does not go back before the first question", () => {
    const quiz = setup();
    act(() => quiz().onUpdateAllowBack());
    act(() => quiz().onStartQuiz());

    act(() => quiz().onPreviousQuestion());

    expect(quiz().currentPosition).toBe(0);
  });

  it("scores a changed answer once", () => {
    const quiz = setup();
    act(() => quiz().onUpdateAllowBack());
    act(() => quiz().onStartQuiz());
    act(() => quiz().onAnswerQuestion("right"));
    act(() => quiz().onPreviousQuestion());
    act(() => quiz().onAnswerQuestion("left"));
    act(() => quiz().onAnswerQuestion("right"));

    expect(quiz().ended).toBe(true);
    expect(quiz().currentScore).toBe(1);
  });

  it("keeps the going-back option when the quiz is retaken", () => {
    const quiz = setup();
    act(() => quiz().onUpdateAllowBack());
    act(() => quiz().onStartQuiz());
    act(() => quiz().onRetakeQuiz());

    expect(quiz().allowBack).toBe(true);
    expect(quiz().answers).toEqual([]);
  });

  it("has no deadline unless the quiz is timed", () => {
    const quiz = setup();
    act(() => quiz().onStartQuiz());

    expect(quiz().endsAt).toBeNull();
  });

  it("sets one deadline for the whole quiz", () => {
    const quiz = setup();
    act(() => quiz().onUpdateTimed());
    act(() => quiz().onSetSecondsPerQuestion(15));
    const before = Date.now();
    act(() => quiz().onStartQuiz());

    // two questions at 15s each
    expect(quiz().endsAt).toBeGreaterThanOrEqual(before + 30_000);
    expect(quiz().endsAt).toBeLessThanOrEqual(Date.now() + 30_000);
  });

  it("ends the quiz when time runs out, counting what was answered", () => {
    const quiz = setup();
    act(() => quiz().onUpdateTimed());
    act(() => quiz().onStartQuiz());
    act(() => quiz().onAnswerQuestion("right"));

    act(() => quiz().onTimeUp());

    expect(quiz().ended).toBe(true);
    expect(quiz().timedOut).toBe(true);
    expect(quiz().endsAt).toBeNull();
    expect(quiz().currentScore).toBe(1);
  });

  it("stops the clock when every question is answered in time", () => {
    const quiz = setup();
    act(() => quiz().onUpdateTimed());
    act(() => quiz().onStartQuiz());
    act(() => quiz().onAnswerQuestion("right"));
    act(() => quiz().onAnswerQuestion("right"));

    expect(quiz().ended).toBe(true);
    expect(quiz().timedOut).toBe(false);
    expect(quiz().endsAt).toBeNull();
  });

  it("ignores time running out after the quiz already ended", () => {
    const quiz = setup();
    act(() => quiz().onUpdateTimed());
    act(() => quiz().onStartQuiz());
    act(() => quiz().onAnswerQuestion("right"));
    act(() => quiz().onAnswerQuestion("left"));

    act(() => quiz().onTimeUp());

    expect(quiz().timedOut).toBe(false);
  });

  it("keeps the timer options when the quiz is retaken", () => {
    const quiz = setup();
    act(() => quiz().onUpdateTimed());
    act(() => quiz().onSetSecondsPerQuestion(60));
    act(() => quiz().onStartQuiz());
    act(() => quiz().onRetakeQuiz());

    expect(quiz().timed).toBe(true);
    expect(quiz().secondsPerQuestion).toBe(60);
    expect(quiz().endsAt).not.toBeNull();
  });
});
