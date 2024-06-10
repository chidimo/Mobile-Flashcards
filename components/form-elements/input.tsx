import { Ref, forwardRef, useState, useEffect } from "react";
import {
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

type ReturnKeyTypeOptions = "done" | "go" | "next" | "search" | "send";

type AutoCompleteOptions =
  | "name"
  | "off"
  | "cc-csc"
  | "cc-exp"
  | "cc-exp-month"
  | "cc-exp-year"
  | "cc-number"
  | "email"
  | "password"
  | "postal-code"
  | "street-address"
  | "tel"
  | "username";

type Props = {
  label?: string;
  value?: any;
  disabled?: boolean;
  multiline?: boolean;
  secureTextEntry?: boolean;
  selectTextOnFocus?: boolean;
  showPasswordToggle?: boolean;

  error?: any;
  placeholder?: string;

  containerStyle?: StyleProp<ViewStyle>;

  returnKeyType?: ReturnKeyTypeOptions;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: AutoCompleteOptions;

  onBlur?: (...args: any[]) => any;
  onChangeText?: (...args: any[]) => any;
  onSubmitEditing?: (...args: any[]) => any;
};

export const Input = forwardRef((props: Props, ref: Ref<TextInput>) => {
  const {
    label,
    value,
    error,
    disabled = false,
    multiline = false,
    containerStyle,
    onBlur,
    onChangeText,
    onSubmitEditing,
    placeholder = "Enter value",
    keyboardType = "default",
    returnKeyType,
    showPasswordToggle = false,
    selectTextOnFocus,
    secureTextEntry = false,
    autoComplete = "off",
  } = props;

  const [isSecure, setIsSecure] = useState<boolean | undefined>(false);

  useEffect(() => setIsSecure(secureTextEntry), []);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label]}>{label}</Text> : null}
      <TextInput
        ref={ref}
        value={value}
        editable={!disabled}
        multiline={multiline}
        secureTextEntry={isSecure || false}
        selectTextOnFocus={selectTextOnFocus}
        placeholder={placeholder}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onBlur={onBlur}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        style={[styles.input, error && styles.error]}
      />

      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 10,
  },
  label: {},
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    fontSize: 18,
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: "#fff",

    // shadowOffset: { width: 0, height: 2 },
    // shadowColor: "#000",
    // shadowOpacity: 0.8,
    // shadowRadius: 2,
    // elevation: 5,
  },
  error: {
    borderColor: "red",
  },
});
