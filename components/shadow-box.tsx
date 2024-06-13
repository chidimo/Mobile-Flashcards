import { primaryBgColor } from "@/styles";
import React, { ReactNode } from "react";

import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const ShadowBox = (props: Props) => {
  const { children, style } = props;
  return <View style={[styles.boxContainer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  boxContainer: {
    backgroundColor: primaryBgColor,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
