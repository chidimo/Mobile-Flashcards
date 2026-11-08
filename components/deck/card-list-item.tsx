import { useFlash } from "@/context/app-context";
import { router } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Question } from "@/types/generic";
import { useAppTheme } from "@/hooks/use-app-theme";

interface Props {
  index: number;
  deckId: string;
  question: Question;
  isLast?: boolean;
}

export const CardListItem = (props: Props) => {
  const { index, deckId, question, isLast } = props;
  const { deleteCard } = useFlash();
  const { primary, danger } = useAppTheme();

  return (
    <View
      style={{
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: primary,
        marginBottom: isLast ? 0 : 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text
          style={[
            styles.text,
            { color: primary, fontWeight: "bold", marginRight: 5 },
          ]}
        >
          Question {index + 1}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <AntDesign
            name="delete"
            size={22}
            color={danger}
            onPress={() => {
              deleteCard(deckId, question.id);
            }}
          />
        </View>
      </View>
      <View>
        <Text
          style={[
            styles.text,
            { color: primary, marginBottom: 5, fontWeight: "bold" },
          ]}
        >
          {question.question}
        </Text>
        <Text style={[styles.text, { color: primary }]}>{question.answer}</Text>
        {question.hint && (
          <Text style={[styles.text, { color: primary }]}>
            Hint: {question.hint}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
  },
});
