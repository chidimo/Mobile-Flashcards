import { useFlash } from "@/context/app-context";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { router, useGlobalSearchParams } from "expo-router";
import { Text, View, Share, Alert, ScrollView } from "react-native";
import { EditDeck } from "./edit-deck";
import { DefaultModal } from "../modal";
import { useOnOffSwitch } from "@/hooks/use-on-off-switch";
import { DefaultButton } from "../form-elements/button";
import { primaryTextColor, pageContainerStyle, primaryBgColor } from "@/styles";
import { CustomText } from "../custom-text";
import { useState } from "react";
import { Deck } from "@/types/generic";

const Parent = ({
  children,
  deck,
}: {
  children: React.ReactNode;
  deck: Deck | null;
}) => {
  const {
    isOn: deleteOpen,
    setOn: onDeleteOpen,
    setOff: onDeleteClose,
  } = useOnOffSwitch();
  const { deleteDeck } = useFlash();

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
        { justifyContent: "flex-start" },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <CustomText
          text={`Manage ${deck?.title} deck`}
          isHeader
          moreContainerStyle={{ width: "80%", alignItems: "flex-start" }}
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DefaultButton
            title={<MaterialIcons name="share" size={30} color="blue" />}
            onPress={onShare}
            moreContainerStyle={{
              marginRight: 10,
              backgroundColor: primaryBgColor,
            }}
          />
          <DefaultButton
            moreContainerStyle={{ backgroundColor: primaryBgColor }}
            onPress={onDeleteOpen}
            title={<AntDesign name="delete" size={30} color="red" />}
          />
        </View>
      </View>

      <ScrollView style={{ width: "100%" }}>{children}</ScrollView>

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
            <CustomText text={`Delete ${deck?.title}`} />
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
              color: primaryTextColor,
            }}
          >
            Are you sure you want to delete this deck and all its cards
          </Text>
          <DefaultButton
            moreContainerStyle={{ width: "50%" }}
            btnVariant="DANGER"
            title="Delete"
            onPress={() => {
              deleteDeck(deck?.id as string);
              router.replace(`/(tabs)`);
            }}
          />
        </View>
      </DefaultModal>
    </View>
  );
};

export const ManageDeck = () => {
  const { deckId } = useGlobalSearchParams();
  const { getDeckById, resetScore } = useFlash();
  const deck = getDeckById(deckId as string);

  const [isEdit, setIsEdit] = useState(false);

  if (isEdit) {
    return (
      <Parent deck={deck}>
        <EditDeck
          onCancel={() => setIsEdit(false)}
          onSuccess={() => setIsEdit(false)}
        />
      </Parent>
    );
  }

  return (
    <Parent deck={deck}>
      <DefaultButton
        moreContainerStyle={{
          width: "100%",
          marginTop: 20,
        }}
        btnVariant="SUCCESS"
        title="Edit deck"
        onPress={() => {
          setIsEdit(true);
        }}
      />

      <DefaultButton
        moreContainerStyle={{
          width: "100%",
          marginTop: 20,
        }}
        btnVariant="SUCCESS"
        title="Reset scoreboard"
        onPress={() => {
          resetScore(deckId as string);
        }}
      />
    </Parent>
  );
};
