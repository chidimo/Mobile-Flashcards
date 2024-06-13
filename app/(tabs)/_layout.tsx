import { Tabs } from "expo-router";
import React from "react";

import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { tabBarProps } from "@/styles";

export default function TabLayout() {
  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: "#fff" }}
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Decks",
          ...tabBarProps,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="cards-outline"
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-deck"
        options={{
          title: "Add deck",
          ...tabBarProps,
          tabBarIcon: ({ color }) => (
            <AntDesign name="plus" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
