import { Deck } from "@/types/generic";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { deckFileName, deckToFileContent } from "./deck-file";

/** Saves the deck as a JSON file and opens the system share sheet for it. */
export const shareDeckFile = async (deck: Deck) => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing isn't available on this device.");
  }
  const file = new File(Paths.cache, deckFileName(deck.title));
  file.create({ overwrite: true });
  file.write(deckToFileContent(deck));
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
    dialogTitle: `Share ${deck.title}`,
  });
};
