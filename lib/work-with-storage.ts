import AsyncStorage from "@react-native-async-storage/async-storage";

type Value = string | Record<any, any>;

export const setItemToStorage = async (value: Value, key: string) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving", e);
  }
};

export const getItemFromStorage = async <T>(
  key: string,
  onSuccess: (value: T) => void
) => {
  try {
    const data = await AsyncStorage.getItem(key);
    if (data !== null) {
      onSuccess(JSON.parse(data));
    }
  } catch (e) {
    console.error("Error reading", e);
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {}
};
