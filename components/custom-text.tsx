import { primaryTextColor } from "@/styles";
import { Text, View, StyleProp, TextStyle, ViewStyle } from "react-native";

type Props = {
  text: string;
  isHeader?: boolean;
  moreTextStyle?: StyleProp<TextStyle>;
  moreContainerStyle?: StyleProp<ViewStyle>;
};

export const CustomText = ({
  text,
  isHeader,
  moreTextStyle = {},
  moreContainerStyle = {},
}: Props) => {
  return (
    <View style={[{ flexDirection: "row", width: "100%" }, moreContainerStyle]}>
      <Text
        style={[
          isHeader
            ? { fontSize: 28, fontWeight: "bold" }
            : { fontSize: 16, fontWeight: "normal" },
          { flex: 1, color: primaryTextColor },
          moreTextStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};
