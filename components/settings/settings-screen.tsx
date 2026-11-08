import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/context/theme-context";
import { StyleSheet, Switch } from "react-native";

export const SettingsScreen = () => {
  const { isDark, enableDarkMode, disableDarkMode } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.row}>
        <ThemedText type="defaultSemiBold">Dark mode</ThemedText>
        <Switch
          accessibilityLabel="Dark mode"
          value={isDark}
          onValueChange={(on) => (on ? enableDarkMode() : disableDarkMode())}
        />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", padding: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
