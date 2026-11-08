import { useFlash } from "@/context/app-context";
import { TCreateDeck } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { DeckFormFields } from "./deck-form-fields";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";
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
    <Screen scroll>
      <PageTitle
        title="Create deck"
        subtitle="Name your deck and set the score needed to pass."
      />

      <Card>
        <DeckFormFields isNew control={control} errors={errors} />
      </Card>

      <View className="gap-3">
        <Button title="Save deck" onPress={handleSubmit(onSubmit)} />
        <Button title="Import a deck" variant="secondary" onPress={setOn} />
      </View>

      <DefaultModal visible={isOn} onRequestClose={setOff} title="Import deck">
        <View className="pb-5">
          <ImportDeck
            onSuccess={() => {
              setOff();
              showNotification("Success", "Deck imported successfully!");
              router.push("/(tabs)");
            }}
            onCancel={() => {
              setOff();
            }}
          />
        </View>
      </DefaultModal>
    </Screen>
  );
};
