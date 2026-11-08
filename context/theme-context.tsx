import { themePreferenceKey } from "@/constants";
import { getItemFromStorage, setItemToStorage } from "@/lib/work-with-storage";
import { createContext, useContext, useEffect, useMemo } from "react";
import { colorScheme } from "nativewind";
import { Appearance, useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContext {
  isDark: boolean;
  enableDarkMode: () => void;
  disableDarkMode: () => void;
}

const ThemeCtx = createContext<ThemeContext | undefined>(undefined);

const applyTheme = (theme: Theme) => {
  Appearance.setColorScheme(theme);
  colorScheme.set(theme);
};

// Overrides the system scheme app-wide, so useColorScheme() follows the choice.
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const isDark = useColorScheme() === "dark";

  useEffect(() => {
    void getItemFromStorage<Theme>(themePreferenceKey, applyTheme);
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
    }),
    [isDark]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
