import { VirtualizedList } from "@/components/virtualized-list";
import { useFlash } from "@/context/app-context";
import { router, useGlobalSearchParams } from "expo-router";
import { View } from "react-native";
import { NoCardComponent } from "@/components/deck/no-card-component";
import { pageContainerStyle } from "@/styles";
import { CardListItem } from "@/components/deck/card-list-item";
import { formatDate } from "@/utils/format-datetime";
import { CustomText } from "../custom-text";

export const CardList = () => {
  const { deckId } = useGlobalSearchParams();
  const { getDeckById } = useFlash();

  const deck = getDeckById(deckId as string);
  const questionList = deck?.questions ?? [];

  return (
    <View style={[pageContainerStyle.mainPageView]}>
      <View style={{ marginBottom: 10 }}>
        <View style={{ width: "100%" }}>
          <CustomText isHeader text={deck?.title ?? ""} />
          <CustomText text={`Pass mark: ${deck?.passMark ?? ""}`} />
          <CustomText text={`Created on: ${formatDate(deck?.addedOn, true)}`} />
        </View>
      </View>

      {questionList.length === 0 ? (
        <NoCardComponent
          onPress={() => {
            router.push(`/${deck?.id!}/add-card`);
          }}
        />
      ) : (
        <VirtualizedList>
          {questionList.map((qs, idx) => {
            return (
              <CardListItem
                key={qs.id}
                index={idx}
                question={qs}
                deckId={deckId as string}
                isLast={idx === (deck?.questions.length ?? 0) + 1}
              />
            );
          })}
        </VirtualizedList>
      )}
    </View>
  );
};
