import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const useAppTheme = () => Colors[useColorScheme() ?? "light"];
