import "../global.css";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FlashProvider } from "@/context/app-context";
import { NotifierWrapper } from "react-native-notifier";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppTheme } from "@/hooks/use-app-theme";
import { ThemeProvider, usePalette } from "@/context/theme-context";
import { UpdateProvider } from "@/context/update-context";
import { AppDrawer } from "@/components/app-drawer";
import { MenuButton } from "@/components/menu-button";
import { UpdatePrompt } from "@/components/update-prompt";
import { paletteVars } from "@/utils/palette-vars";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Inside ThemeProvider so the chosen palette reaches classNames (via CSS variables) and headers.
const AppShell = () => {
  const palette = usePalette();
  const { text, background } = useAppTheme();

  return (
    <View
      style={[{ flex: 1, backgroundColor: background }, paletteVars(palette)]}
    >
      {/* "auto" follows the app's light/dark scheme, so the clock and icons stay readable. */}
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <AppDrawer {...props} />}
          screenOptions={{
            drawerType: "front",
            drawerStyle: { width: 300 },
            overlayColor: "rgba(0,0,0,0.6)",
            headerShadowVisible: false,
            headerTitleStyle: { color: text, fontWeight: "700" },
            sceneStyle: { backgroundColor: background },
            headerStyle: { backgroundColor: background },
            headerLeft: () => <MenuButton />,
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{ headerTitle: "Flashcards" }}
          />
          {/* One stack per deck, so opening another deck never inherits the last one's screen state. */}
          <Drawer.Screen
            name="[deckId]"
            options={{ headerShown: false }}
            dangerouslySingular={(_, params) => String(params?.deckId)}
          />
          <Drawer.Screen name="+not-found" options={{ headerShown: false }} />
        </Drawer>
        <UpdatePrompt />
      </View>
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
