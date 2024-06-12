import { Text, View, StyleSheet } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { AppCheckbox } from "../form-elements/check-box";
import { useQuiz } from "@/context/quiz-context";

export const QuizStarter = () => {
  const {
    deckName,
    showHint,
    peekAnswer,
    onUpdateHint,
    onUpdatePeek,
    onStartQuiz,
  } = useQuiz();

  return (
    <View style={[styles.sectionContainer]}>
      <View>
        <View style={{marginBottom: 30}}>
          <Text style={[styles.text, { fontSize: 20 }]}>
            You are about to start a quiz on {deckName}
          </Text>
          <Text style={[styles.text, { fontSize: 20 }]}>
            Here's a few options for you to set before we start
          </Text>
        </View>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppCheckbox
              checked={showHint}
              onValueChange={(val) => {
                onUpdateHint(val);
              }}
            />
            <Text style={[styles.text, { fontSize: 20 }]}>
              Show hint during quiz
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppCheckbox
              checked={peekAnswer}
              onValueChange={(val) => {
                onUpdatePeek(val);
              }}
            />
            <Text style={[styles.text, { fontSize: 20 }]}>
              Allow peek answer
            </Text>
          </View>
        </View>
      </View>

      <DefaultButton
        title="Start quiz"
        moreContainerStyle={{ width: "70%" }}
        btnVariant="PRIMARY"
        onPress={() => {
          onStartQuiz();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: "purple",
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
});
