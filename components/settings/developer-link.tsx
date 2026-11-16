import { developerSiteUrl } from "@/lib/developer-site";
import { openBrowserAsync } from "expo-web-browser";
import { ActionRow } from "../ui/action-row";
import { Card } from "../ui/card";

/** A plain link to the developer's site; any support links live there, not in the app. */
export const DeveloperLink = () => (
  <Card className="p-2">
    <ActionRow
      icon="globe"
      label="More apps by Chidi"
      description="chidiorji.com"
      onPress={() => void openBrowserAsync(developerSiteUrl)}
    />
  </Card>
);
