import { useGlobalSearchParams } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { useMemo } from "react";
import { useFlash } from "@/context/app-context";
import { TCreateDeck } from "@/types/generic";
import { DeckFormFields } from "./deck-form-fields";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { showNotification } from "../notifier";

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditDeck = ({ onCancel, onSuccess }: Props) => {
  const { getDeckById, updateDeck } = useFlash();
  const { deckId } = useGlobalSearchParams();

  const deck = getDeckById(deckId as string);

  const defaultValues = useMemo(
    () => ({
      title: deck?.title ?? "",
      passMark: deck?.passMark ?? 50,
    }),
    [deck],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateDeck>({
    defaultValues,
    values: { ...defaultValues },
  });

  const saveCard = async (data: TCreateDeck) => {
    updateDeck(deckId as string, data.title, data.passMark);
  };

  const onSubmit: SubmitHandler<TCreateDeck> = async (data) => {
    saveCard(data).then(() => {
      showNotification("Success", "Deck updated successfully");
      onSuccess();
    });
  };

  return (
    <View className="gap-4">
      <Card>
        <DeckFormFields errors={errors} control={control} />
      </Card>
      <View className="flex-row gap-3">
        <Button
          title="Cancel"
          variant="outline"
          className="flex-1"
          onPress={onCancel}
        />
        <Button
          title="Save changes"
          className="flex-1"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
};
