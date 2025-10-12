import { Text, View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { AppCheckbox } from "../form-elements/check-box";
import { useQuiz } from "@/context/quiz-context";
import { primaryTextColor, pageContainerStyle } from "@/styles";
import { CustomText } from "../custom-text";

export const QuizStarter = () => {
  const {
    deckName,
    showHint,
    peekAnswer,
    randomizeQuestions,
    onUpdateHint,
    onUpdatePeek,
    onUpdateRandomizeQuestions,
    onStartQuiz,
  } = useQuiz();

  const options = [
    {
      label: "Show hint during quiz",
      value: showHint,
      onChange: () => {
        onUpdateHint();
      },
    },
    {
      label: "Allow peek answer",
      value: peekAnswer,
      onChange: () => {
        onUpdatePeek();
      },
    },
    {
      label: "Randomize questions",
      value: randomizeQuestions,
      onChange: () => {
        onUpdateRandomizeQuestions();
      },
    },
    {
      label: "Time quiz (coming soon)",
      value: false,
      onChange: () => {},
      disabled: true,
    },
    {
      label: "Allow back and forth (coming soon)",
      value: false,
      onChange: () => {},
      disabled: true,
    },
  ];

  return (
    <View
      style={[
        pageContainerStyle.minorPageView,
        { justifyContent: "space-evenly" },
      ]}
    >
      <View style={{ width: "100%" }}>
        <CustomText
          isHeader
          moreContainerStyle={{ marginBottom: 30 }}
          text={deckName ?? ""}
        />
        <CustomText
          moreTextStyle={{ fontSize: 18 }}
          moreContainerStyle={{ marginBottom: 30 }}
          text={`You are about to start the quiz. Use the below options to customize your experience`}
        />

        <View style={{ width: "100%", marginBottom: 30 }}>
          {options.map((option) => {
            return (
              <View
                key={option.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <AppCheckbox
                  checked={option.value}
                  disabled={option.disabled}
                  onValueChange={() => {
                    option.onChange();
                  }}
                />
                <Text
                  style={{
                    color: primaryTextColor,
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: 20,
                  }}
                >
                  {option.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <DefaultButton
        title="Start quiz"
        moreContainerStyle={{ width: "100%" }}
        btnVariant="PRIMARY"
        onPress={() => {
          onStartQuiz();
        }}
      />
    </View>
  );
};
