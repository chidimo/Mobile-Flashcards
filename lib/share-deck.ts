import { Deck } from "@/types/generic";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { deckFileName, deckToFileContent } from "./deck-file";

/** Saves JSON text as a file in the cache and opens the system share sheet for it. */
export const shareJsonFile = async (
  fileName: string,
  content: string,
  dialogTitle: string,
) => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing isn't available on this device.");
  }
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(content);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
    dialogTitle,
  });
};

export const shareDeckFile = (deck: Deck) =>
  shareJsonFile(
    deckFileName(deck.title),
    deckToFileContent(deck),
    `Share ${deck.title}`,
  );
