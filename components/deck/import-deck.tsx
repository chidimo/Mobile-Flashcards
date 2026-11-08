import { useFlash } from "@/context/app-context";
import { ImportSchema, Question, TCreateDeck } from "@/types/generic";
import { Feather } from "@expo/vector-icons";
import { SubmitHandler, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { useState } from "react";
import { useClipboard } from "@/hooks/use-clipboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { DeckFormFields } from "./deck-form-fields";
import * as Crypto from "expo-crypto";
import { isValidV4UUID } from "@/utils/validate-uuid";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

const PREVIEW_COUNT = 3;

export const ImportDeck = (props: Props) => {
  const { importDeck } = useFlash();
  const { fetchCopiedText } = useClipboard();
  const { primary } = useAppTheme();
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

  const pasteImportString = () => {
    void fetchCopiedText((text) => {
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        setError(
          "The clipboard doesn't hold a deck. Copy the import string and try again.",
        );
        return;
      }
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
        .catch(() => {
          setError(
            "That text isn't a valid deck. Copy the import string again and retry.",
          );
        });
    });
  };

  const onSubmit: SubmitHandler<TCreateDeck> = (data) => {
    importDeck(qId, data.title, data.passMark, questions);
    reset();
    props.onSuccess();
  };

  return (
    <Screen scroll>
      <PageTitle
        title="Import a deck"
        subtitle="Paste a deck that someone shared with you."
      />

      <Card className="gap-4">
        <View className="flex-row items-start gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-ink-700">
            <Feather name="clipboard" size={20} color={primary} />
          </View>
          <Text className="flex-1 text-sm text-neutral-600 dark:text-neutral-300">
            In the other app open the deck, choose Manage → Share deck and copy
            the text. Then paste it here.
          </Text>
        </View>
        {error ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            {error}
          </Text>
        ) : null}
        <Button
          title={
            questions.length ? "Paste a different deck" : "Paste import string"
          }
          variant="secondary"
          onPress={pasteImportString}
        />
      </Card>

      {questions.length ? (
        <>
          <Card className="gap-3">
            <Text className="text-base font-bold text-neutral-900 dark:text-white">
              {`${questions.length} ${questions.length === 1 ? "card" : "cards"} ready to import`}
            </Text>
            {questions.slice(0, PREVIEW_COUNT).map((question) => (
              <Text
                key={question.id}
                numberOfLines={1}
                className="text-sm text-neutral-600 dark:text-neutral-300"
              >
                • {question.question}
              </Text>
            ))}
            {questions.length > PREVIEW_COUNT ? (
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                and {questions.length - PREVIEW_COUNT} more
              </Text>
            ) : null}
          </Card>

          <Card>
            <DeckFormFields isNew control={control} errors={errors} />
          </Card>
        </>
      ) : null}

      <View className="gap-3">
        <Button
          title="Import deck"
          disabled={!questions.length}
          onPress={handleSubmit(onSubmit)}
        />
        <Button
          title="Cancel"
          variant="ghost"
          onPress={() => {
            reset();
            props.onCancel();
          }}
        />
      </View>
    </Screen>
  );
};
