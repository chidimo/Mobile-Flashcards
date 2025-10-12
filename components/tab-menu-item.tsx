import { primaryTextColor } from "@/styles";
import { TabTriggerSlotProps } from "expo-router/ui";
import React from "react";
import { Pressable, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Prop = TabTriggerSlotProps & {
  name: string;
  icon: (isFocused: boolean) => React.ReactNode;
  isFocused?: boolean;
};

export const TabMenuItem = ({ name, icon, isFocused, ...rest }: Prop) => {
  return (
    <Pressable {...rest}>
      <View style={{ alignItems: "center" }}>
        {icon(isFocused ?? false)}
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            fontWeight: "bold",
            maxWidth: 100,
            color: isFocused ? primaryTextColor : "rgba(0,0,0,0.5)",
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    </Pressable>
  );
};

export const TabMenuContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: bottom,
        justifyContent: "space-evenly",
        borderTopColor: "lightgray",
        borderTopWidth: 0.5,
        paddingTop: 4,
        backgroundColor: "#fff",
      }}
    >
      {children}
    </View>
  );
};
