import Feather from "@react-native-vector-icons/feather";
import { Href, usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { cn } from "@/utils/cn";

type DrawerProps = { navigation: { closeDrawer: () => void } };

type Item = {
  label: string;
  href: Href;
  path: string;
  icon: React.ComponentProps<typeof Feather>["name"];
};

const items: Item[] = [
  { label: "Home", href: "/", path: "/", icon: "layers" },
  {
    label: "Add deck",
    href: "/add-deck",
    path: "/add-deck",
    icon: "plus-circle",
  },
  {
    label: "Import deck",
    href: "/import-deck",
    path: "/import-deck",
    icon: "file",
  },
  { label: "Settings", href: "/settings", path: "/settings", icon: "settings" },
];

/** Side menu: the app's top-level screens, reachable from anywhere, including inside a deck. */
export const AppDrawer = ({ navigation }: DrawerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { primary, mutedIcon, bar } = useAppTheme();

  const go = (href: Href) => {
    navigation.closeDrawer();
    router.navigate(href);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bar }}>
      <View className="gap-1 px-4 pt-4">
        <Text className="px-3 pb-3 text-2xl font-bold text-neutral-900 dark:text-white">
          Flashcards
        </Text>
        {items.map((item) => {
          const active = pathname === item.path;
          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => go(item.href)}
              className={cn(
                "flex-row items-center gap-3 rounded-xl px-3 py-3",
                active
                  ? "bg-neutral-100 dark:bg-neutral-800"
                  : "active:bg-neutral-100 dark:active:bg-neutral-800",
              )}
            >
              <Feather
                name={item.icon}
                size={20}
                color={active ? primary : mutedIcon}
              />
              <Text
                className={cn(
                  "text-base text-neutral-900 dark:text-white",
                  active && "font-semibold",
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};
