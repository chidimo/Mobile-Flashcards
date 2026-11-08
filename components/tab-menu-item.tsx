import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { TabTriggerSlotProps } from "expo-router/ui";
import React from "react";
import { Pressable, PressableProps, View, Text } from "react-native";

type Prop = TabTriggerSlotProps & {
  name: string;
  icon: (color: string) => React.ReactNode;
  isFocused?: boolean;
};

export const TabMenuItem = ({ name, icon, isFocused, ...rest }: Prop) => {
  const { primary, muted, mutedIcon } = useAppTheme();

  return (
    <Pressable {...(rest as PressableProps)}>
      <View style={{ alignItems: "center" }}>
        {icon(isFocused ? primary : mutedIcon)}
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            fontWeight: "bold",
            maxWidth: 100,
            color: isFocused ? primary : muted,
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
  const backgroundColor = useThemeColor({}, "background");
  const { border } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-evenly",
        borderTopColor: border,
        borderTopWidth: 0.5,
        paddingTop: 4,
        backgroundColor,
      }}
    >
      {children}
    </View>
  );
};
