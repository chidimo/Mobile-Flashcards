import { useFlash } from "@/context/app-context";
import { TCreateDeck } from "@/types/generic";
import { SubmitHandler, useForm } from "react-hook-form";
import { DeckFormFields } from "./deck-form-fields";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";

export const CreateDeck = () => {
  const { addDeck } = useFlash();

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
    saveDeck(data)
      .then(() => {
        reset();
      })
      .catch((err) => {
        console.error(err);
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
        <Button
          title="Save and continue"
          onPress={handleSubmit(onSubmit)}
          className="mt-3"
        />
      </Card>
    </Screen>
  );
};
