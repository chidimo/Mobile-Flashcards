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
import * as Crypto from "expo-crypto";
import { isValidV4UUID } from "@/utils/validate-uuid";

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}
export const ImportDeck = (props: Props) => {
  const { importDeck } = useFlash();
  const { fetchCopiedText } = useClipboard();
  const [error, setError] = useState<string | null>(null);
  const [qId, setQId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

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
    importDeck(qId, data.title, data.passMark, questions);
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
                  setQId(res.id);
                  setValue("title", res.title);
                  setValue("passMark", Number(res.passMark));
                  setQuestions(
                    res.questions.map((q) => ({
                      ...q,
                      id: isValidV4UUID(q.id) ? q.id : Crypto.randomUUID(),
                    }))
                  );
                  setError(null);
                })
                .catch((err) => {
                  setError(
                    `Something went wrong. Please copy the text again and retry\n${String(
                      err
                    )}`
                  );
                });
            } catch (e) {
              setError(`Nothing to paste\n${String(e)}`);
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
