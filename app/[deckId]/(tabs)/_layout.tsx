import { Href, useGlobalSearchParams } from "expo-router";
import React from "react";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { TabMenuContainer, TabMenuItem } from "@/components/tab-menu-item";

export default function TabLayout() {
  const { deckId } = useGlobalSearchParams();

  const tabItems = [
    {
      name: "deck-index",
      displayName: "View",
      href: "/index",
      icon: (color: string) => (
        <MaterialIcons
          name="subject"
          size={24}
          color={color}
        />
      ),
    },
    {
      name: "add-card",
      displayName: "Add card",
      href: `/${deckId}/add-card`,
      icon: (color: string) => (
        <AntDesign
          name="plus"
          size={24}
          color={color}
        />
      ),
    },
    {
      name: "take-quiz",
      displayName: "Take quiz",
      href: `/${deckId}/take-quiz`,
      icon: (color: string) => (
        <MaterialIcons
          name="quiz"
          size={24}
          color={color}
        />
      ),
    },
    {
      name: "my-scores",
      displayName: "Scoreboard",
      href: `/${deckId}/my-scores`,
      icon: (color: string) => (
        <MaterialCommunityIcons
          name="scoreboard"
          size={24}
          color={color}
        />
      ),
    },
    {
      name: "manage",
      displayName: "Manage",
      href: `/${deckId}/manage`,
      icon: (color: string) => (
        <Feather
          name="settings"
          size={24}
          color={color}
        />
      ),
    },
  ];

  return (
    <Tabs>
      <TabSlot />

      <TabMenuContainer>
        {tabItems.map(({ href, ...item }) => (
          <TabTrigger key={href} name={item.name} asChild>
            <TabMenuItem name={item.displayName} icon={item.icon} />
          </TabTrigger>
        ))}
      </TabMenuContainer>

      <TabList style={{ display: "none" }}>
        {tabItems.map((item) => {
          return (
            <TabTrigger
              key={item.href}
              name={item.name}
              href={item.href as Href}
            />
          );
        })}
      </TabList>
    </Tabs>
  );
}
