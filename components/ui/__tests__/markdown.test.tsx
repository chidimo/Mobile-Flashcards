import { StyleSheet, Text, useColorScheme } from "react-native";
import { act, create } from "react-test-renderer";

import { Markdown } from "../markdown";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const css = "```css\n.box {\n  display: flex;\n}\n```";

const codeTokenColors = (scheme: "light" | "dark") => {
  (useColorScheme as jest.Mock).mockReturnValue(scheme);
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<Markdown>{css}</Markdown>);
  });
  return tree.root
    .findAll((node) => (node.type as unknown) === Text)
    .filter((node) => StyleSheet.flatten(node.props.style)?.lineHeight === 19)
    .map((node) => StyleSheet.flatten(node.props.style)?.color);
};

describe("Markdown code blocks", () => {
  it.each(["light", "dark"] as const)(
    "gives every code token a colour in %s mode",
    (scheme) => {
      const colors = codeTokenColors(scheme);
      expect(colors.length).toBeGreaterThan(0);
      expect(colors.every(Boolean)).toBe(true);
    },
  );
});
