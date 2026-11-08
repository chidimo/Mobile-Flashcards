import { useFlash } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Stack, useGlobalSearchParams } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { getDeckById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const { background, primary, text } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: background },
        headerTransparent: false,
        headerShadowVisible: false,
        headerTitleStyle: { color: text, fontWeight: "700" },
        headerStyle: { backgroundColor: background },
        headerTintColor: primary,
        headerTitle: deck?.title ?? "Deck",
      }}
    >
      <Stack.Screen name="(tabs)" options={{}} />
    </Stack>
  );
}
