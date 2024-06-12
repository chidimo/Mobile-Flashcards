import { useFlash } from "@/context/app-context";
import { sharedStyles } from "@/styles";
import { ImportSchema, Question, TCreateDeck } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { useState } from "react";
import { useClipboard } from "@/hooks/use-clipboard";
import { DeckFormFields } from "./deck-form-fields";

interface Props {
  onSuccess: () => void;
}
export const ImportDeck = (props: Props) => {
  const { importDeck } = useFlash();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { fetchCopiedText } = useClipboard();

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateDeck>({
    defaultValues: {
      title: "",
      passMark: 50,
    },
  });

  const saveDeck = async (data: TCreateDeck) => {
    setError(null);
    importDeck(data.title, data.passMark, questions);
  };

  const onSubmit: SubmitHandler<TCreateDeck> = async (data) => {
    saveDeck(data).then(() => {
      reset();
      props.onSuccess();
    });
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ marginBottom: 30 }}>
        <Text style={sharedStyles.headingText}>Import deck</Text>
        {error && (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        )}
        {questions.length ? (
          <Text style={{ color: "purple" }}>
            There are {questions.length} cards on this deck
          </Text>
        ) : null}
      </View>

      <DeckFormFields
        isNew
        control={control}
        errors={errors}
        moreContainerStyle={{ marginBottom: 10 }}
      />

      <DefaultButton
        title={"Click to paste import string"}
        moreTextStyle={{ color: "purple" }}
        moreContainerStyle={{ backgroundColor: "white", marginBottom: 20 }}
        onPress={() => {
          fetchCopiedText((val) => {
            try {
              const data = JSON.parse(val);
              ImportSchema.parseAsync(data)
                .then((res) => {
                  setValue("title", res.title);
                  setValue("passMark", Number(res.passMark));
                  setQuestions(res.questions);
                  setError(null);
                })
                .catch(() => {
                  setError(
                    "Something went wrong. Please copy the text again and retry."
                  );
                });
            } catch (e) {
              setError("Nothing to paste");
            }
          });
        }}
      />

      <DefaultButton
        moreContainerStyle={{ width: "70%" }}
        btnVariant="SUCCESS"
        title="Save deck"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};
