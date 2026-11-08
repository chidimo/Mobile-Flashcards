import { View } from "react-native";
import { router, useGlobalSearchParams } from "expo-router";
import { useFlash } from "@/context/app-context";
import { TCreateCard } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { CardFormFields } from "./card-form-fields";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";

export const CreateCard = () => {
  const { getDeckById, addCardToDeck } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateCard>({
    defaultValues: {
      question: "",
      answer: "",
      hint: "",
    },
  });

  const saveCard = async (data: TCreateCard) => {
    addCardToDeck(deck?.id!, data.question, data.answer, data.hint);
    reset();
  };

  const submitAndViewDeck: SubmitHandler<TCreateCard> = async (data) => {
    saveCard(data).then(() => {
      router.push(`/${deck?.id}`);
    });
  };

  const submitAndAddAnother: SubmitHandler<TCreateCard> = async (data) => {
    saveCard(data).then(() => {});
  };

  return (
    <Screen scroll>
      <PageTitle
        title="Add a card"
        subtitle={deck ? `New card for ${deck.title}` : undefined}
      />

      <Card>
        <CardFormFields control={control} errors={errors} />
      </Card>

      <View className="gap-3">
        <Button
          title="Save and exit"
          onPress={handleSubmit(submitAndViewDeck)}
        />
        <Button
          title="Save and add another"
          variant="secondary"
          onPress={handleSubmit(submitAndAddAnother)}
        />
      </View>
    </Screen>
  );
};
