import { Text, View } from "react-native";
import { DefaultButton } from "../form-elements/button";
import { router } from "expo-router";

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
      <Text style={{marginBottom : 30}}>There are no cards on this deck yet</Text>
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
