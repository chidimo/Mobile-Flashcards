import { SupportLink, supportLinks } from "@/lib/support-links";
import { openBrowserAsync } from "expo-web-browser";
import { Platform, Text } from "react-native";
import { ActionRow } from "../ui/action-row";
import { Card } from "../ui/card";

type Props = { links?: SupportLink[] };

/** Gift links, Android only: the App Store rejects outside payment links for personal tips. */
export const SupportSection = ({ links = supportLinks }: Props) => {
  const shown = links.filter((link) => link.url !== "");
  if (Platform.OS !== "android" || shown.length === 0) return null;

  return (
    <>
      <Text className="px-1 pt-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Support the app
      </Text>
      <Card className="gap-1 p-2">
        {shown.map((link) => (
          <ActionRow
            key={link.id}
            icon={link.icon}
            label={link.label}
            description={link.description}
            onPress={() => void openBrowserAsync(link.url)}
          />
        ))}
      </Card>
    </>
  );
};
