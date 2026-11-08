import Feather from "@react-native-vector-icons/feather";
import { useNavigation } from "expo-router";
import { Pressable } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";

type Drawerish = { openDrawer?: () => void; getParent?: () => Drawerish };

/** The header's ☰ button. Nested stacks sit under the drawer, so walk up to the navigator that can open it. */
export const MenuButton = () => {
  const navigation = useNavigation<Drawerish>();
  const { primary } = useAppTheme();

  const openMenu = () => {
    let current: Drawerish | undefined = navigation;
    while (current && !current.openDrawer) {
      current = current.getParent?.();
    }
    current?.openDrawer?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      hitSlop={10}
      onPress={openMenu}
      className="mr-2 h-10 w-10 items-center justify-center rounded-xl active:opacity-60"
    >
      <Feather name="menu" size={22} color={primary} />
    </Pressable>
  );
};
