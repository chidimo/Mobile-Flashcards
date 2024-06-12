import { Text, View, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import { useGlobalSearchParams } from "expo-router";
import { useFlash } from "@/context/app-context";
import { DefaultButton } from "../form-elements/button";
import { NoCardComponent } from "./no-card-component";
import { NotAvailableMessage } from "./not-available-message";

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

  const [showAnswer, setShowAnswer] = useState(false);
  const [state, setState] = useState<QuizState>(initState);

  const { index, score } = state;
  const quiz = quizzes[index];
  const question_number = index + 1;

  const get_next_question = (index: number, score: number, option: number) => {
    const end = index + 1 === quizzes.length;
    if (end) {
      saveMyScore(deckId as string, score, quizzes.length);
    }
    setState((prev) => ({
      ...prev,
      end,
      index: index + 1,
      score: option === 1 ? score + 1 : score,
    }));
  };

  if (quizzes.length === 0) {
    return <NoCardComponent deckId={deckId as string} />;
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      {state.end ? (
        <View style={[styles.sectionContainer]}>
          <Text style={[styles.text, { fontSize: 30 }]}>End of quiz</Text>
          <Text style={[styles.text, { fontSize: 28 }]}>
            Your score: {score}/{quizzes.length}
          </Text>

          <DefaultButton
            title="Retake quiz"
            moreContainerStyle={{ width: "70%" }}
            btnVariant="PRIMARY"
            onPress={() => {
              setState(initState);
            }}
          />
        </View>
      ) : (
        <View style={[styles.sectionContainer]}>
          <Text
            style={[
              styles.text,
              {
                fontSize: 18,
              },
            ]}
          >
            Question {question_number} of {quiz_count}
          </Text>

          <View style={styles.questionContainer}>
            <Text
              style={[
                styles.text,
                {
                  fontSize: 28,
                },
              ]}
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
              <Text
                style={{ textAlign: "center", color: "green", fontSize: 28 }}
              >
                {quiz.answer}
              </Text>
            </Pressable>
            <NotAvailableMessage message="Tap to reveal answer" />
          </View>

          <View style={styles.answerButtonsContainer}>
            <DefaultButton
              moreContainerStyle={{ width: "45%" }}
              title="Incorrect"
              btnVariant="DANGER"
              onPress={() => {
                get_next_question(index, score, 0);
              }}
            />

            <DefaultButton
              moreContainerStyle={{ width: "45%" }}
              title="Correct"
              btnVariant="SUCCESS"
              onPress={() => {
                get_next_question(index, score, 1);
              }}
            />
          </View>
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
