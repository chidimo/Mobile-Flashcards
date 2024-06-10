import { useFlash } from "@/context/app-context";
import { router } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Question } from "@/types/generic";

interface Props {
  index: number;
  deckId: string;
  question: Question;
}

export const QuestionListItem = (props: Props) => {
  const { index, deckId, question } = props;
  const { deleteCard } = useFlash();

  return (
    <View
      style={{
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "midnight#07f",
        borderRadius: 5,
        padding: 10,
      }}
    >
      <View
        style={{
          display: "flex",
          marginBottom: 15,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={[styles.text, { fontWeight: "bold", marginRight: 5 }]}>
            {index + 1}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <AntDesign
              name="edit"
              size={22}
              style={{ marginRight: 20 }}
              color={"#07f"}
              onPress={() => {
                router.push(`/${deckId}/${question.id}`);
              }}
            />
            <AntDesign
              name="delete"
              size={22}
              color={"red"}
              onPress={() => {
                deleteCard(deckId as string, question.id);
              }}
            />
          </View>
        </View>
        <View>
          <Text style={[styles.text, { marginBottom: 5, fontWeight: "bold" }]}>
            {question.question}
          </Text>
          <Text style={styles.text}>{question.answer}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    color: "purple",
  },
});
