import { Tabs, useGlobalSearchParams } from "expo-router";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFlash } from "@/context/app-context";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { tabBarProps } from "@/styles";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { deckId } = useGlobalSearchParams();
  const { getDeckById } = useFlash();
  const deck = getDeckById(deckId as string);

  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: "#fff" }}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: deck?.title,
          ...tabBarProps,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="subject" color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="add-card"
        options={{
          headerShown: false,
          title: "Add card",
          ...tabBarProps,
          tabBarIcon: ({ color }) => (
            <AntDesign name="plus" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="take-quiz"
        options={{
          headerShown: false,
          title: "Take Quiz",
          ...tabBarProps,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="quiz" color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-scores"
        options={{
          headerShown: false,
          title: "Scoreboard",
          ...tabBarProps,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="scoreboard" color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="manage"
        options={{
          headerShown: false,
          title: "Manage",
          ...tabBarProps,
          tabBarIcon: ({ color }) => (
            <Feather name="settings" color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
