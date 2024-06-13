import { useFlash } from "@/context/app-context";
import { router } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Question } from "@/types/generic";
import { primaryTextColor } from "@/styles";

interface Props {
  index: number;
  deckId: string;
  question: Question;
  isLast?: boolean;
}

export const CardListItem = (props: Props) => {
  const { index, deckId, question, isLast } = props;
  const { deleteCard } = useFlash();

  return (
    <View
      style={{
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "purple",
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
              deleteCard(deckId, question.id);
            }}
          />
        </View>
      </View>
      <View>
        <Text style={[styles.text, { marginBottom: 5, fontWeight: "bold" }]}>
          {question.question}
        </Text>
        <Text style={styles.text}>{question.answer}</Text>
        {question.hint && (
          <Text style={styles.text}>Hint: {question.hint}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    color: primaryTextColor,
  },
});
