import { View } from "react-native";
import { useQuiz } from "@/context/quiz-context";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";
import { ToggleRow } from "../ui/toggle-row";

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
            description="Coming soon"
            value={false}
            onValueChange={() => {}}
            disabled
          />
          <ToggleRow
            label="Go back and forth"
            description="Coming soon"
            value={false}
            onValueChange={() => {}}
            disabled
          />
        </View>
      </Card>

      <Button title="Start quiz" onPress={onStartQuiz} />
    </Screen>
  );
};
