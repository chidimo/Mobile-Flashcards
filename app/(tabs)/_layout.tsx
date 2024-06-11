import { Tabs } from "expo-router";
import React from "react";

import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:  Colors["light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Decks",
          tabBarActiveTintColor: "purple",
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
          tabBarActiveTintColor: "purple",
          tabBarIcon: ({ color }) => (
            <AntDesign name="plus" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
