import { useFlash } from "@/context/app-context";
import { ImportSchema, Question, TCreateDeck } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { Button } from "../ui/button";
import { useState } from "react";
import { useClipboard } from "@/hooks/use-clipboard";
import { DeckFormFields } from "./deck-form-fields";
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
    <View className="gap-4 px-1">
      <View className="gap-1">
        <Text className="text-base text-neutral-700 dark:text-neutral-200">
          {questions.length
            ? `This deck has ${questions.length} cards`
            : "Copy a deck's import string, then paste it here."}
        </Text>
        {error ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            {error}
          </Text>
        ) : null}
      </View>

      <Button
        title="Paste import string"
        variant="secondary"
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
                    })),
                  );
                  setError(null);
                })
                .catch((err) => {
                  setError(
                    `Something went wrong. Please copy the text again and retry\n${String(
                      err,
                    )}`,
                  );
                });
            } catch (e) {
              setError(`Nothing to paste\n${String(e)}`);
            }
          });
        }}
      />

      <DeckFormFields isNew control={control} errors={errors} />

      <View className="flex-row gap-3">
        <Button
          title="Cancel"
          variant="outline"
          className="flex-1"
          onPress={() => {
            reset();
            props.onCancel();
          }}
        />
        <Button
          title="Save deck"
          className="flex-1"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
};
