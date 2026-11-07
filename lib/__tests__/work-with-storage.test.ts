import AsyncStorage from "@react-native-async-storage/async-storage";

import { getItemFromStorage, setItemToStorage } from "../work-with-storage";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

beforeEach(() => AsyncStorage.clear());

describe("work-with-storage", () => {
  it("round-trips a value as JSON", async () => {
    await setItemToStorage({ a: 1 }, "key");
    const onSuccess = jest.fn();

    await getItemFromStorage("key", onSuccess);

    expect(onSuccess).toHaveBeenCalledWith({ a: 1 });
  });

  it("does not call back when the key is missing", async () => {
    const onSuccess = jest.fn();

    await getItemFromStorage("missing", onSuccess);

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
