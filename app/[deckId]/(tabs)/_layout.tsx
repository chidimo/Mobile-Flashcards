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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { deckId } = useGlobalSearchParams();
  const { getDeckById } = useFlash();
  const deck = getDeckById(deckId as string);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: deck?.title,
          tabBarActiveTintColor: "purple",
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
          tabBarActiveTintColor: "purple",
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
          tabBarActiveTintColor: "purple",
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
          tabBarActiveTintColor: "purple",
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
          tabBarActiveTintColor: "purple",
          tabBarIcon: ({ color }) => (
            <Feather name="settings" color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
