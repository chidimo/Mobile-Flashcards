import { useFlash } from "@/context/app-context";
import { router, useGlobalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { EmptyState } from "../ui/empty-state";
import { PageTitle } from "../ui/page-title";
import { Card } from "../ui/card";
import { Pill } from "../ui/pill";
import { Screen } from "../ui/screen";
import { Stat } from "../ui/stat";
import { ScoreCard } from "./score-card";

export const DeckScores = () => {
  const { getDeckById, getScoresById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const scores = getScoresById(deckId as string);

  if (!scores?.length) {
    return (
      <Screen>
        <EmptyState
          icon="bar-chart-2"
          title="No scores yet"
          message="Take the quiz to see how you do."
          actionTitle="Take quiz"
          onAction={() => router.push(`/${deck?.id}/take-quiz`)}
        />
      </Screen>
    );
  }

  const passMark = deck?.passMark ?? 50;
  const percents = scores.map(
    (s) => (s.actualScore / s.numberOfQuestions) * 100,
  );
  const best = Math.max(...percents);
  const average = percents.reduce((sum, p) => sum + p, 0) / percents.length;
  const passed = percents.filter((p) => p >= passMark).length;
  const latestPassed = percents.at(-1)! >= passMark;

  return (
    <Screen scroll>
      <PageTitle title="Scoreboard" subtitle={`Pass mark ${passMark}%`} />

      <Card className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-neutral-900 dark:text-white">
            Summary
          </Text>
          <Pill
            text={latestPassed ? "Last attempt passed" : "Last attempt failed"}
            tone={latestPassed ? "success" : "danger"}
            className="self-center"
          />
        </View>
        <View className="flex-row">
          <Stat value={String(scores.length)} label="Attempts" />
          <Stat value={`${best.toFixed(0)}%`} label="Best" />
          <Stat value={`${average.toFixed(0)}%`} label="Average" />
          <Stat value={`${passed}/${scores.length}`} label="Passed" />
        </View>
      </Card>
      {/* Most recent first; attempts keep their original numbers. */}
      {[...scores].reverse().map((s, idx) => (
        <ScoreCard
          index={scores.length - idx}
          key={s.date}
          score={s}
          passMark={passMark}
        />
      ))}
    </Screen>
  );
};
