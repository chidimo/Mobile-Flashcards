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
  onValueChange: (value: boolean) => void;
};

export const AppCheckbox = (props: Props): JSX.Element => {
  const {
    label,
    error,
    disabled = false,
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
          style={{ width: 36, height: 36 }}
          accessible
          accessibilityLabel={label}
          value={checked}
          disabled={disabled}
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
