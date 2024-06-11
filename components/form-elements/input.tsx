import { Ref, forwardRef } from "react";
import {
  KeyboardTypeOptions,
  StyleProp,
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
  selectTextOnFocus?: boolean;

  error?: any;
  placeholder?: string;

  containerStyle?: StyleProp<ViewStyle>;

  returnKeyType?: ReturnKeyTypeOptions;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: AutoCompleteOptions;

  onBlur?: (...args: any[]) => any;
  onChangeText: (...args: any[]) => any;
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
    selectTextOnFocus,
    autoComplete = "off",
  } = props;

  return (
    <View
      style={[
        {
          width: "100%",
          marginBottom: 10,
        },
        containerStyle,
      ]}
    >
      {label ? <Text>{label}</Text> : null}
      <TextInput
        ref={ref}
        value={value}
        editable={!disabled}
        multiline={multiline}
        selectTextOnFocus={selectTextOnFocus}
        placeholder={placeholder}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onBlur={onBlur}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholderTextColor="gray"
        style={[
          {
            width: "100%",
            borderWidth: 1,
            borderRadius: 10,
            fontSize: 18,
            height: 50,
            paddingHorizontal: 10,
            backgroundColor: "#fff",
            borderColor: error ? "red" : "rgba(0,0,0,0.3)",
          },
        ]}
      />

      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
});
