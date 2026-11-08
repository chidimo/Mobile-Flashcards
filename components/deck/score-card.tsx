import { formatDate } from "@/utils/format-datetime";
import { Text, View } from "react-native";
import { ScoreSaver } from "@/types/generic";
import { useAppTheme } from "@/hooks/use-app-theme";

interface Props {
  index: number;
  score: ScoreSaver;
  passMark: number;
}

export const ScoreCard = (props: Props) => {
  const { index, score, passMark } = props;
  const percent = (score.actualScore / score.numberOfQuestions) * 100;
  const isPass = percent >= passMark;
  const { primary, success, danger } = useAppTheme();

  return (
    <View
      style={{
        marginBottom: 10,
        borderWidth: 1,
        borderColor: primary,
        borderRadius: 5,
        padding: 10,
      }}
    >
      <Text style={{ fontSize: 18, color: primary }}>
        Attempt {index}
      </Text>
      <Text style={{ fontSize: 16, color: primary }}>
        Date: {formatDate(score.date, true)}
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
      >
        <Text style={{ fontSize: 16, color: primary }}>
          Score: {score.actualScore}/{score.numberOfQuestions} |
          <Text style={{ color: isPass ? success : danger }}>
            {percent.toFixed(2)}%
          </Text>
        </Text>
      </View>
    </View>
  );
};
