import { useFlash } from "@/context/app-context";
import { router, useGlobalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { pageContainerStyle, sharedStyles } from "@/styles";
import { NotAvailableMessage } from "./not-available-message";
import { ScoreCard } from "./score-card";
import { VirtualizedList } from "../virtualized-list";

export const DeckScores = () => {
  const { getDeckById, getScoresById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const scores = getScoresById(deckId as string);

  return (
    <View style={[pageContainerStyle.view, { justifyContent: "flex-start" }]}>
      <View style={{ marginBottom: 30 }}>
        <Text style={[sharedStyles.headerText]}>My scores</Text>
        <Text
          style={[
            sharedStyles.headerText,
            { fontSize: 16, fontWeight: "normal" },
          ]}
        >
          Pass mark: {deck?.passMark}
        </Text>
      </View>

      {scores?.length ? (
        <VirtualizedList>
          {scores?.map((s, idx) => {
            return (
              <ScoreCard
                index={idx + 1}
                key={s.date}
                score={s}
                passMark={deck?.passMark ?? 50}
              />
            );
          })}
        </VirtualizedList>
      ) : (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <NotAvailableMessage message="You have not taken this quiz yet." />
          <DefaultButton
            moreContainerStyle={{ width: "50%" }}
            btnVariant="SUCCESS"
            title="Take quiz"
            onPress={() => {
              router.push(`/${deck?.id}/add-card`);
            }}
          />
        </View>
      )}
    </View>
  );
};
