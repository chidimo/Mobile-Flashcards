import { useFlash } from "@/context/app-context";
import { shareDeckFile } from "@/lib/share-deck";
import { router, useGlobalSearchParams } from "expo-router";
import { Alert } from "react-native";
import { EditDeck } from "./edit-deck";
import { useOnOffSwitch } from "@/hooks/use-on-off-switch";
import { useState } from "react";
import { Deck } from "@/types/generic";
import { ActionRow } from "../ui/action-row";
import { Card } from "../ui/card";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";

const DeleteDeck = ({ deck }: { deck: Deck | null }) => {
  const { isOn, setOn, setOff } = useOnOffSwitch();
  const { deleteDeck } = useFlash();

  return (
    <>
      <ActionRow
        icon="trash-2"
        label="Delete deck"
        description="Remove the deck and all its cards"
        destructive
        onPress={setOn}
      />

      <ConfirmDialog
        visible={isOn}
        title={`Delete ${deck?.title}?`}
        message="This deletes the deck and all of its cards. You can't undo this."
        onCancel={setOff}
        onConfirm={() => {
          deleteDeck(deck?.id as string);
          router.replace(`/(tabs)`);
        }}
      />
    </>
  );
};

export const ManageDeck = () => {
  const { deckId } = useGlobalSearchParams();
  const { getDeckById, resetScore } = useFlash();
  const deck = getDeckById(deckId as string);

  const [isEdit, setIsEdit] = useState(false);

  const onShare = async () => {
    try {
      if (deck) await shareDeckFile(deck);
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  if (isEdit) {
    return (
      <Screen scroll>
        <PageTitle title="Edit deck" subtitle={deck?.title} />
        <EditDeck
          onCancel={() => setIsEdit(false)}
          onSuccess={() => setIsEdit(false)}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <PageTitle title="Manage" subtitle={deck?.title} />

      <Card className="gap-1 p-2">
        <ActionRow
          icon="edit-2"
          label="Edit deck"
          description="Change the name or pass mark"
          onPress={() => setIsEdit(true)}
        />
        <ActionRow
          icon="rotate-ccw"
          label="Reset scoreboard"
          description="Clear all saved scores"
          onPress={() => resetScore(deckId as string)}
        />
        <ActionRow
          icon="share"
          label="Share deck"
          description="Send a .json file others can import"
          onPress={onShare}
        />
        <DeleteDeck deck={deck} />
      </Card>
    </Screen>
  );
};
