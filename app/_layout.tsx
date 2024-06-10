import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { FlashProvider } from "@/context/app-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <FlashProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerTitle: "Home <> Mobile flashcards",
            headerTintColor: "purple",
          }}
        />
        <Stack.Screen name="[deckId]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </FlashProvider>
  );
}
