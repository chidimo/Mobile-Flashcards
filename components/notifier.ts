import { Notifier, Easing } from "react-native-notifier";

export const showNotification = (title: string, description: string) => {
  Notifier.showNotification({
    title,
    description,
    // duration: 0,
    showAnimationDuration: 800,
    showEasing: Easing.bounce,
    onHidden: () => console.log("Hidden"),
    onPress: () => console.log("Press"),
    hideOnPress: false,
    translucentStatusBar: true,
  });
};
