import { Href } from "expo-router";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import Feather from "@react-native-vector-icons/feather";
import { TabMenuContainer, TabMenuItem } from "@/components/tab-menu-item";

export default function TabLayout() {
  const tabItems = [
    {
      name: "index",
      displayName: "Home",
      href: "/index",
      icon: (color: string) => (
        <Feather name="layers" size={22} color={color} />
      ),
    },
    {
      name: "add-deck",
      displayName: "Add deck",
      href: "/add-deck",
      icon: (color: string) => (
        <Feather name="plus-circle" size={22} color={color} />
      ),
    },
    {
      name: "import-deck",
      displayName: "Import deck",
      href: "/import-deck",
      icon: (color: string) => <Feather name="file" size={22} color={color} />,
    },
    {
      name: "settings",
      displayName: "Settings",
      href: "/settings",
      icon: (color: string) => (
        <Feather name="settings" size={22} color={color} />
      ),
    },
  ];

  return (
    <Tabs>
      <TabSlot />

      <TabMenuContainer>
        {tabItems.map(({ href, ...item }) => (
          <TabTrigger key={item.name} name={item.name} asChild>
            <TabMenuItem name={item.displayName} icon={item.icon} />
          </TabTrigger>
        ))}
      </TabMenuContainer>

      <TabList style={{ display: "none" }}>
        {tabItems.map((item) => {
          return (
            <TabTrigger
              key={item.name}
              name={item.name}
              href={item.href as Href}
            />
          );
        })}
      </TabList>
    </Tabs>
  );
}
