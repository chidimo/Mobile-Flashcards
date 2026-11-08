import { formatDate } from "@/utils/format-datetime";
import { Text, View } from "react-native";
import { ScoreSaver } from "@/types/generic";
import { Card } from "../ui/card";
import { Pill } from "../ui/pill";
import { ProgressBar } from "../ui/progress-bar";

interface Props {
  index: number;
  score: ScoreSaver;
  passMark: number;
}

export const ScoreCard = ({ index, score, passMark }: Props) => {
  const percent = (score.actualScore / score.numberOfQuestions) * 100;
  const isPass = percent >= passMark;
  const tone = isPass ? "success" : "danger";

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-neutral-900 dark:text-white">
          Attempt {index}
        </Text>
        <Pill text={isPass ? "Passed" : "Failed"} tone={tone} />
      </View>
      <View className="flex-row items-end justify-between">
        <Text className="text-3xl font-extrabold text-neutral-900 dark:text-white">
          {percent.toFixed(0)}%
        </Text>
        <Text className="pb-1 text-sm text-neutral-500 dark:text-neutral-400">
          {score.actualScore}/{score.numberOfQuestions} correct
        </Text>
      </View>
      <ProgressBar percent={percent} tone={tone} />
      <Text className="text-xs text-neutral-500 dark:text-neutral-400">
        {formatDate(score.date, true)}
      </Text>
    </Card>
  );
};
