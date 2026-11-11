import Feather from "@react-native-vector-icons/feather";
import { LayoutAnimation, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { Question } from "@/types/generic";
import { useQuiz } from "@/context/quiz-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Markdown } from "../ui/markdown";

interface Props {
  qs: Question | null;
}

export const QuizQuestion = ({ qs }: Props) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const { text } = useAppTheme();
  const {
    showHint,
    peekAnswer,
    allowBack,
    answers,
    currentPosition,
    onAnswerQuestion,
    onPreviousQuestion,
    onEndQuiz,
  } = useQuiz();

  if (!qs) return null;

  // Ease the answer in so the card doesn't jump.
  const toggleAnswer = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAnswer((prev) => !prev);
  };

  const position = currentPosition ?? 0;
  const previousAnswer = answers[position];

  const answer = (side: "left" | "right") => {
    onAnswerQuestion(side);
    setShowAnswer(false);
  };

  return (
    <View className="flex-1 gap-4">
      {/* The card hugs its content and sits in the middle; long code scrolls. */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow justify-center"
        showsVerticalScrollIndicator={false}
      >
        <Card className="gap-4 p-4">
          <Markdown size={22} centered bold>
            {qs.question}
          </Markdown>

          {showHint && qs.hint ? (
            <View className="opacity-70">
              <Markdown size={16} centered>
                {`*Hint:* ${qs.hint}`}
              </Markdown>
            </View>
          ) : null}

          {peekAnswer ? (
            <View className="gap-3">
              {showAnswer ? (
                <View className="gap-2 rounded-xl border border-emerald-500/60 bg-emerald-50 p-4 dark:bg-emerald-950">
                  <Text className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Answer
                  </Text>
                  <Markdown size={18}>{qs.answer}</Markdown>
                </View>
              ) : null}
              <Button
                title={showAnswer ? "Hide answer" : "Show answer"}
                variant="outline"
                icon={
                  <Feather
                    name={showAnswer ? "eye-off" : "eye"}
                    size={18}
                    color={text}
                  />
                }
                onPress={toggleAnswer}
              />
            </View>
          ) : null}
        </Card>
      </ScrollView>

      {previousAnswer ? (
        <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          You answered:{" "}
          {previousAnswer === "right" ? "😎 Got it" : "😕 Missed it"}
        </Text>
      ) : null}

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

      <View className="flex-row gap-3">
        {allowBack && position > 0 ? (
          <Button
            title="Previous"
            variant="secondary"
            className="flex-1"
            onPress={() => {
              onPreviousQuestion();
              setShowAnswer(false);
            }}
          />
        ) : null}
        <Button
          title="Exit quiz"
          variant="ghost"
          className="flex-1"
          onPress={() => {
            onEndQuiz();
            setShowAnswer(false);
          }}
        />
      </View>
    </View>
  );
};
