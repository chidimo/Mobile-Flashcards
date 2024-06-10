import { useFlash } from "@/context/app-context";
import { Stack, useGlobalSearchParams } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { getDeckById, saveMyScore } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);

  return (
    <Stack
      screenOptions={{
        headerTintColor: 'purple',
        headerTitle: `MFC <> ${deck?.title}`,
      }}
    >
      <Stack.Screen name="(tabs)" options={{}} />
      <Stack.Screen name="[questionId]" options={{}} />
      <Stack.Screen name="edit" options={{}} />
    </Stack>
  );
}
