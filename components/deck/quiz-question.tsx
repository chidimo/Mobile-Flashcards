import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { Question } from "@/types/generic";
import { useQuiz } from "@/context/quiz-context";
import { cn } from "@/utils/cn";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface Props {
  qs: Question | null;
}

export const QuizQuestion = ({ qs }: Props) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const { showHint, peekAnswer, onAnswerQuestion, onEndQuiz } = useQuiz();

  if (!qs) return null;

  const answer = (side: "left" | "right") => {
    onAnswerQuestion(side);
    setShowAnswer(false);
  };

  return (
    <View className="flex-1 gap-4">
      <Card className="flex-1 justify-center gap-5 p-6">
        <Text className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
          {qs.question}
        </Text>

        {showHint ? (
          <Text className="text-center text-base italic text-neutral-500 dark:text-neutral-400">
            Hint: {qs.hint ? qs.hint : "N/A"}
          </Text>
        ) : null}

        {peekAnswer ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showAnswer ? "Hide answer" : "Show answer"}
            onPress={() => setShowAnswer((prev) => !prev)}
            className={cn(
              "min-h-20 items-center justify-center rounded-xl border px-4 py-4",
              showAnswer
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                : "border-dashed border-neutral-300 dark:border-ink-700",
            )}
          >
            <Text
              className={cn(
                "text-center text-xl",
                showAnswer
                  ? "font-semibold text-emerald-700 dark:text-emerald-300"
                  : "text-neutral-500 dark:text-neutral-400",
              )}
            >
              {showAnswer ? qs.answer : "Tap to peek at the answer"}
            </Text>
          </Pressable>
        ) : null}
      </Card>

      <View className="flex-row gap-3">
        <Button
          title="Missed it"
          icon={<Text className="text-2xl">😕</Text>}
          variant="danger"
          size="lg"
          className="flex-1"
          onPress={() => answer("left")}
        />
        <Button
          title="Got it!"
          icon={<Text className="text-2xl">😎</Text>}
          variant="success"
          size="lg"
          className="flex-1"
          onPress={() => answer("right")}
        />
      </View>

      <Button
        title="Exit quiz"
        variant="ghost"
        onPress={() => {
          onEndQuiz();
          setShowAnswer(false);
        }}
      />
    </View>
  );
};
