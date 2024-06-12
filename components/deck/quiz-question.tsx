import { Text, View, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import { DefaultButton } from "../form-elements/button";
import { NotAvailableMessage } from "./not-available-message";
import { Question } from "@/types/generic";
import { useQuiz } from "@/context/quiz-context";

interface Props {
  qs: Question | null;
  showHint?: boolean;
  peekAnswer?: boolean;
}

export const QuizQuestion = (props: Props) => {
  const { qs } = props;
  const { showHint, peekAnswer, onAnswerQuestion } = useQuiz();

  const [showAnswer, setShowAnswer] = useState(false);

  if (!qs) return null;

  return (
    <View style={[styles.sectionContainer]}>
      <View style={styles.questionContainer}>
        <Text
          style={[
            styles.text,
            {
              fontSize: 28,
            },
          ]}
        >
          {qs.question}
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
            if (peekAnswer) {
              setShowAnswer((prev) => !prev);
            }
          }}
        >
          <Text style={{ textAlign: "center", color: "green", fontSize: 28 }}>
            {qs.answer}
          </Text>
        </Pressable>
        {peekAnswer ? (
          <NotAvailableMessage message="Tap to reveal answer" />
        ) : null}
        {showHint ? <NotAvailableMessage message={qs?.hint!} /> : null}
      </View>

      <View style={styles.answerButtonsContainer}>
        <DefaultButton
          moreContainerStyle={{ width: "45%" }}
          title="Incorrect"
          btnVariant="DANGER"
          onPress={() => {
            onAnswerQuestion("left");
          }}
        />

        <DefaultButton
          moreContainerStyle={{ width: "45%" }}
          title="Correct"
          btnVariant="SUCCESS"
          onPress={() => {
            onAnswerQuestion("right");
          }}
        />
      </View>
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
