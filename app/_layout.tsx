import "../global.css";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FlashProvider } from "@/context/app-context";
import { NotifierWrapper } from "react-native-notifier";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppTheme } from "@/hooks/use-app-theme";
import { ThemeProvider, usePalette } from "@/context/theme-context";
import { UpdateProvider } from "@/context/update-context";
import { UpdatePrompt } from "@/components/update-prompt";
import { paletteVars } from "@/utils/palette-vars";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Inside ThemeProvider so the chosen palette reaches classNames (via CSS variables) and headers.
const AppShell = () => {
  const palette = usePalette();
  const { primary, text, bar, background } = useAppTheme();

  return (
    <View
      style={[{ flex: 1, backgroundColor: background }, paletteVars(palette)]}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: bar }}
        edges={["bottom"]}
      >
        <Stack
          screenOptions={{
            headerTransparent: false,
            headerShadowVisible: false,
            headerTitleStyle: { color: text, fontWeight: "700" },
            contentStyle: { backgroundColor: background },
            headerStyle: { backgroundColor: background },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{ headerTitle: "Flashcards", headerTintColor: primary }}
          />
          <Stack.Screen
            name="import-deck"
            options={{ headerTitle: "Import deck", headerTintColor: primary }}
          />
          <Stack.Screen name="[deckId]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <UpdatePrompt />
      </SafeAreaView>
    </View>
  );
};

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NotifierWrapper>
          <ThemeProvider>
            <FlashProvider>
              <UpdateProvider>
                <AppShell />
              </UpdateProvider>
            </FlashProvider>
          </ThemeProvider>
        </NotifierWrapper>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
