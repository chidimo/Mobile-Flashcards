import { useFlash } from "@/context/app-context";
import { router, useGlobalSearchParams } from "expo-router";
import { View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { pageContainerStyle } from "@/styles";
import { NotAvailableMessage } from "./not-available-message";
import { ScoreCard } from "./score-card";
import { VirtualizedList } from "../virtualized-list";
import { CustomText } from "../custom-text";

export const DeckScores = () => {
  const { getDeckById, getScoresById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const scores = getScoresById(deckId as string);

  return (
    <View
      style={[
        pageContainerStyle.mainPageView,
        { justifyContent: "flex-start" },
      ]}
    >
      <View style={{ marginBottom: 30 }}>
        <CustomText text="My scores" isHeader />
        <CustomText
          text={`Pass mark: ${deck?.passMark?.toString() ?? ""}`}
          moreTextStyle={{ fontSize: 16, fontWeight: "normal" }}
        />
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
        <View style={[pageContainerStyle.minorPageView]}>
          <NotAvailableMessage message="You have not taken this quiz yet." />
          <DefaultButton
            moreContainerStyle={{ width: "100%" }}
            btnVariant="SUCCESS"
            title="Take quiz"
            onPress={() => {
              router.push(`/${deck?.id}/take-quiz`);
            }}
          />
        </View>
      )}
    </View>
  );
};
