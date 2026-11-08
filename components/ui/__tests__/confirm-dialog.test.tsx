import { act, create } from "react-test-renderer";

import { ConfirmDialog } from "../confirm-dialog";

jest.mock("@react-native-vector-icons/feather", () => () => null);

const render = (visible = true) => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <ConfirmDialog
        visible={visible}
        title="Delete deck?"
        message="You can't undo this."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
  });
  const byLabel = (label: string) =>
    tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel === label &&
        typeof node.type !== "string",
    )[0];
  const text = () => JSON.stringify(tree.toJSON());
  return { byLabel, text, onConfirm, onCancel };
};

describe("ConfirmDialog", () => {
  it("shows the title and message", () => {
    const { text } = render();

    expect(text()).toContain("Delete deck?");
    expect(text()).toContain("You can't undo this.");
  });

  it("confirms with the destructive button", () => {
    const { byLabel, onConfirm, onCancel } = render();

    act(() => byLabel("Delete").props.onPress());

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("cancels without confirming", () => {
    const { byLabel, onConfirm, onCancel } = render();

    act(() => byLabel("Cancel").props.onPress());

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows nothing while hidden", () => {
    const { text } = render(false);

    expect(text()).not.toContain("Delete deck?");
  });
});
