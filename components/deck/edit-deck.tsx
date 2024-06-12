import { useGlobalSearchParams } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { useMemo } from "react";
import { useFlash } from "@/context/app-context";
import { TCreateDeck } from "@/types/generic";
import { DeckFormFields } from "./deck-form-fields";
import { DefaultButton } from "../form-elements/button";
import { showNotification } from "../notifier";

export const EditDeck = () => {
  const { getDeckById, updateDeck } = useFlash();
  const { deckId } = useGlobalSearchParams();

  const deck = getDeckById(deckId as string);

  const defaultValues = useMemo(
    () => ({
      title: deck?.title ?? "",
      passMark: deck?.passMark ?? 50,
    }),
    [deck]
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
    });
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DeckFormFields errors={errors} control={control} />
      <DefaultButton
        moreContainerStyle={{ width: "50%" }}
        btnVariant="SUCCESS"
        title="Save changes"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};
