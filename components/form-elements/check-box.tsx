import { default as ExpoCheckBox } from "expo-checkbox";

import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  label?: string;
  boxPosition?: "left" | "right";
  error?: string | any[];
  disabled?: boolean;
  checked?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  onValueChange: (...args: any[]) => any;
};

export const AppCheckbox = (props: Props): JSX.Element => {
  const {
    label,
    error,
    disabled,
    checked = false,
    containerStyle,
    boxPosition = "left",
    onValueChange,
  } = props;

  return (
    <Pressable
      style={[styles.container, containerStyle]}
      onPress={() => onValueChange(!checked)}
    >
      <View
        style={{
          display: "flex",
          flexDirection: boxPosition === "left" ? "row" : "row-reverse",
        }}
      >
        <ExpoCheckBox
          value={checked}
          disabled={disabled !== undefined ? disabled : false}
          onValueChange={onValueChange}
        />
        <Text
          style={{
            marginLeft: boxPosition === "left" ? 10 : 0,
            marginRight: boxPosition === "left" ? 0 : 10,
          }}
        >
          {label}
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  errorText: {
    color: "red",
  },
});
