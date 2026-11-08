import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { DeckFromClipboard } from "@/components/deck/deck-from-clipboard";
import { DeckFromFile } from "@/components/deck/deck-from-file";
import { Button } from "@/components/ui/button";
import { ThemedView } from "@/components/themed-view";

export default function ImportDeck() {
  const [mode, setMode] = useState<"file" | "paste">("file");

  return (
    <ThemedView style={{ flex: 1 }}>
      {mode === "file" ? (
        <DeckFromFile onCancel={() => router.back()} />
      ) : (
        <DeckFromClipboard onCancel={() => router.back()} />
      )}

      <View className="px-5 pb-4 pt-2">
        <Button
          variant="outline"
          onPress={() => setMode(mode === "file" ? "paste" : "file")}
          title={
            mode === "file" ? "Paste a deck instead" : "Import from a file"
          }
        />
      </View>
    </ThemedView>
  );
}
