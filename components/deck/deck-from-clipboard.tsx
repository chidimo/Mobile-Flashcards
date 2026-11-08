import { useClipboard } from "@/hooks/use-clipboard";
import { DeckImport, DeckImportProps } from "./deck-import";

type Props = Pick<DeckImportProps, "onCancel" | "onSuccess">;

export const DeckFromClipboard = (props: Props) => {
  const { fetchCopiedText } = useClipboard();

  return (
    <DeckImport
      {...props}
      title="Import a deck"
      subtitle="Paste a deck's JSON that someone shared with you."
      icon="clipboard"
      instructions="In the other app open the deck, choose Manage → Share deck, then copy the deck's JSON from the file. Paste it here."
      actionTitle="Paste from clipboard"
      loadText={() =>
        new Promise<string | null>((resolve) => {
          void fetchCopiedText(resolve);
        })
      }
    />
  );
};
