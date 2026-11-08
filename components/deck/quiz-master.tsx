import { Text, View } from "react-native";
import { useEffect } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { useFlash } from "@/context/app-context";
import { useQuiz } from "@/context/quiz-context";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { Pill } from "../ui/pill";
import { ProgressBar } from "../ui/progress-bar";
import { Screen } from "../ui/screen";
import { QuizQuestion } from "./quiz-question";
import { QuizStarter } from "./quiz-starter";

export const QuizMaster = () => {
  const { saveMyScore, getDeckById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);

  const {
    currentPosition,
    ended,
    quiz_count,
    quizzes,
    currentQuestion,
    currentScore,
    onEndQuiz,
    onRetakeQuiz,
  } = useQuiz();

  useEffect(() => {
    if (ended) {
      saveMyScore(deckId as string, currentScore, quiz_count);
    }
  }, [ended]);

  if (quizzes.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="file-plus"
          title="No cards to quiz on"
          message="Add some cards to this deck first."
          actionTitle="Add a card"
          onAction={() => router.push(`/${deckId}/add-card`)}
        />
      </Screen>
    );
  }

  if (ended) {
    const percent = Math.round((currentScore / quizzes.length) * 100);
    const passed = percent >= (deck?.passMark ?? 50);
    return (
      <Screen>
        <View className="flex-1 justify-center">
          <Card className="items-center gap-3 p-8">
            <Pill
              text={passed ? "Passed" : "Keep practising"}
              tone={passed ? "success" : "danger"}
              className="self-center"
            />
            <Text className="text-6xl font-extrabold text-neutral-900 dark:text-white">
              {percent}%
            </Text>
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              {currentScore} of {quizzes.length} correct
            </Text>
            <ProgressBar
              percent={percent}
              tone={passed ? "success" : "danger"}
              className="mt-2 self-stretch"
            />
          </Card>
        </View>
        <View className="gap-3">
          <Button title="Retake quiz" onPress={onRetakeQuiz} />
          <Button
            title="See scores"
            variant="secondary"
            onPress={() => {
              router.push(`/${deckId}/my-scores`);
              onEndQuiz();
            }}
          />
        </View>
      </Screen>
    );
  }

  if (!currentQuestion) return <QuizStarter />;

  const position = (currentPosition ?? 0) + 1;
  return (
    <Screen>
      <View className="gap-2">
        <Text className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Question {position} of {quiz_count}
        </Text>
        <ProgressBar percent={(position / quiz_count) * 100} />
      </View>
      <QuizQuestion qs={currentQuestion} />
    </Screen>
  );
};
