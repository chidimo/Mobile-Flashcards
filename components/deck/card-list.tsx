import { VirtualizedList } from "@/components/virtualized-list";
import { useFlash } from "@/context/app-context";
import { router, useGlobalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { NoCardComponent } from "@/components/deck/no-card-component";
import { pageContainerStyle, sharedStyles } from "@/styles";
import { CardListItem } from "@/components/deck/card-list-item";
import { formatDate } from "@/utils/format-datetime";

export const CardList = () => {
  const { deckId } = useGlobalSearchParams();
  const { getDeckById } = useFlash();

  const deck = getDeckById(deckId as string);
  const questionList = deck?.questions ?? [];

  return (
    <View style={[pageContainerStyle.view]}>
      <View style={{ marginBottom: 10 }}>
        <View>
          <Text style={[sharedStyles.headerText]}>{deck?.title}</Text>
          <Text
            style={[
              sharedStyles.headerText,
              { fontSize: 16, fontWeight: "normal" },
            ]}
          >
            Pass mark: {deck?.passMark}
          </Text>
          <Text
            style={[
              sharedStyles.headerText,
              { fontSize: 16, fontWeight: "normal" },
            ]}
          >
            Added on: {formatDate(deck?.addedOn, true)}
          </Text>
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

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
  },
});
