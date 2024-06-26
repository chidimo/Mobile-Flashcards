import { useFlash } from "@/context/app-context";
import {
  primaryTextColor,
  pageContainerStyle,
  sharedStyles,
  primaryBgColor,
} from "@/styles";
import { TCreateDeck } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { DeckFormFields } from "./deck-form-fields";
import { DefaultButton } from "../form-elements/button";
import { DefaultModal } from "../modal";
import { useOnOffSwitch } from "@/hooks/use-on-off-switch";
import { ImportDeck } from "./import-deck";
import { router } from "expo-router";
import { showNotification } from "../notifier";

export const CreateDeck = () => {
  const { addDeck } = useFlash();
  const { isOn, setOff, setOn } = useOnOffSwitch();

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateDeck>({
    defaultValues: {
      title: "",
      passMark: 50,
    },
  });

  const saveDeck = async (data: TCreateDeck) => {
    addDeck(data.title, data.passMark);
  };

  const onSubmit: SubmitHandler<TCreateDeck> = async (data) => {
    saveDeck(data).then(() => {
      reset();
    });
  };

  return (
    <View style={[pageContainerStyle.mainPageView]}>
      <View style={{ marginBottom: 50 }}>
        <Text style={sharedStyles.headerText}>Create deck</Text>
      </View>

      <DeckFormFields isNew={true} control={control} errors={errors} />

      <DefaultButton
        moreContainerStyle={{ width: "70%" }}
        btnVariant="SUCCESS"
        title="Save deck"
        onPress={handleSubmit(onSubmit)}
      />

      <DefaultButton
        title={"Import a deck"}
        onPress={setOn}
        moreTextStyle={{ color: primaryTextColor }}
        moreContainerStyle={{ backgroundColor: primaryBgColor, marginTop: 20 }}
      />

      <DefaultModal visible={isOn} onRequestClose={setOff} title="Import deck">
        <View style={{ paddingBottom: 20 }}>
          <ImportDeck
            onSuccess={() => {
              setOff();
              showNotification("Success", "Deck imported successfully!");
              router.push("/(tabs)");
            }}
          />
        </View>
      </DefaultModal>
    </View>
  );
};
