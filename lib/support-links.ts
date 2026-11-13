import Feather from "@react-native-vector-icons/feather";
import { ComponentProps } from "react";

export type SupportLink = {
  id: string;
  label: string;
  description: string;
  icon: ComponentProps<typeof Feather>["name"];
  url: string;
};

/** Where people can gift the developer. A link with an empty url is left out. */
export const supportLinks: SupportLink[] = [
  {
    id: "buy-me-a-malt",
    label: "Buy me a malt",
    description: "A one-off thank you",
    icon: "gift",
    url: "",
  },
  {
    id: "buy-me-a-coffee",
    label: "Buy me a coffee",
    description: "A one-off thank you",
    icon: "coffee",
    url: "",
  },
  {
    id: "github-sponsors",
    label: "GitHub Sponsors",
    description: "Support the project on GitHub",
    icon: "github",
    url: "",
  },
];
