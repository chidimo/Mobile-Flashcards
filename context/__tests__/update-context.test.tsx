import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import { act, create } from "react-test-renderer";

import { updateCheckedAtKey, updateDismissedKey } from "@/constants";
import { checkForUpdate } from "@/lib/app-update";
import { UpdateProvider, useUpdate } from "../update-context";

jest.mock("@/lib/app-update", () => ({ checkForUpdate: jest.fn() }));

const check = checkForUpdate as jest.Mock;
const store = { version: "9.9.9", storeUrl: "https://apps.apple.com/app/id1" };

const setup = () => {
  const ref: { current: ReturnType<typeof useUpdate> | null } = {
    current: null,
  };
  const Probe = () => {
    ref.current = useUpdate();
    return null;
  };
  act(() => {
    create(
      <UpdateProvider>
        <Probe />
      </UpdateProvider>,
    );
  });
  return () => ref.current!;
};

beforeEach(async () => {
  check.mockReset();
  await AsyncStorage.clear();
});

describe("update context", () => {
  it("opens the prompt when a manual check finds a newer version", async () => {
    check.mockResolvedValue(store);
    const update = setup();

    await act(async () => update().checkNow());

    expect(update().status).toBe("available");
    expect(update().promptVisible).toBe(true);
    expect(update().update).toEqual(store);
  });

  it("reports when the app is current", async () => {
    check.mockResolvedValue(null);
    const update = setup();

    await act(async () => update().checkNow());

    expect(update().status).toBe("current");
    expect(update().promptVisible).toBe(false);
  });

  it("reports a failed check without opening the prompt", async () => {
    check.mockRejectedValue(new Error("offline"));
    const update = setup();

    await act(async () => update().checkNow());

    expect(update().status).toBe("error");
    expect(update().promptVisible).toBe(false);
  });

  it("remembers the version the user postponed", async () => {
    check.mockResolvedValue(store);
    const update = setup();
    await act(async () => update().checkNow());

    act(() => update().postpone());

    expect(update().promptVisible).toBe(false);
    await expect(AsyncStorage.getItem(updateDismissedKey)).resolves.toBe(
      '"9.9.9"',
    );
  });

  it("opens the store when the user chooses Update", async () => {
    check.mockResolvedValue(store);
    const open = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(undefined as never);
    const update = setup();
    await act(async () => update().checkNow());

    act(() => update().openStore());

    expect(open).toHaveBeenCalledWith(store.storeUrl);
    expect(update().promptVisible).toBe(false);
  });

  it("records when the last check happened", async () => {
    check.mockResolvedValue(null);
    const update = setup();

    await act(async () => update().checkNow());

    const stored = await AsyncStorage.getItem(updateCheckedAtKey);
    expect(Date.parse(JSON.parse(stored!))).toBeGreaterThan(Date.now() - 5000);
  });
});
