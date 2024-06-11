import { VirtualizedList } from "@/components/virtualized-list";
import { useFlash } from "@/context/app-context";
import { useGlobalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { NoCardComponent } from "@/components/deck/no-card-component";
import { sharedStyles } from "@/styles";
import { QuestionListItem } from "@/components/deck/question-list-item";

export default function Index() {
  const { deckId } = useGlobalSearchParams();
  const { getDeckById,   } = useFlash();

  const deck = getDeckById(deckId as string);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 5,
      }}
    >
      <View style={{ marginBottom: 10 }}>
        <View style={{}}>
          <Text style={[sharedStyles.headingText]}>{deck?.title}</Text>
          <Text
            style={[
              sharedStyles.headingText,
              { fontSize: 16, fontWeight: "normal" },
            ]}
          >
            Pass mark: {deck?.passMark}
          </Text>
        </View>
      </View>

      {deck?.questions.length === 0 && <NoCardComponent deckId={deck.id} />}

      <VirtualizedList>
        {deck?.questions.map((qs, idx) => {
          return (
            <QuestionListItem
              key={qs.id}
              index={idx}
              question={qs}
              deckId={deckId as string}
            />
          );
        })}
      </VirtualizedList>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
  },
});
