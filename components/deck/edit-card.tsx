import { router, useGlobalSearchParams } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { View, Text } from "react-native";
import { useMemo } from "react";
import { useFlash } from "@/context/app-context";
import { CardFormFields } from "./card-form-fields";
import { TCreateCard } from "@/types/generic";
import { sharedStyles } from "@/styles";
import { DefaultButton } from "../form-elements/button";

export const EditCard = () => {
  const { getDeckById, getQuestionById, updateCard } = useFlash();
  const { deckId, questionId } = useGlobalSearchParams();

  const deck = getDeckById(deckId as string);
  const question = getQuestionById(deckId as string, questionId as string);

  const defaultValues = useMemo(
    () => ({
      answer: question?.answer ?? "",
      question: question?.question ?? "",
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
      questionId as string,
      data.question,
      data.answer
    );
  };

  const onSubmit: SubmitHandler<TCreateCard> = async (data) => {
    saveCard(data).then(() => {
      router.push(`/${deckId}`);
    });
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={[sharedStyles.headingText, { marginBottom: 50 }]}>
        Edit card
      </Text>
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
