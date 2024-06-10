import { VirtualizedList } from "@/components/virtualized-list";
import { useFlash } from "@/context/app-context";
import { router, useGlobalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { NoCardComponent } from "@/components/deck/no-card-component";
import { sharedStyles } from "@/styles";
import { QuestionListItem } from "@/components/deck/question-list-item";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { deckId } = useGlobalSearchParams();
  const { getDeckById, deleteDeck } = useFlash();

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

        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <AntDesign
            name="edit"
            size={20}
            style={{ marginLeft: 20, marginRight: 20 }}
            color={"#07f"}
            onPress={() => {
              router.push(`/${deckId}/edit`);
            }}
          />
          <AntDesign
            name="delete"
            size={20}
            color={"red"}
            onPress={() => {
              deleteDeck(deckId as string);
              router.push(`/(tabs)`);
            }}
          />
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
