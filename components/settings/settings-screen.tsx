import { useTheme } from "@/context/theme-context";
import { Card } from "../ui/card";
import { PageTitle } from "../ui/page-title";
import { Screen } from "../ui/screen";
import { ToggleRow } from "../ui/toggle-row";

export const SettingsScreen = () => {
  const { isDark, enableDarkMode, disableDarkMode } = useTheme();

  return (
    <Screen>
      <PageTitle title="Settings" />
      <Card className="py-1">
        <ToggleRow
          label="Dark mode"
          description="Use a dark colour scheme"
          value={isDark}
          onValueChange={(on) => (on ? enableDarkMode() : disableDarkMode())}
        />
      </Card>
    </Screen>
  );
};
