import { Text, View, StyleSheet, Pressable } from "react-native";
import { sharedStyles } from "@/styles";
import { useState } from "react";
import { useGlobalSearchParams } from "expo-router";
import { useFlash } from "@/context/app-context";
import { DefaultButton } from "../form-elements/button";
import { NoCardComponent } from "./no-card-component";

interface QuizState {
  index: number;
  score: number;
  end: boolean;
}

export const TakeQuiz = () => {
  const { getDeckById, saveMyScore } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const quizzes = deck?.questions ?? [];
  const quiz_count = quizzes.length;

  const initState = {
    index: 0,
    score: 0,
    end: false,
  };

  const [scoreSaved, setScoreSaved] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [state, setState] = useState<QuizState>(initState);

  const { index, score } = state;
  const quiz = quizzes[index];
  const question_number = index + 1;

  const get_next_question = (index: number, score: number, option: number) => {
    setShowAnswer(false);
    setState((prev) => ({
      ...prev,
      index: index + 1,
      end: index + 1 === quizzes.length,
      score: option === 1 ? score + 1 : score,
    }));
  };

  if (quizzes.length === 0) {
    return <NoCardComponent deckId={deckId as string} />;
  }

  if (state.end) {
    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          justifyContent: "space-evenly",
        }}
      >
        <Text style={sharedStyles.headingText}>End of quiz</Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: 28,
            color: "purple",
          }}
        >
          Your score: {score}/{quizzes.length}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <DefaultButton
            title="Retake quiz"
            moreContainerStyle={{ width: "45%" }}
            onPress={() => {
              setScoreSaved(false);
              setState(initState);
            }}
          />
          <DefaultButton
            title="Save my score"
            moreContainerStyle={{ width: "45%" }}
            btnVariant="SUCCESS"
            disabled={scoreSaved}
            onPress={() => {
              saveMyScore(deckId as string, score, quizzes.length);
              setScoreSaved(true);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          paddingHorizontal: 15,
          justifyContent: "space-evenly",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            color: "purple",
          }}
        >
          Question {question_number} of {quiz_count}
        </Text>

        <View style={styles.questionContainer}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 28,
              color: "purple",
            }}
          >
            {quiz.question}
          </Text>
        </View>

        <View style={{ width: "100%", alignItems: "center" }}>
          <Pressable
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              backgroundColor: showAnswer ? "#fff" : "green",
            }}
            onPress={() => {
              setShowAnswer((prev) => !prev);
            }}
          >
            <Text style={{ textAlign: "center", color: "green", fontSize: 28 }}>
              {quiz.answer}
            </Text>
          </Pressable>
          <Text>Tap to reveal answer</Text>
        </View>

        <View style={styles.answerButtonsContainer}>
          <DefaultButton
            moreContainerStyle={{ width: "45%" }}
            title="Incorrect"
            btnVariant="DANGER"
            onPress={() => get_next_question(index, score, 0)}
          />

          <DefaultButton
            moreContainerStyle={{ width: "45%" }}
            title="Correct"
            btnVariant="SUCCESS"
            onPress={() => get_next_question(index, score, 1)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    padding: 8,
    fontSize: 22,
    borderRadius: 4,
  },
  answerButtonsContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
