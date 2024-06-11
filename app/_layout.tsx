import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { FlashProvider } from "@/context/app-context";
import { NotifierWrapper } from "react-native-notifier";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#fff' }}>
      <NotifierWrapper>
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
      </NotifierWrapper>
    </GestureHandlerRootView>
  );
}
