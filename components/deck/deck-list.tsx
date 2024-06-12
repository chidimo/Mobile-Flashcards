import { DeckListItem } from "@/components/deck/deck-list-item";
import { NotAvailableMessage } from "@/components/deck/not-available-message";
import { DefaultButton } from "@/components/form-elements/button";
import { VirtualizedList } from "@/components/virtualized-list";
import { useFlash } from "@/context/app-context";
import { pageContainerStyle } from "@/styles";
import { router } from "expo-router";
import { Text, View } from "react-native";

export const DeckList = () => {
  const { deckOfCards } = useFlash();

  return (
    <View style={[pageContainerStyle.view]}>
      {deckOfCards?.length === 0 ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 50 }}>
            <Text style={{ fontSize: 26, color: "green", fontWeight: "bold" }}>
              Welcome to
            </Text>
            <Text style={{ fontSize: 38, color: "green", fontWeight: "900" }}>
              Mobile Flashcards
            </Text>
          </View>

          <NotAvailableMessage message="Please add a deck of cards to continue" />
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
};
