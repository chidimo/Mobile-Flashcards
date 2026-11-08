import { useAppTheme } from "@/hooks/use-app-theme";
import { Text, View } from "react-native";

interface Props {
  message: string;
}

export const NotAvailableMessage = (props: Props) => {
  const { primary } = useAppTheme();
  return (
    <View>
      <Text style={{ marginBottom: 20, fontSize: 18, color: primary }}>
        {props.message}
      </Text>
    </View>
  );
};
