import { Href } from "expo-router";
import React from "react";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { TabMenuContainer, TabMenuItem } from "@/components/tab-menu-item";

export default function TabLayout() {
  const tabItems = [
    {
      name: "index",
      displayName: "Home",
      href: "/index",
      icon: (color: string) => (
        <MaterialCommunityIcons
          name="cards-outline"
          size={28}
          color={color}
        />
      ),
    },
    {
      name: "add-deck",
      displayName: "Add deck",
      href: "/add-deck",
      icon: (color: string) => (
        <AntDesign
          name="plus"
          size={24}
          color={color}
        />
      ),
    },
    {
      name: "settings",
      displayName: "Settings",
      href: "/settings",
      icon: (color: string) => (
        <AntDesign
          name="setting"
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
          <TabTrigger key={item.name} name={item.name} asChild>
            <TabMenuItem name={item.displayName} icon={item.icon} />
          </TabTrigger>
        ))}
      </TabMenuContainer>

      <TabList style={{ display: "none" }}>
        {tabItems.map((item) => {
          return (
            <TabTrigger
              key={item.name}
              name={item.name}
              href={item.href as Href}
            />
          );
        })}
      </TabList>
    </Tabs>
  );
}
