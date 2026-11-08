import { Href } from "expo-router";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Top-level screens are reached from the side drawer, so there's no tab bar here, only the routes.
const routes = [
  { name: "index", href: "/index" },
  { name: "add-deck", href: "/add-deck" },
  { name: "import-deck", href: "/import-deck" },
  { name: "settings", href: "/settings" },
];

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingBottom: bottom }}>
      <Tabs>
        <TabSlot />
        <TabList style={{ display: "none" }}>
          {routes.map((route) => (
            <TabTrigger
              key={route.name}
              name={route.name}
              href={route.href as Href}
            />
          ))}
        </TabList>
      </Tabs>
    </View>
  );
}
