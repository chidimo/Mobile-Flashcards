import { Text, View } from "react-native";

interface Props {
  message: string;
}

export const NotAvailableMessage = (props: Props) => {
  return (
    <View>
      <Text style={{ marginBottom: 20, fontSize: 18, color: "purple" }}>
        {props.message}
      </Text>
    </View>
  );
};
