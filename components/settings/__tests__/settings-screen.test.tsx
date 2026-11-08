import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import renderer, { act } from "react-test-renderer";

import { themePreferenceKey } from "@/constants";
import { ThemeProvider } from "@/context/theme-context";
import { SettingsScreen } from "../settings-screen";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const render = async () => {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <ThemeProvider>
        <SettingsScreen />
      </ThemeProvider>,
    );
  });
  return tree;
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(Appearance, "setColorScheme").mockImplementation(() => {});
});

describe("SettingsScreen", () => {
  it("applies a stored preference on mount", async () => {
    await AsyncStorage.setItem(themePreferenceKey, JSON.stringify("dark"));

    await render();

    expect(Appearance.setColorScheme).toHaveBeenCalledWith("dark");
  });

  it("switches to dark mode and persists it", async () => {
    const tree = await render();

    await act(async () => {
      tree.root
        .findByProps({ accessibilityLabel: "Dark mode" })
        .props.onValueChange(true);
    });

    expect(Appearance.setColorScheme).toHaveBeenCalledWith("dark");
    expect(await AsyncStorage.getItem(themePreferenceKey)).toBe('"dark"');
  });

  it("switches back to light mode", async () => {
    const tree = await render();

    await act(async () => {
      tree.root
        .findByProps({ accessibilityLabel: "Dark mode" })
        .props.onValueChange(false);
    });

    expect(Appearance.setColorScheme).toHaveBeenCalledWith("light");
    expect(await AsyncStorage.getItem(themePreferenceKey)).toBe('"light"');
  });
});
