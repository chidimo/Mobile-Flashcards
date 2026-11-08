import { File } from "expo-file-system";
import { DeckImport, DeckImportProps } from "./deck-import";

type Props = Pick<DeckImportProps, "onCancel" | "onSuccess">;

const pickDeckFile = async () => {
  const picked = await File.pickFileAsync({
    mimeTypes: ["application/json", "text/plain"],
  });
  return picked.canceled ? null : picked.result.text();
};

// Importing a deck file is plain JSON for now; AI-assisted import from documents comes later.
export const DeckFromFile = (props: Props) => (
  <DeckImport
    {...props}
    title="Import from a file"
    subtitle="Choose a deck file (.json) that someone shared with you."
    icon="file"
    instructions="In the other app open the deck and choose Manage → Share deck, which sends a .json file. Save it to your device, then choose it here."
    actionTitle="Choose file"
    loadText={pickDeckFile}
  />
);
