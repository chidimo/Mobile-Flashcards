import { Text, View } from "react-native";
import { DefaultModal } from "../modal";
import { Button } from "./button";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  /** Label of the destructive button. */
  confirmTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Asks before something is deleted; cancelling (or closing the sheet) leaves it alone. */
export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmTitle = "Delete",
  onConfirm,
  onCancel,
}: Props) => (
  <DefaultModal visible={visible} title={title} onRequestClose={onCancel}>
    <View className="gap-6 pb-10">
      <Text className="text-base text-neutral-700 dark:text-neutral-200">
        {message}
      </Text>
      <View className="flex-row gap-3">
        <Button
          title="Cancel"
          variant="outline"
          className="flex-1"
          onPress={onCancel}
        />
        <Button
          title={confirmTitle}
          variant="danger"
          className="flex-1"
          onPress={onConfirm}
        />
      </View>
    </View>
  </DefaultModal>
);
