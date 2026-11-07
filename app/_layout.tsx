import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { FlashProvider } from "@/context/app-context";
import { NotifierWrapper } from "react-native-notifier";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeColor } from "@/hooks/use-theme-color";
import { primaryTextColor } from "@/styles";
import { ThemeProvider } from "@/context/theme-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NotifierWrapper>
          <ThemeProvider>
            <FlashProvider>
              <ThemedView style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
                  <Stack
                    screenOptions={{
                      headerTransparent: false,
                      headerStyle: { backgroundColor },
                    }}
                  >
                    <Stack.Screen
                      name="(tabs)"
                      options={{
                        headerTitle: "Home <> Mobile flashcards",
                        headerTintColor: primaryTextColor,
                      }}
                    />
                    <Stack.Screen
                      name="[deckId]"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </SafeAreaView>
              </ThemedView>
            </FlashProvider>
          </ThemeProvider>
        </NotifierWrapper>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
