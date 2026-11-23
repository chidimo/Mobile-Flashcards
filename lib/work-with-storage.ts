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
  onSuccess: (value: T) => void,
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

/** Reads and parses a stored value, or null when nothing is stored (or it can't be read). */
export const readFromStorage = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data === null ? null : (JSON.parse(data) as T);
  } catch (e) {
    console.error("Error reading", e);
    return null;
  }
};

export const removeFromStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Error removing", e);
  }
};
