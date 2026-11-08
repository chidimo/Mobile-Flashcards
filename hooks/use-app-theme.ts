import { buildTheme } from "@/constants/theme";
import { usePalette } from "@/context/theme-context";
import { useColorScheme } from "react-native";

/** Hex colours for the current scheme and palette, for what classNames can't style (icons, headers). */
export const useAppTheme = () =>
  buildTheme(useColorScheme() ?? "light", usePalette());
