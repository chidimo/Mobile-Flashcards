import * as React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  title: string | React.ReactNode;
  visible: boolean;
  modalBehavior?: "slide-from-bottom" | "fade-into-view";
  onRequestClose: () => void;
};

export const DefaultModal = (props: React.PropsWithChildren<Props>) => {
  const {
    title,
    children,
    visible,
    onRequestClose,
    modalBehavior = "slide-from-bottom",
  } = props;

  const modalViewStyle =
    modalBehavior === "slide-from-bottom"
      ? {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }
      : { borderRadius: 10, paddingVertical: 20 };

  return (
    <View>
      <Modal
        animationType="slide"
        visible={visible}
        onRequestClose={onRequestClose}
        transparent
      >
        <View
          style={[
            styles.innerCenter,
            {
              justifyContent:
                modalBehavior === "slide-from-bottom" ? "flex-end" : "center",
            },
          ]}
        >
          <View style={[styles.modalView, modalViewStyle]}>
            <View style={styles.titleContainer}>
              <View style={{ width: "89%" }}>
                {typeof title === "string" ? (
                  <Text style={[styles.title]}>{title}</Text>
                ) : (
                  title
                )}
              </View>
              <Pressable onPress={onRequestClose}>
                <MaterialIcons name="close" size={40} color="black" />
              </Pressable>
            </View>
            <ScrollView>{children}</ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  innerCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalView: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
