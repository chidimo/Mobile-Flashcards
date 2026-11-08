import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { cn } from "@/utils/cn";

type Props = PropsWithChildren<{
  /** Scrolls the content; use for lists and long forms. Fixed layouts leave it off. */
  scroll?: boolean;
  className?: string;
}>;

/** The page background and gutters every screen shares. */
export const Screen = ({ children, scroll = false, className }: Props) => {
  if (scroll) {
    return (
      <ScrollView
        className="flex-1 bg-canvas dark:bg-ink-950"
        contentContainerClassName={cn("gap-4 px-5 pb-8 pt-4", className)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View
      className={cn(
        "flex-1 gap-4 bg-canvas px-5 pb-6 pt-4 dark:bg-ink-950",
        className,
      )}
    >
      {children}
    </View>
  );
};
