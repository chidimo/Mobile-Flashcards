import { Text, View, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import { DefaultButton } from "../form-elements/button";
import { NotAvailableMessage } from "./not-available-message";
import { Question } from "@/types/generic";
import { useQuiz } from "@/context/quiz-context";
import { buttonStyles, primaryBgColor, primaryTextColor } from "@/styles";

interface Props {
  qs: Question | null;
}

export const QuizQuestion = (props: Props) => {
  const { qs } = props;
  const [showAnswer, setShowAnswer] = useState(false);
  const { showHint, peekAnswer, onAnswerQuestion, onEndQuiz } = useQuiz();

  if (!qs) return null;

  return (
    <View style={[styles.sectionContainer]}>
      <View style={styles.questionContainer}>
        <Text
          style={[
            styles.text,
            {
              flex: 1,
              fontSize: 24,
            },
          ]}
        >
          {qs.question}
        </Text>
      </View>

      <View style={{ width: "100%", alignItems: "center" }}>
        <Pressable
          style={{
            paddingVertical: 4,
            borderRadius: 4,
            backgroundColor: showAnswer ? primaryBgColor : "green",
            flexDirection: "row",
          }}
          onPress={() => {
            if (peekAnswer) {
              setShowAnswer((prev) => !prev);
            }
          }}
        >
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              color: "green",
              fontSize: 22,
            }}
          >
            {qs.answer}
          </Text>
        </Pressable>
        {peekAnswer ? (
          <NotAvailableMessage message="Tap to peek answer" />
        ) : null}
        {showHint ? <NotAvailableMessage message={qs?.hint!} /> : null}
      </View>

      <View style={buttonStyles.twoColumnBtns}>
        <DefaultButton
          moreContainerStyle={{ width: "45%" }}
          title="I missed 😏"
          btnVariant="DANGER"
          onPress={() => {
            onAnswerQuestion("left");
          }}
        />

        <DefaultButton
          moreContainerStyle={{ width: "45%" }}
          title="I got it! 😎"
          btnVariant="SUCCESS"
          onPress={() => {
            onAnswerQuestion("right");
            setShowAnswer(false);
          }}
        />
      </View>

      <DefaultButton
        title="End quiz"
        moreContainerStyle={{ paddingHorizontal: 10, height: 40 }}
        moreTextStyle={{ fontSize: 16 }}
        btnVariant="SECONDARY"
        onPress={onEndQuiz}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: primaryTextColor,
    fontWeight: "bold",
    textAlign: "center",
  },
  questionContainer: {
    padding: 8,
    fontSize: 22,
    borderRadius: 4,
    flexDirection: "row",
  },
  sectionContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
});
