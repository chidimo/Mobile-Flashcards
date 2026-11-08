import { act, create } from "react-test-renderer";

import { TextField } from "../text-field";

const inputOf = (tree: ReturnType<typeof create>) =>
  tree.root.findAll(
    (node) =>
      node.props.accessibilityLabel === "Deck name" &&
      typeof node.type !== "string",
  )[0];

const render = (
  props: Partial<React.ComponentProps<typeof TextField>> = {},
) => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <TextField
        label="Deck name"
        value=""
        onChangeText={() => {}}
        {...props}
      />,
    );
  });
  return tree;
};

describe("TextField", () => {
  it("labels the input for accessibility", () => {
    const tree = render();
    const input = inputOf(tree);
    expect(input.props.accessibilityLabel).toBe("Deck name");
  });

  it("shows the error text", () => {
    const tree = render({ error: "Name is required" });
    expect(JSON.stringify(tree.toJSON())).toContain("Name is required");
  });

  it("calls through onFocus and onBlur", () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const tree = render({ onFocus, onBlur });
    const input = inputOf(tree);

    act(() => input.props.onFocus({}));
    act(() => input.props.onBlur({}));

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
