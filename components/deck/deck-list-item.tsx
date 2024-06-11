import { Deck } from "@/types/generic";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  deck: Deck;
}

export const DeckListItem = (props: Props) => {
  const { deck } = props;

  return (
    <TouchableOpacity
      style={{
        padding: 8,
        width: "100%",
        borderBottomWidth: StyleSheet.hairlineWidth,
      }}
      onPress={() => {
        router.push(`/${deck.id}`);
      }}
    >
      <View style={{}}>
        <Text
          style={{
            fontSize: 20,
            textAlign: "center",
            color: "purple",
            fontWeight: "800",
          }}
        >
          {deck.title.toUpperCase()}
        </Text>
        <Text
          style={{
            color: "purple",
            textAlign: "center",
          }}
        >
          Cards: {deck.questions.length}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
