import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";

export type BtnVariant =
  | "CANCEL"
  | "DANGER"
  | "PRIMARY"
  | "SUCCESS"
  | "SECONDARY";

type Props = {
  title?: string | JSX.Element;
  iconType?: string;
  disabled?: boolean;
  isLoading?: boolean;
  btnVariant?: BtnVariant;
  moreContainerStyle?: StyleProp<ViewStyle>;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
};

export const DefaultButton = (props: Props) => {
  const {
    title = "",
    onPress,
    disabled = false,
    isLoading = false,
    moreContainerStyle,
    btnVariant = "PRIMARY",
  } = props;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={disabled ? () => null : onPress}
      style={[
        containerStyle.base,
        btnVariant === "PRIMARY" && containerStyle.primary,
        btnVariant === "DANGER" && containerStyle.danger,
        btnVariant === "SUCCESS" && containerStyle.success,
        btnVariant === "SECONDARY" && containerStyle.secondary,
        btnVariant === "CANCEL" && containerStyle.cancel,
        moreContainerStyle,
      ]}
    >
      <View>
        {isLoading ? (
          <ActivityIndicator style={{}} size={27} color="#fff" />
        ) : (
          <Text
            style={[
              titleStyle.base,
              btnVariant === "PRIMARY" && titleStyle.primary,
              btnVariant === "DANGER" && titleStyle.danger,
              btnVariant === "SUCCESS" && titleStyle.success,
              btnVariant === "SECONDARY" && titleStyle.secondary,
              btnVariant === "CANCEL" && titleStyle.cancel,
            ]}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const containerStyle = StyleSheet.create({
  base: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    color: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
  },
  primary: { backgroundColor: "#07f" },
  danger: { backgroundColor: "red" },
  success: { backgroundColor: "green" },
  secondary: { backgroundColor: "grey" },
  cancel: { backgroundColor: "#fff" },
});

const titleStyle = StyleSheet.create({
  base: {
    fontSize: 18,
    color: "#fff",
  },
  primary: { color: "#fff" },
  danger: { color: "#fff" },
  success: { color: "#fff" },
  secondary: { color: "#fff" },
  cancel: { color: "black" },
});
