import { Text, View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { useFlash } from "@/context/app-context";
import { DefaultButton } from "../form-elements/button";
import { NoCardComponent } from "./no-card-component";
import { pageContainerStyle } from "@/styles";
import { Question } from "@/types/generic";
import { QuizQuestion, SelectedAnswer } from "./quiz-question";

interface QuizState {
  idx: number;
  started: boolean;
  ended: boolean;
  currentScore: number;
  currentQuestion: Question | null;
}

const initState = {
  idx: 0,
  started: false,
  ended: false,
  currentScore: 0,
  currentQuestion: null,
};

export const TakeQuiz = () => {
  const { getDeckById, saveMyScore } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const quizzes = deck?.questions ?? [];
  const quiz_count = quizzes.length;

  const [quizState, setQuizState] = useState<QuizState>(initState);

  console.log(JSON.stringify(quizState, null, 2));

  useEffect(() => {
    if (quizState.ended) {
      saveMyScore(deckId as string, quizState.currentScore, quiz_count);
    }
  }, [quizState.ended]);

  if (quizzes.length === 0) {
    return (
      <NoCardComponent
        onPress={() => {
          router.push(`/${deckId}/add-card`);
        }}
      />
    );
  }

  return (
    <View style={[pageContainerStyle.view]}>
      {quizState.ended && (
        <View style={[styles.sectionContainer]}>
          <Text style={[styles.text, { fontSize: 30 }]}>End of quiz</Text>
          <Text style={[styles.text, { fontSize: 28 }]}>
            Your score: {quizState.currentScore}/{quizzes.length}
          </Text>

          <DefaultButton
            title="Retake quiz"
            moreContainerStyle={{ width: "70%" }}
            btnVariant="PRIMARY"
            onPress={() => {
              setQuizState(() => ({
                ...initState,
                currentQuestion: quizzes[0],
              }));
            }}
          />
        </View>
      )}
      {!quizState.currentQuestion && (
        <View style={[styles.sectionContainer]}>
          <Text>You are about to start a quiz on {deck?.title}</Text>
          <Text>Here's a few options for you to set before we start</Text>

          <DefaultButton
            title="Start quiz"
            moreContainerStyle={{ width: "70%" }}
            btnVariant="PRIMARY"
            onPress={() => {
              setQuizState((prev) => ({
                ...prev,
                currentQuestion: quizzes[0],
              }));
            }}
          />
        </View>
      )}
      {quizState.currentQuestion && (
        <View>
          <Text
            style={[
              styles.text,
              {
                fontSize: 18,
              },
            ]}
          >
            Question {quizState.idx + 1} of {quiz_count}
          </Text>

          <QuizQuestion
            qs={quizState.currentQuestion}
            onAnswer={(selected: SelectedAnswer) => {
              const ended = quiz_count === quizState.idx + 1;

              setQuizState((prev) => ({
                ...prev,
                ended,
                idx: ended ? prev.idx : prev.idx + 1,
                currentScore:
                  selected === "right"
                    ? prev.currentScore + 1
                    : prev.currentScore,
                currentQuestion: quizzes[prev.idx + 1],
              }));
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: "purple",
    fontWeight: "bold",
    textAlign: "center",
  },
  questionContainer: {
    padding: 8,
    fontSize: 22,
    borderRadius: 4,
  },
  sectionContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
  answerButtonsContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
