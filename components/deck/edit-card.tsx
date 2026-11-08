import { router, useGlobalSearchParams } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { useMemo } from "react";
import { useFlash } from "@/context/app-context";
import { CardFormFields } from "./card-form-fields";
import { TCreateCard } from "@/types/generic";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";

export const EditCard = () => {
  const { getDeckById, getQuestionById, updateCard } = useFlash();
  const { deckId, cardId } = useGlobalSearchParams();

  const deck = getDeckById(deckId as string);
  const question = getQuestionById(deckId as string, cardId as string);

  const defaultValues = useMemo(
    () => ({
      answer: question?.answer ?? "",
      question: question?.question ?? "",
      hint: question?.hint ?? "",
    }),
    [question],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateCard>({
    defaultValues,
    values: { ...defaultValues },
  });

  const saveCard = async (data: TCreateCard) => {
    updateCard(
      deckId as string,
      cardId as string,
      data.question,
      data.answer,
      data.hint,
    );
  };

  const onSubmit: SubmitHandler<TCreateCard> = async (data) => {
    saveCard(data)
      .then(() => {
        router.push(`/${deckId}`);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (!question) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle"
          title="Card not found"
          message="This card no longer exists."
          actionTitle="Back to cards"
          onAction={() => router.push(`/${deckId}`)}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <PageTitle title="Edit card" subtitle={deck?.title} />

      <Card>
        <CardFormFields errors={errors} control={control} />
      </Card>

      <View className="flex-row gap-3">
        <Button
          title="Cancel"
          variant="outline"
          className="flex-1"
          onPress={() => {
            router.push(`/${deckId}`);
          }}
        />
        <Button
          title="Save changes"
          className="flex-1"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </Screen>
  );
};
