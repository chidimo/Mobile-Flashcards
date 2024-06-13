import { formatDate } from "@/utils/format-datetime";
import { Text, View } from "react-native";
import { ScoreSaver } from "@/types/generic";

interface Props {
  index: number;
  score: ScoreSaver;
  passMark: number;
}

export const ScoreCard = (props: Props) => {
  const { index, score, passMark } = props;
  const percent = (score.actualScore / score.numberOfQuestions) * 100;
  const isPass = percent >= passMark;

  return (
    <View
      style={{
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "purple",
        borderRadius: 5,
        padding: 10,
      }}
    >
      <Text style={{ fontSize: 20, color: "purple" }}>
        {index}. {formatDate(score.date, true)}
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
      >
        <Text style={{ fontSize: 20, color: "purple" }}>
          Score: {score.actualScore}/{score.numberOfQuestions} |
          <Text style={{ color: isPass ? "green" : "red" }}>
            {percent.toFixed(2)}%
          </Text>
        </Text>
      </View>
    </View>
  );
};
