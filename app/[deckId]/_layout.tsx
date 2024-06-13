import { useFlash } from "@/context/app-context";
import { primaryBgColor, primaryTextColor } from "@/styles";
import { Stack, useGlobalSearchParams } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { getDeckById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: primaryBgColor },
        headerTintColor: primaryTextColor,
        headerTitle: `MFC <> ${deck?.title}`,
      }}
    >
      <Stack.Screen name="(tabs)" options={{}} />
      <Stack.Screen name="[cardId]" options={{}} />
      <Stack.Screen name="edit" options={{}} />
    </Stack>
  );
}
