import { router, useGlobalSearchParams } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { useMemo } from "react";
import { useFlash } from "@/context/app-context";
import { CardFormFields } from "./card-form-fields";
import { TCreateCard } from "@/types/generic";
import { pageContainerStyle } from "@/styles";
import { DefaultButton } from "../form-elements/button";
import { CustomText } from "../custom-text";

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
    [deck]
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
      data.hint
    );
  };

  const onSubmit: SubmitHandler<TCreateCard> = async (data) => {
    saveCard(data).then(() => {
      router.push(`/${deckId}`);
    });
  };

  return (
    <View style={[pageContainerStyle.mainPageView]}>
      <CustomText
        isHeader
        text="Edit card"
        moreContainerStyle={{ marginBottom: 50 }}
      />
      <CardFormFields errors={errors} control={control} />
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <DefaultButton
          moreContainerStyle={{ width: "45%" }}
          btnVariant="SECONDARY"
          title="Cancel"
          onPress={() => {
            router.push(`/${deckId}`);
          }}
        />
        <DefaultButton
          moreContainerStyle={{ width: "45%" }}
          btnVariant="SUCCESS"
          title="Save changes"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
};
