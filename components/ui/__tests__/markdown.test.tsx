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

const flatStyle = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as never) as Record<string, unknown>;

describe("Markdown layout", () => {
  beforeEach(() => (useColorScheme as jest.Mock).mockReturnValue("light"));

  it("keeps list text left-aligned inside a centred card", () => {
    let tree!: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <Markdown centered>{"Pick one\n\n- alpha\n- beta"}</Markdown>,
      );
    });
    const alpha = tree.root
      .findAll((node) => (node.type as unknown) === Text)
      .find((node) => node.props.children === "alpha");

    expect(flatStyle(alpha!).textAlign).toBe("left");
  });

  it("stretches code to the card's width once measured", () => {
    let tree!: ReturnType<typeof create>;
    act(() => {
      tree = create(<Markdown>{css}</Markdown>);
    });
    const onLayout = tree.root.findAll((node) => node.props.onLayout)[0].props
      .onLayout;

    act(() => onLayout({ nativeEvent: { layout: { width: 300 } } }));

    const codeViews = tree.root.findAll(
      (node) => flatStyle(node)?.minWidth === 298,
    );
    expect(codeViews.length).toBeGreaterThan(0);
  });
});
