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
  title: string | JSX.Element;
  disabled?: boolean;
  isLoading?: boolean;
  btnVariant?: BtnVariant;
  moreContainerStyle?: StyleProp<ViewStyle>;
  onPress?: (event: GestureResponderEvent) => void;
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
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: 50,
          borderRadius: 10,
          paddingVertical: 8,
          backgroundColor: "#07f",
        },
        btnVariant === "DANGER" && containerStyle.danger,
        btnVariant === "SUCCESS" && containerStyle.success,
        btnVariant === "SECONDARY" && containerStyle.secondary,
        btnVariant === "CANCEL" && containerStyle.cancel,
        moreContainerStyle,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading && (
          <ActivityIndicator
            size={22}
            color={btnVariant === "CANCEL" ? "black" : "#fff"}
            style={[{ marginRight: 3 }]}
          />
        )}
        <Text
          style={[
            {
              fontSize: 18,
              color: "#fff",
            },
            btnVariant === "DANGER" && titleStyle.danger,
            btnVariant === "SUCCESS" && titleStyle.success,
            btnVariant === "SECONDARY" && titleStyle.secondary,
            btnVariant === "CANCEL" && titleStyle.cancel,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const containerStyle = StyleSheet.create({
  danger: { backgroundColor: "red" },
  success: { backgroundColor: "green" },
  secondary: { backgroundColor: "grey" },
  cancel: { backgroundColor: "#ccc" },
});

const titleStyle = StyleSheet.create({
  danger: { color: "#fff" },
  success: { color: "#fff" },
  secondary: { color: "#fff" },
  cancel: { color: "black" },
});
