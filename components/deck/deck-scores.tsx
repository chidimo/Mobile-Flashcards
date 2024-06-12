import { useFlash } from "@/context/app-context";
import { formatDate } from "@/utils/format-datetime";
import { router, useGlobalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { sharedStyles } from "@/styles";
import { NotAvailableMessage } from "./not-available-message";

export const DeckScores = () => {
  const { getDeckById, getScoresById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const scores = getScoresById(deckId as string);

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <View style={{ marginBottom: 30 }}>
        <Text style={[sharedStyles.headerText]}>My scores</Text>
        <Text
          style={[
            sharedStyles.headerText,
            { fontSize: 16, fontWeight: "normal" },
          ]}
        >
          Pass mark {deck?.passMark}
        </Text>
      </View>

      {!scores ? (
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
      ) : (
        <View>
          {scores?.map((s) => {
            const percent = (s.actualScore / s.numberOfQuestions) * 100;
            const isPass = percent >= (deck?.passMark ?? 50);
            return (
              <View
                key={s.date}
                style={{
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "midnight#07f",
                  borderRadius: 5,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 20 }}>{formatDate(s.date, true)}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 20 }}>
                    Score: {s.actualScore}/{s.numberOfQuestions} |
                    <Text style={{ color: isPass ? "green" : "red" }}>
                      {percent.toFixed(2)}%
                    </Text>
                    |
                    <Text
                      style={{ fontSize: 20, color: isPass ? "green" : "red" }}
                    >
                      {isPass ? "Pass" : "Fail"}
                    </Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};
