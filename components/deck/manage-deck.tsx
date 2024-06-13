import { useFlash } from "@/context/app-context";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router, useGlobalSearchParams } from "expo-router";
import { Text, View, Share, Alert } from "react-native";
import { EditDeck } from "./edit-deck";
import { DefaultModal } from "../modal";
import { useOnOffSwitch } from "@/hooks/use-on-off-switch";
import { DefaultButton } from "../form-elements/button";
import { pageContainerStyle, sharedStyles } from "@/styles";

export const ManageDeck = () => {
  const { deckId } = useGlobalSearchParams();
  const { deleteDeck, getDeckById } = useFlash();
  const deck = getDeckById(deckId as string);

  const {
    isOn: deleteOpen,
    setOn: onDeleteOpen,
    setOff: onDeleteClose,
  } = useOnOffSwitch();

  const onShare = async () => {
    try {
      await Share.share({
        message: JSON.stringify(deck),
        title: `Deck ${deck?.title}`,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <View
      style={[
        pageContainerStyle.mainPageView,
        { justifyContent: "space-evenly" },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={[sharedStyles.headerText, { width: "80%", textAlign: "left" }]}
        >
          Manage {deck?.title} deck
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DefaultButton
            title={<MaterialIcons name="share" size={30} color="#07f" />}
            moreContainerStyle={{ marginRight: 10, backgroundColor: "#fff" }}
            onPress={onShare}
          />
          <DefaultButton
            moreContainerStyle={{ backgroundColor: "#fff" }}
            onPress={onDeleteOpen}
            title={<AntDesign name="delete" size={30} color="red" />}
          />
        </View>
      </View>

      <EditDeck moreContainerStyle={{ paddingHorizontal: 0 }} />

      <DefaultModal
        visible={deleteOpen}
        title={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <Text>
              <AntDesign name="warning" size={24} color="red" />
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", marginLeft: 5 }}>
              Delete {deck?.title}
            </Text>
          </View>
        }
        onRequestClose={onDeleteClose}
      >
        <View style={{ flex: 1, alignItems: "center", paddingBottom: 50 }}>
          <Text
            style={{
              marginBottom: 50,
              fontSize: 18,
              textAlign: "center",
              color: "purple",
            }}
          >
            Are you sure you want to delete this deck and all its cards
          </Text>
          <DefaultButton
            moreContainerStyle={{ width: "50%" }}
            btnVariant="DANGER"
            title="Delete"
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
