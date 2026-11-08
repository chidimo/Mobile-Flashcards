import { useFlash } from "@/context/app-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Stack, useGlobalSearchParams } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { getDeckById } = useFlash();
  const { deckId } = useGlobalSearchParams();
  const deck = getDeckById(deckId as string);
  const { background, primary } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: background },
        headerTransparent: false,
        headerStyle: { backgroundColor: background },
        headerTintColor: primary,
        headerTitle: `MFC <> ${deck?.title}`,
      }}
    >
      <Stack.Screen name="(tabs)" options={{}} />
    </Stack>
  );
}
