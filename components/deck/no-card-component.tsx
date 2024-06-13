import { View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { NotAvailableMessage } from "./not-available-message";

interface Props {
  onPress: () => void;
}

export const NoCardComponent = (props: Props) => {
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <NotAvailableMessage message="There are no cards on this deck yet" />
      <DefaultButton
        moreContainerStyle={{ width: "60%" }}
        btnVariant="SUCCESS"
        title="Add your first card "
        onPress={props.onPress}
      />
    </View>
  );
};
