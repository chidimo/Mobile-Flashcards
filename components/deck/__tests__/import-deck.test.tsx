import { act, create } from "react-test-renderer";

import { DeckFromClipboard } from "../deck-from-clipboard";

const mockImportDeck = jest.fn();
const mockReplace = jest.fn();
let mockClipboard = "";

jest.mock("@/context/app-context", () => ({
  useFlash: () => ({ importDeck: mockImportDeck, deckNames: [] }),
}));
jest.mock("@/hooks/use-clipboard", () => ({
  useClipboard: () => ({
    fetchCopiedText: async (onCopy: (text: string) => void) =>
      onCopy(mockClipboard),
  }),
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "generated-id" }));
jest.mock("expo-router", () => ({
  router: { replace: (path: string) => mockReplace(path) },
}));
jest.mock("../../notifier", () => ({ showNotification: jest.fn() }));

const deck = {
  id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  title: "Spanish",
  passMark: 70,
  questions: [
    { id: "q1", question: "Hola?", answer: "Hello" },
    { id: "q2", question: "Adios?", answer: "Goodbye" },
  ],
};

const render = () => {
  const onSuccess = jest.fn();
  const onCancel = jest.fn();
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <DeckFromClipboard onSuccess={onSuccess} onCancel={onCancel} />,
    );
  });
  // nativewind wraps the components, so find by role/label like a user would
  const button = (label: string) =>
    tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel === label &&
        node.props.accessibilityRole === "button" &&
        typeof node.type !== "string",
    )[0];
  const text = () => JSON.stringify(tree.toJSON());
  return { tree, button, text, onSuccess, onCancel };
};

beforeEach(() => {
  mockImportDeck.mockReset();
  mockReplace.mockReset();
  mockClipboard = "";
});

describe("ImportDeck", () => {
  it("can't import until a deck is pasted", () => {
    const { button } = render();

    expect(button("Import deck").props.disabled).toBe(true);
  });

  it("previews a pasted deck and imports it", async () => {
    mockClipboard = JSON.stringify(deck);
    const { button, text, onSuccess } = render();

    await act(async () => button("Paste import string").props.onPress());

    expect(text()).toContain("2 cards ready to import");
    expect(text()).toContain("Hola?");
    expect(button("Import deck").props.disabled).toBe(false);

    await act(async () => button("Import deck").props.onPress());

    expect(mockImportDeck).toHaveBeenCalledWith(deck.id, "Spanish", 70, [
      { id: "generated-id", question: "Hola?", answer: "Hello" },
      { id: "generated-id", question: "Adios?", answer: "Goodbye" },
    ]);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(`/${deck.id}`);
  });

  it("opens the imported deck under the id it was saved with", async () => {
    mockClipboard = JSON.stringify({ ...deck, id: "not-a-uuid" });
    const { button } = render();

    await act(async () => button("Paste import string").props.onPress());
    await act(async () => button("Import deck").props.onPress());

    const savedId = mockImportDeck.mock.calls[0][0];
    expect(savedId).toBe("generated-id");
    expect(mockReplace).toHaveBeenCalledWith(`/${savedId}`);
  });

  it("explains when the clipboard doesn't hold a deck", async () => {
    mockClipboard = "just some text";
    const { button, text } = render();

    await act(async () => button("Paste import string").props.onPress());

    expect(text()).toContain("doesn't hold a deck");
    expect(button("Import deck").props.disabled).toBe(true);
  });

  it("rejects JSON that isn't a deck", async () => {
    mockClipboard = JSON.stringify({ hello: "world" });
    const { button, text } = render();

    await act(async () => button("Paste import string").props.onPress());

    expect(text()).toContain("isn't a valid deck");
  });

  it("cancels without importing", () => {
    const { button, onCancel } = render();

    act(() => button("Cancel").props.onPress());

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(mockImportDeck).not.toHaveBeenCalled();
  });
});
