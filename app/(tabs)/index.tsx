import { DeckListItem } from "@/components/deck/deck-list-item";
import { DefaultButton } from "@/components/form-elements/button";
import { VirtualizedList } from "@/components/virtualized-list";
import { useFlash } from "@/context/app-context";
import { router } from "expo-router";
import { Text, View } from "react-native";

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
            moreContainerStyle={{ width: "70%" }}
            btnVariant="SUCCESS"
            onPress={() => {
              router.push("/add-deck");
            }}
          />
        </View>
      ) : (
        <VirtualizedList>
          {deckOfCards?.map((d) => {
            return <DeckListItem key={d.id} deck={d} />;
          })}
        </VirtualizedList>
      )}
    </View>
  );
}
