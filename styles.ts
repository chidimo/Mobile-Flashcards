import { StyleSheet } from "react-native";

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

export const buttonStyles = StyleSheet.create({
  twoColumnBtns: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
