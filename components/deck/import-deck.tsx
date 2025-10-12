import { useFlash } from "@/context/app-context";
import { buttonStyles, primaryTextColor } from "@/styles";
import { ImportSchema, Question, TCreateDeck } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { useState } from "react";
import { useClipboard } from "@/hooks/use-clipboard";
import { DeckFormFields } from "./deck-form-fields";
import { CustomText } from "../custom-text";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
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
        <CustomText
          text={
            questions.length
              ? `This deck has ${questions.length} cards`
              : "Click the button to paste import string"
          }
          moreTextStyle={{ color: primaryTextColor, fontSize: 18 }}
        />
        {error && (
          <CustomText
            text={error}
            moreTextStyle={{ color: "red", fontSize: 16 }}
          />
        )}
      </View>

      <DeckFormFields
        isNew
        control={control}
        errors={errors}
        moreContainerStyle={{ marginBottom: 10 }}
      />

      <DefaultButton
        title={"Click to paste"}
        btnVariant="SECONDARY"
        moreContainerStyle={{
          marginBottom: 20,
        }}
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

      <View style={buttonStyles.twoColumnBtns}>
        <DefaultButton
          moreContainerStyle={{ width: "47%" }}
          btnVariant="SUCCESS"
          title="Save deck"
          onPress={handleSubmit(onSubmit)}
        />
        <DefaultButton
          moreContainerStyle={{ width: "47%" }}
          btnVariant="CANCEL"
          title="Cancel"
          onPress={() => {
            reset();
            props.onCancel();
          }}
        />
      </View>
    </View>
  );
};
