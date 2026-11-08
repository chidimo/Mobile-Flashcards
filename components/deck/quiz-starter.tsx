import { Text, View } from "react-native";
import { useQuiz } from "@/context/quiz-context";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ChoiceChips } from "../ui/choice-chips";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";
import { ToggleRow } from "../ui/toggle-row";

export const QuizStarter = () => {
  const {
    deckName,
    showHint,
    peekAnswer,
    randomizeQuestions,
    allowBack,
    timed,
    secondsPerQuestion,
    onUpdateHint,
    onUpdatePeek,
    onUpdateRandomizeQuestions,
    onUpdateAllowBack,
    onUpdateTimed,
    onSetSecondsPerQuestion,
    onStartQuiz,
  } = useQuiz();

  return (
    <Screen scroll>
      <PageTitle
        title={deckName ?? "Quiz"}
        subtitle="Choose how you want to be quizzed."
      />

      <Card className="py-1">
        <View className="divide-y divide-neutral-100 dark:divide-ink-700">
          <ToggleRow
            label="Show hints"
            description="Reveal a card's hint during the quiz"
            value={showHint}
            onValueChange={onUpdateHint}
          />
          <ToggleRow
            label="Allow peeking"
            description="Tap a card to check its answer"
            value={peekAnswer}
            onValueChange={onUpdatePeek}
          />
          <ToggleRow
            label="Shuffle questions"
            value={randomizeQuestions}
            onValueChange={onUpdateRandomizeQuestions}
          />
          <ToggleRow
            label="Timed quiz"
            description="One clock for the whole quiz"
            value={timed}
            onValueChange={onUpdateTimed}
          />
          {timed ? (
            <View className="gap-2 pb-3">
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                Time per question
              </Text>
              <ChoiceChips
                label="per question"
                options={[
                  { value: 15, label: "15s" },
                  { value: 30, label: "30s" },
                  { value: 60, label: "60s" },
                ]}
                value={secondsPerQuestion}
                onChange={onSetSecondsPerQuestion}
              />
            </View>
          ) : null}
          <ToggleRow
            label="Go back and forth"
            description="Revisit and change earlier answers"
            value={allowBack}
            onValueChange={onUpdateAllowBack}
          />
        </View>
      </Card>

      <Button title="Start quiz" onPress={onStartQuiz} />
    </Screen>
  );
};
