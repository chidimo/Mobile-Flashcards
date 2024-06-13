import { Text, View, StyleSheet } from "react-native";
import { useEffect } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { useFlash } from "@/context/app-context";
import { DefaultButton } from "../form-elements/button";
import { NoCardComponent } from "./no-card-component";
import { primaryTextColor, pageContainerStyle } from "@/styles";
import { QuizQuestion } from "./quiz-question";
import { QuizStarter } from "./quiz-starter";
import { useQuiz } from "@/context/quiz-context";

export const QuizMaster = () => {
  const { saveMyScore } = useFlash();
  const { deckId } = useGlobalSearchParams();

  const {
    idx,
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
      <NoCardComponent
        onPress={() => {
          router.push(`/${deckId}/add-card`);
        }}
      />
    );
  }

  return (
    <View style={[pageContainerStyle.mainPageView]}>
      {ended && currentQuestion && (
        <View style={[styles.sectionContainer]}>
          <Text style={[styles.text, { fontSize: 30 }]}>End of quiz</Text>
          <Text style={[styles.text, { fontSize: 28 }]}>
            Your score: {currentScore}/{quizzes.length}
          </Text>

          <DefaultButton
            title="Retake quiz"
            moreContainerStyle={{ width: "70%" }}
            btnVariant="PRIMARY"
            onPress={onRetakeQuiz}
          />
          <DefaultButton
            title="End quiz"
            moreContainerStyle={{ width: "70%" }}
            btnVariant="SECONDARY"
            onPress={onEndQuiz}
          />
        </View>
      )}
      {!currentQuestion && <QuizStarter />}
      {!ended && currentQuestion && (
        <View>
          <Text
            style={[
              styles.text,
              {
                fontSize: 18,
              },
            ]}
          >
            Question {idx + 1} of {quiz_count}
          </Text>

          <QuizQuestion qs={currentQuestion} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: primaryTextColor,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});
