import { StyleProp, StyleSheet, TextStyle } from "react-native";

export const sharedStyles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    textAlign: "center",
    color: "purple",
    fontWeight: "900",
  },
});

export const pageContainerStyle = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    width: "100%",
  },
});

export const tabBarProps = {
  tabBarStyle: {height: 55},
  tabBarActiveTintColor: "purple",
  tabBarInactiveTintColor: "gray",
  tabBarLabelStyle: { fontWeight: "900", fontSize: 11 } as StyleProp<TextStyle>,
};
