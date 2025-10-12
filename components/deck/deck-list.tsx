import { DeckListItem } from "@/components/deck/deck-list-item";
import { NotAvailableMessage } from "@/components/deck/not-available-message";
import { DefaultButton } from "@/components/form-elements/button";
import { VirtualizedList } from "@/components/virtualized-list";
import { useFlash } from "@/context/app-context";
import { pageContainerStyle } from "@/styles";
import { router } from "expo-router";
import { View } from "react-native";
import { CustomText } from "../custom-text";

export const DeckList = () => {
  const { deckOfCards } = useFlash();

  return (
    <View style={[pageContainerStyle.mainPageView]}>
      {deckOfCards?.length === 0 ? (
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 50 }}>
            <CustomText
              text="Welcome to"
              moreTextStyle={{
                textAlign: "center",
                fontSize: 26,
                color: "green",
                fontWeight: "bold",
              }}
            />
            <CustomText
              text="Mobile Flashcards"
              moreTextStyle={{
                textAlign: "center",
                fontSize: 34,
                color: "green",
                fontWeight: "900",
              }}
            />
          </View>

          <NotAvailableMessage message="Please add a deck of cards to continue" />
          <DefaultButton
            title="Add your first deck"
            moreContainerStyle={{ width: "100%" }}
            btnVariant="SUCCESS"
            onPress={() => {
              router.push("/add-deck");
            }}
          />
        </View>
      ) : (
        <VirtualizedList>
          {deckOfCards?.map((d, idx) => {
            return <DeckListItem key={d.id} index={idx} deck={d} />;
          })}
        </VirtualizedList>
      )}
    </View>
  );
};
