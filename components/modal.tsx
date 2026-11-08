import * as React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { cn } from "@/utils/cn";

type Props = {
  title: string;
  visible: boolean;
  modalBehavior?: "slide-from-bottom" | "fade-into-view";
  onRequestClose: () => void;
};

/** A bottom sheet (or centred dialog) over a dimmed backdrop. */
export const DefaultModal = (props: React.PropsWithChildren<Props>) => {
  const {
    title,
    children,
    visible,
    onRequestClose,
    modalBehavior = "slide-from-bottom",
  } = props;
  const { bottom } = useSafeAreaInsets();
  const { mutedIcon } = useAppTheme();
  const sheet = modalBehavior === "slide-from-bottom";

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
      transparent
    >
      <View
        className={cn(
          "flex-1 bg-black/60",
          sheet ? "justify-end" : "justify-center px-5",
        )}
      >
        <Pressable
          accessibilityLabel="Close"
          className="absolute inset-0"
          onPress={onRequestClose}
        />
        <View
          style={sheet ? { paddingBottom: bottom } : undefined}
          className={cn(
            "max-h-[85%] bg-white px-5 pt-5 dark:bg-ink-900",
            sheet ? "rounded-t-3xl" : "rounded-3xl pb-5",
          )}
        >
          <View className="mb-4 flex-row items-center justify-between gap-3">
            <Text
              accessibilityRole="header"
              className="flex-1 text-xl font-bold text-neutral-900 dark:text-white"
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
              onPress={onRequestClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100 active:opacity-70 dark:bg-ink-700"
            >
              <Feather name="x" size={18} color={mutedIcon} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
