import { Href, useGlobalSearchParams } from "expo-router";
import React from "react";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { primaryTextColor } from "@/styles";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { TabMenuContainer, TabMenuItem } from "@/components/tab-menu-item";

export default function TabLayout() {
  const { deckId } = useGlobalSearchParams();

  const tabItems = [
    {
      name: "deck-index",
      displayName: "View",
      href: "/index",
      icon: (isFocused: boolean) => (
        <MaterialIcons
          name="subject"
          size={24}
          color={isFocused ? primaryTextColor : "rgba(0,0,0,0.7)"}
        />
      ),
    },
    {
      name: "add-card",
      displayName: "Add card",
      href: `/${deckId}/add-card`,
      icon: (isFocused: boolean) => (
        <AntDesign
          name="plus"
          size={24}
          color={isFocused ? primaryTextColor : "rgba(0,0,0,0.7)"}
        />
      ),
    },
    {
      name: "take-quiz",
      displayName: "Take quiz",
      href: `/${deckId}/take-quiz`,
      icon: (isFocused: boolean) => (
        <MaterialIcons
          name="quiz"
          size={24}
          color={isFocused ? primaryTextColor : "rgba(0,0,0,0.7)"}
        />
      ),
    },
    {
      name: "my-scores",
      displayName: "Scoreboard",
      href: `/${deckId}/my-scores`,
      icon: (isFocused: boolean) => (
        <MaterialCommunityIcons
          name="scoreboard"
          size={24}
          color={isFocused ? primaryTextColor : "rgba(0,0,0,0.7)"}
        />
      ),
    },
    {
      name: "manage",
      displayName: "Manage",
      href: `/${deckId}/manage`,
      icon: (isFocused: boolean) => (
        <Feather
          name="settings"
          size={24}
          color={isFocused ? primaryTextColor : "rgba(0,0,0,0.7)"}
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
