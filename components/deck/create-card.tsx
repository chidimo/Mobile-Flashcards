import { Text, View } from "react-native";
import { pageContainerStyle, sharedStyles } from "@/styles";
import { router, useGlobalSearchParams } from "expo-router";
import { useFlash } from "@/context/app-context";
import { TCreateCard } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { CardFormFields } from "./card-form-fields";
import { DefaultButton } from "../form-elements/button";

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
      <View style={{}}>
        <Text style={[sharedStyles.headerText, { marginBottom: 50 }]}>
          Add cards to {deck?.title}
        </Text>
      </View>

      <View style={[pageContainerStyle.minorPageView]}>
        <CardFormFields control={control} errors={errors} />

        <DefaultButton
          moreContainerStyle={{ width: "60%", marginBottom: 25 }}
          btnVariant="SUCCESS"
          title="Save and view deck"
          onPress={handleSubmit(submitAndViewDeck)}
        />
        <DefaultButton
          moreContainerStyle={{ width: "70%" }}
          btnVariant="SUCCESS"
          title="Save and add another"
          onPress={handleSubmit(submitAndAddAnother)}
        />
      </View>
    </View>
  );
};
