import { View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { router } from "expo-router";
import { NotAvailableMessage } from "./not-available-message";

interface Props {
  deckId: string;
}

export const NoCardComponent = (props: Props) => {
  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <NotAvailableMessage message="There are no cards on this deck yet" />
      <DefaultButton
        moreContainerStyle={{ width: "70%" }}
        btnVariant="SUCCESS"
        title="Add your first card "
        onPress={() => {
          router.push(`/${props.deckId}/add-card`);
        }}
      />
    </View>
  );
};
