import { act, create } from "react-test-renderer";

import { Button } from "../button";

// nativewind wraps Pressable, so find the button by its props like a user would
const buttonOf = (tree: ReturnType<typeof create>) =>
  tree.root.findAll(
    (node) =>
      node.props.accessibilityRole === "button" &&
      typeof node.type !== "string",
  )[0];

const render = (props: Partial<React.ComponentProps<typeof Button>> = {}) => {
  const onPress = jest.fn();
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<Button title="Save deck" onPress={onPress} {...props} />);
  });
  return { tree, onPress };
};

describe("Button", () => {
  it("calls onPress", () => {
    const { tree, onPress } = render();
    act(() => buttonOf(tree).props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is disabled while loading", () => {
    const { tree } = render({ loading: true });
    expect(buttonOf(tree).props.disabled).toBe(true);
  });

  it("is disabled when told so", () => {
    const { tree } = render({ disabled: true });
    expect(buttonOf(tree).props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it("shows the title", () => {
    const { tree } = render();
    expect(JSON.stringify(tree.toJSON())).toContain("Save deck");
  });
});
