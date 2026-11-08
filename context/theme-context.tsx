import { themePaletteKey, themePreferenceKey } from "@/constants";
import { Palette, defaultPaletteId, getPalette } from "@/constants/palettes";
import { getItemFromStorage, setItemToStorage } from "@/lib/work-with-storage";
import { colorScheme } from "nativewind";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContext {
  isDark: boolean;
  enableDarkMode: () => void;
  disableDarkMode: () => void;
  palette: Palette;
  setPaletteId: (id: string) => void;
}

const ThemeCtx = createContext<ThemeContext | undefined>(undefined);

const applyTheme = (theme: Theme) => {
  Appearance.setColorScheme(theme);
  colorScheme.set(theme);
};

// Overrides the system scheme app-wide, so useColorScheme() follows the choice.
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const isDark = useColorScheme() === "dark";
  const [paletteId, setPaletteIdState] = useState(defaultPaletteId);

  useEffect(() => {
    void getItemFromStorage<Theme>(themePreferenceKey, applyTheme);
    void getItemFromStorage<string>(themePaletteKey, (id) =>
      setPaletteIdState(getPalette(id).id),
    );
  }, []);

  const value = useMemo(
    () => ({
      isDark,
      enableDarkMode: () => {
        applyTheme("dark");
        void setItemToStorage("dark", themePreferenceKey);
      },
      disableDarkMode: () => {
        applyTheme("light");
        void setItemToStorage("light", themePreferenceKey);
      },
      palette: getPalette(paletteId),
      setPaletteId: (id: string) => {
        const next = getPalette(id).id;
        setPaletteIdState(next);
        void setItemToStorage(next, themePaletteKey);
      },
    }),
    [isDark, paletteId],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

/** The chosen palette, or the default one outside a ThemeProvider. */
export const usePalette = () =>
  useContext(ThemeCtx)?.palette ?? getPalette(defaultPaletteId);
