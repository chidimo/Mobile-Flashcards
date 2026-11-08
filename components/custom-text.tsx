import { useAppTheme } from "@/hooks/use-app-theme";
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
  const { primary } = useAppTheme();
  return (
    <View style={[{ flexDirection: "row", width: "100%" }, moreContainerStyle]}>
      <Text
        style={[
          isHeader
            ? { fontSize: 24, fontWeight: "bold" }
            : { fontSize: 16, fontWeight: "normal" },
          { flex: 1, color: primary, width: '50%' },
          moreTextStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};
