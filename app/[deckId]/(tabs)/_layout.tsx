import { Href, useGlobalSearchParams } from "expo-router";
import React from "react";
import Feather from "@react-native-vector-icons/feather";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { TabMenuContainer, TabMenuItem } from "@/components/tab-menu-item";

export default function TabLayout() {
  const { deckId } = useGlobalSearchParams();

  const tabItems = [
    {
      name: "deck-index",
      displayName: "Cards",
      href: `/${deckId}`,
      icon: (color: string) => (
        <Feather name="book-open" size={22} color={color} />
      ),
    },
    {
      name: "take-quiz",
      displayName: "Quiz",
      href: `/${deckId}/take-quiz`,
      icon: (color: string) => (
        <Feather name="play-circle" size={22} color={color} />
      ),
    },
    {
      name: "my-scores",
      displayName: "Scores",
      href: `/${deckId}/my-scores`,
      icon: (color: string) => (
        <Feather name="bar-chart-2" size={22} color={color} />
      ),
    },
    {
      name: "manage",
      displayName: "Manage",
      href: `/${deckId}/manage`,
      icon: (color: string) => (
        <Feather name="sliders" size={22} color={color} />
      ),
    },
  ];

  // Reached from the Cards screen, so these have a route but no tab.
  const routeOnly = [
    { name: "add-card", href: `/${deckId}/add-card` },
    { name: "edit-card", href: `/${deckId}/edit-card` },
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
        {[...tabItems, ...routeOnly].map((item) => {
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
