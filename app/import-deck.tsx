import { ImportDeck } from "@/components/deck/import-deck";
import { showNotification } from "@/components/notifier";
import { router } from "expo-router";

export default function ImportDeckScreen() {
  return (
    <ImportDeck
      onSuccess={() => {
        showNotification("Success", "Deck imported successfully!");
        router.replace("/(tabs)");
      }}
      onCancel={() => router.back()}
    />
  );
}
