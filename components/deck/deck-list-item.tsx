import { Deck } from "@/types/generic";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { CustomText } from "../custom-text";

interface Props {
  deck: Deck;
  index: number;
}

export const DeckListItem = (props: Props) => {
  const { deck, index } = props;

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
        <CustomText isHeader text={`${index + 1}. ${deck.title}`} />
        <CustomText text={`Cards: ${deck.questions.length}`} />
      </View>
    </TouchableOpacity>
  );
};
