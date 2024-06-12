import { formatDate } from "@/utils/format-datetime";
import { Text, View } from "react-native";
import { ScoreSaver } from "@/types/generic";

interface Props {
  score: ScoreSaver;
  passMark: number;
}

export const ScoreCard = (props: Props) => {
  const { score, passMark } = props;
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
      <Text style={{ fontSize: 20, color:'purple' }}>{formatDate(score.date, true)}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 20 }}>
          Score: {score.actualScore}/{score.numberOfQuestions} |
          <Text style={{ color: isPass ? "green" : "red" }}>
            {percent.toFixed(2)}%
          </Text>
          |
          <Text style={{ fontSize: 20, color: isPass ? "green" : "red" }}>
            {isPass ? "Pass" : "Fail"}
          </Text>
        </Text>
      </View>
    </View>
  );
};
