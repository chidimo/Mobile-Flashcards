import { StyleProp, StyleSheet, TextStyle } from "react-native";

const tabBarInactiveTint = "gray";
export const primaryBgColor = "#fff";
export const primaryTextColor = "purple";

export const sharedStyles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    textAlign: "center",
    color: primaryTextColor,
    fontWeight: "900",
  },
});

export const pageContainerStyle = StyleSheet.create({
  mainPageView: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  minorPageView: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export const tabBarProps = {
  tabBarStyle: { height: 55 },
  tabBarActiveTintColor: primaryTextColor,
  tabBarInactiveTintColor: tabBarInactiveTint,
  tabBarLabelStyle: { fontWeight: "900", fontSize: 11 } as StyleProp<TextStyle>,
};
