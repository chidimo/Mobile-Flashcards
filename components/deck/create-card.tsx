import { View } from "react-native";
import { buttonStyles, pageContainerStyle } from "@/styles";
import { router, useGlobalSearchParams } from "expo-router";
import { useFlash } from "@/context/app-context";
import { TCreateCard } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { CardFormFields } from "./card-form-fields";
import { DefaultButton } from "../form-elements/button";
import { CustomText } from "../custom-text";

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
    <View style={[pageContainerStyle.mainPageView]}>
      <CustomText isHeader text="Add a card" />
      <View style={[pageContainerStyle.minorPageView]}>
        <CardFormFields control={control} errors={errors} />

        <View style={buttonStyles.twoColumnBtns}>
          <DefaultButton
            moreContainerStyle={{ width: "47%" }}
            btnVariant="SUCCESS"
            title="Save and exit"
            onPress={handleSubmit(submitAndViewDeck)}
          />
          <DefaultButton
            moreContainerStyle={{ width: "47%" }}
            btnVariant="SECONDARY"
            title="Save and add another"
            onPress={handleSubmit(submitAndAddAnother)}
          />
        </View>
      </View>
    </View>
  );
};
