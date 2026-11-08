import { useTheme } from "@/context/theme-context";
import { useUpdate } from "@/context/update-context";
import { palettes } from "@/constants/palettes";
import { cn } from "@/utils/cn";
import { Pressable, Text, View } from "react-native";
import { ActionRow } from "../ui/action-row";
import { Card } from "../ui/card";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";
import { ToggleRow } from "../ui/toggle-row";

const updateDescription = (status: string, version: string) => {
  if (status === "checking") return "Checking…";
  if (status === "current") return `You're on the latest version (${version})`;
  if (status === "available") return "A new version is available";
  if (status === "error") return "Couldn't check right now. Try again later.";
  return `Version ${version}`;
};

export const SettingsScreen = () => {
  const { isDark, enableDarkMode, disableDarkMode, palette, setPaletteId } =
    useTheme();
  const { status, installedVersion, checkNow } = useUpdate();

  return (
    <Screen scroll>
      <PageTitle title="Settings" />

      <Card className="py-1">
        <ToggleRow
          label="Dark mode"
          description="Use a dark colour scheme"
          value={isDark}
          onValueChange={(on) => (on ? enableDarkMode() : disableDarkMode())}
        />
      </Card>

      <Card className="gap-4">
        <View className="gap-0.5">
          <Text className="text-base font-semibold text-neutral-900 dark:text-white">
            Colour theme
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Pick the accent colour used across the app
          </Text>
        </View>
        <View className="flex-row justify-between">
          {palettes.map((option) => {
            const selected = option.id === palette.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityLabel={`${option.name} theme`}
                accessibilityState={{ selected }}
                onPress={() => setPaletteId(option.id)}
                className="items-center gap-2 active:opacity-70"
              >
                <View
                  className={cn(
                    "h-14 w-14 items-center justify-center rounded-full border-2",
                    selected
                      ? "border-neutral-900 dark:border-white"
                      : "border-transparent",
                  )}
                >
                  <View
                    className="h-10 w-10 rounded-full"
                    style={{ backgroundColor: option.primary[600] }}
                  />
                </View>
                <Text
                  className={cn(
                    "text-xs",
                    selected
                      ? "font-semibold text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-neutral-400",
                  )}
                >
                  {option.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card className="p-2">
        <ActionRow
          icon="refresh-cw"
          label="Check for updates"
          description={updateDescription(status, installedVersion)}
          onPress={() => void checkNow()}
        />
      </Card>
    </Screen>
  );
};
