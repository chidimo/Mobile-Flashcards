import { useAppTheme } from "@/hooks/use-app-theme";
import React, { ReactNode } from "react";

import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const ShadowBox = (props: Props) => {
  const { children, style } = props;
  const { background } = useAppTheme();
  return (
    <View style={[styles.boxContainer, { backgroundColor: background }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
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
