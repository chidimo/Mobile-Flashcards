import { useAppTheme } from "@/hooks/use-app-theme";
import { cn } from "@/utils/cn";
import { TabTriggerSlotProps } from "expo-router/ui";
import React from "react";
import { Pressable, PressableProps, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Prop = TabTriggerSlotProps & {
  name: string;
  icon: (color: string) => React.ReactNode;
  isFocused?: boolean;
};

// Same shape as olamma's drawer items: a rounded row with an active background and a pressed state.
export const TabMenuItem = ({ name, icon, isFocused, ...rest }: Prop) => {
  const { primary, mutedIcon } = useAppTheme();

  return (
    <View className="flex-1 items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        accessibilityState={{ selected: !!isFocused }}
        className="min-w-[68px] px-2 py-2 active:opacity-60"
        {...(rest as PressableProps)}
      >
        {/* The trigger can inject its own style on the pressable, so the column lives one level down. */}
        <View className="w-full items-center gap-1">
          {icon(isFocused ? primary : mutedIcon)}
          <Text
            numberOfLines={1}
            className={cn(
              "text-xs",
              isFocused
                ? "font-semibold text-primary-600 dark:text-primary-400"
                : "text-neutral-500 dark:text-neutral-400",
            )}
          >
            {name}
          </Text>
        </View>
      </Pressable>
    </View>
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
      className="flex-row items-center border-t border-neutral-200 bg-white px-2 pt-2 dark:border-ink-700 dark:bg-ink-900"
      style={{ paddingBottom: bottom + 8 }}
    >
      {children}
    </View>
  );
};
