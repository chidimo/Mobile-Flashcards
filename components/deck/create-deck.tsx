import { useFlash } from "@/context/app-context";
import { sharedStyles } from "@/styles";
import { TCreateDeck } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DeckFormFields } from "./deck-form-fields";
import { DefaultButton } from "../form-elements/button";

export const CreateDeck = () => {
  const insets = useSafeAreaInsets();
  const { addDeck } = useFlash();

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateDeck>({
    defaultValues: {
      name: "",
      passMark: 50,
    },
   });

  const saveDeck = async (data: TCreateDeck) => {
    addDeck(data.name, data.passMark);
  };

  const onSubmit: SubmitHandler<TCreateDeck> = async (data) => {
    saveDeck(data).then(() => {
      reset();
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
      <View style={{ marginBottom: 50 }}>
        <Text style={sharedStyles.headingText}>Create deck</Text>
      </View>

      <DeckFormFields control={control} errors={errors} />

      <DefaultButton
        moreContainerStyle={{ width: "70%" }}
        btnVariant="SUCCESS"
        title="Save deck"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};
