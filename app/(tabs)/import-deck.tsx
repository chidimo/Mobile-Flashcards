import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { DeckFromClipboard } from "@/components/deck/deck-from-clipboard";
import { DeckFromDocument } from "@/components/deck/deck-from-document";
import { Button } from "@/components/ui/button";
import { ThemedView } from "@/components/themed-view";

export default function ImportDeck() {
  const [mode, setMode] = useState<"file" | "json">("json");

  return (
    <ThemedView style={{ flex: 1 }}>
      {mode === "file" ? (
        <DeckFromDocument />
      ) : (
        <DeckFromClipboard onCancel={() => router.back()} />
      )}

      <View className="px-5 pb-4 pt-2">
        <Button
          variant="outline"
          onPress={() => setMode(mode === "file" ? "json" : "file")}
          title={
            mode === "file" ? "Paste a deck instead" : "Import from a file"
          }
        />
      </View>
    </ThemedView>
  );
}
