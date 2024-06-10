import { router, useGlobalSearchParams } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { View, Text } from "react-native";
import { useMemo } from "react";
import { useFlash } from "@/context/app-context";
import { TCreateDeck } from "@/types/generic";
import { sharedStyles } from "@/styles";
import { DeckFormFields } from "./deck-form-fields";
import { DefaultButton } from "../form-elements/button";

export const EditDeck = () => {
  const { getDeckById, updateDeck } = useFlash();
  const { deckId } = useGlobalSearchParams();

  const deck = getDeckById(deckId as string);

  const defaultValues = useMemo(
    () => ({
      name: deck?.title ?? "",
      passMark : deck?.passMark ?? 50,
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
    updateDeck(deckId as string, data.name);
  };

  const onSubmit: SubmitHandler<TCreateDeck> = async (data) => {
    saveCard(data).then(() => {
      router.push(`/${deckId}`);
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
      <Text style={[sharedStyles.headingText, { marginBottom: 50 }]}>
        Edit Deck
      </Text>
      <DeckFormFields errors={errors} control={control} />
      <DefaultButton
        moreContainerStyle={{ width: "50%" }}
        btnVariant="SUCCESS"
        title="Save Changes"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};
