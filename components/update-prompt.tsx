import { useUpdate } from "@/context/update-context";
import { Text, View } from "react-native";
import { DefaultModal } from "./modal";
import { Button } from "./ui/button";

/** The "a new version is out" dialog; shown when the update context says so. */
export const UpdatePrompt = () => {
  const { promptVisible, update, installedVersion, postpone, openStore } =
    useUpdate();

  return (
    <DefaultModal
      visible={promptVisible && !!update}
      title="Update available"
      onRequestClose={postpone}
    >
      <View className="gap-6 pb-8">
        <Text className="text-base text-neutral-700 dark:text-neutral-200">
          Version {update?.version} is out. You&apos;re on {installedVersion}.
          Update to get the latest features and fixes.
        </Text>
        <View className="flex-row gap-3">
          <Button
            title="Later"
            variant="outline"
            className="flex-1"
            onPress={postpone}
          />
          <Button title="Update" className="flex-1" onPress={openStore} />
        </View>
      </View>
    </DefaultModal>
  );
};
