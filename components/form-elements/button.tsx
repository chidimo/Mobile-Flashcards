import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Text,
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

export type BtnVariant =
  | "CANCEL"
  | "DANGER"
  | "PRIMARY"
  | "SUCCESS"
  | "SECONDARY";

type Props = {
  title: string | ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  btnVariant?: BtnVariant;
  moreTextStyle?: StyleProp<TextStyle>;
  moreContainerStyle?: StyleProp<ViewStyle>;
  onPress?: (event: GestureResponderEvent) => void;
};

export const DefaultButton = (props: Props) => {
  const {
    title = "",
    onPress,
    disabled = false,
    isLoading = false,
    moreTextStyle = {},
    moreContainerStyle = {},
    btnVariant = "DANGER",
  } = props;

  return (
    <Pressable
      disabled={disabled}
      onPress={disabled ? () => null : onPress}
      style={({ pressed }) => {
        return [
          typeof title === "string"
            ? {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 50,
                borderRadius: 10,
                paddingVertical: 8,
                backgroundColor: "#07f",
                opacity: pressed || disabled ? 0.8 : 1.0,
              }
            : {},
          btnVariant === "DANGER" && containerStyle.danger,
          btnVariant === "SUCCESS" && containerStyle.success,
          btnVariant === "SECONDARY" && containerStyle.secondary,
          btnVariant === "CANCEL" && containerStyle.cancel,
          moreContainerStyle,
        ];
      }}
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
        {typeof title === "string" ? (
          <Text
            style={[
              {
                fontSize: 18,
                color: "#fff",
                fontWeight: "bold",
              },
              btnVariant === "DANGER" && titleStyle.danger,
              btnVariant === "SUCCESS" && titleStyle.success,
              btnVariant === "SECONDARY" && titleStyle.secondary,
              btnVariant === "CANCEL" && titleStyle.cancel,
              moreTextStyle,
            ]}
          >
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
    </Pressable>
  );
};

const containerStyle = StyleSheet.create({
  danger: { backgroundColor: "#C31818" },
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
