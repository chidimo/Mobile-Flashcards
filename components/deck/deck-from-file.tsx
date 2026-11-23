import { pickTextFile } from "@/lib/pick-text-file";
import { DeckImport, DeckImportProps } from "./deck-import";

type Props = Pick<DeckImportProps, "onCancel" | "onSuccess">;

// Importing a deck file is plain JSON for now; AI-assisted import from documents comes later.
export const DeckFromFile = (props: Props) => (
  <DeckImport
    {...props}
    title="Import from a file"
    subtitle="Choose a deck file (.json) that someone shared with you."
    icon="file"
    instructions="In the other app open the deck and choose Manage → Share deck, which sends a .json file. Save it to your device, then choose it here."
    actionTitle="Choose file"
    loadText={pickTextFile}
  />
);
