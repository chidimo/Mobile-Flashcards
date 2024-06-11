import { useFlash } from "@/context/app-context";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router, useGlobalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { EditDeck } from "./edit-deck";
import { DefaultModal } from "../modal";
import { useOnOffSwitch } from "@/hooks/use-on-off-switch";
import { DefaultButton } from "../form-elements/button";
import { sharedStyles } from "@/styles";
import { useClipboard } from "@/hooks/use-clipboard";
import { showNotification } from "../notifier";

export const ManageDeck = () => {
  const { deckId } = useGlobalSearchParams();
  const { deleteDeck, getDeckById } = useFlash();
  const deck = getDeckById(deckId as string);
  const { copyToClipboard } = useClipboard();

  const {
    isOn: deleteOpen,
    setOn: onDeleteOpen,
    setOff: onDeleteClose,
  } = useOnOffSwitch();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <Text
          style={[
            sharedStyles.headingText,
            { width: "80%", textAlign: "left" },
          ]}
        >
          Manage {deck?.title} deck
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => {
              copyToClipboard(JSON.stringify(deck));
              showNotification("Success", "Deck copied successfully!");
            }}
          >
            <MaterialIcons name="content-copy" size={30} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDeleteOpen}>
            <AntDesign name="delete" size={30} color={"red"} />
          </TouchableOpacity>
        </View>
      </View>

      <EditDeck />

      <DefaultModal
        visible={deleteOpen}
        title={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>
              <AntDesign name="warning" size={24} color="red" />
            </Text>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginLeft: 5 }}>
              Delete deck
            </Text>
          </View>
        }
        onRequestClose={onDeleteClose}
      >
        <View style={{ flex: 1, alignItems: "center", paddingBottom: 50 }}>
          <Text style={{ marginBottom: 50, fontSize: 18, textAlign: "center" }}>
            Are you sure you want to delete this deck and all its cards
          </Text>
          <DefaultButton
            moreContainerStyle={{ width: "50%" }}
            btnVariant="DANGER"
            title="Delete deck"
            onPress={() => {
              deleteDeck(deckId as string);
              router.replace(`/(tabs)`);
            }}
          />
        </View>
      </DefaultModal>
    </View>
  );
};