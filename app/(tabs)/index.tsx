import { DefaultButton } from "@/components/form-elements/button";
import { VirtualizedList } from "@/components/virtualized-list";
import { useFlash } from "@/context/app-context";
import { Deck } from "@/types/generic";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  deck: Deck;
}

const DeckView = (props: Props) => {
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

export default function Index() {
  const { deckOfCards } = useFlash();

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      {deckOfCards?.length === 0 ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 50 }}>
            <Text style={{ fontSize: 26, color: "green" }}>Welcome to</Text>
            <Text style={{ fontSize: 38, color: "green" }}>
              Mobile Flashcards
            </Text>
          </View>

          <Text style={{ marginBottom: 20, fontSize: 16 }}>
            Please add a deck of cards to continue
          </Text>
          <DefaultButton
            title="Add your first deck"
            moreContainerStyle={{ width: "50%" }}
            btnVariant="SUCCESS"
            onPress={() => {
              router.push("/add-deck");
            }}
          />
        </View>
      ) : (
        <VirtualizedList>
          {deckOfCards?.map((d) => {
            return <DeckView key={d.id} deck={d} />;
          })}
        </VirtualizedList>
      )}
    </View>
  );
}
