import { useFlash } from "@/context/app-context";
import {
  backupFileName,
  backupToFileContent,
  parseBackupFile,
} from "@/lib/backup-file";
import { pickTextFile } from "@/lib/pick-text-file";
import { shareJsonFile } from "@/lib/share-deck";
import { Alert } from "react-native";
import { showNotification } from "../notifier";
import { ActionRow } from "../ui/action-row";
import { Card } from "../ui/card";

const importMessage = (added: number, skipped: number) => {
  const decks = (n: number) => `${n} ${n === 1 ? "deck" : "decks"}`;
  if (added === 0) return "Every deck in that file is already here.";
  if (skipped === 0) return `Added ${decks(added)}.`;
  return `Added ${decks(added)}. ${decks(skipped)} already here, left as they are.`;
};

/** Export every deck to one file, and add decks back from such a file. */
export const BackupSection = () => {
  const { deckOfCards, archivedDecks, getScoresById, importBackup } =
    useFlash();

  const exportAll = async () => {
    const decks = [...(deckOfCards ?? []), ...archivedDecks];
    if (decks.length === 0) {
      Alert.alert("Nothing to export", "Add a deck first.");
      return;
    }
    const now = new Date();
    const scores = Object.fromEntries(
      decks.map((deck) => [deck.id, getScoresById(deck.id) ?? []]),
    );
    try {
      await shareJsonFile(
        backupFileName(now),
        backupToFileContent(decks, scores, now),
        "Save your decks",
      );
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const importAll = async () => {
    try {
      const text = await pickTextFile();
      if (text === null) return;
      const { added, skipped } = importBackup(parseBackupFile(text));
      showNotification(
        added > 0 ? "Success" : "Nothing new",
        importMessage(added, skipped),
      );
    } catch (error: any) {
      Alert.alert("Couldn't import", error.message);
    }
  };

  return (
    <Card className="gap-1 p-2">
      <ActionRow
        icon="download"
        label="Export all decks"
        description="Save every deck and its scores to one file"
        onPress={() => void exportAll()}
      />
      <ActionRow
        icon="upload"
        label="Import decks"
        description="Add decks from an exported file"
        onPress={() => void importAll()}
      />
    </Card>
  );
};
