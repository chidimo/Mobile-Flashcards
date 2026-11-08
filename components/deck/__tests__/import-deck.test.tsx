import { Share } from "react-native";
import { act, create } from "react-test-renderer";

import { deckPrompt } from "@/lib/ai-prompt";
import { DeckFromClipboard } from "../deck-from-clipboard";

const mockImportDeck = jest.fn();
const mockReplace = jest.fn();
const mockCopy = jest.fn();
let mockCopyWorks = true;
const mockShare = jest.fn();
const mockNotify = jest.fn();
let mockClipboard = "";

jest.mock("@/context/app-context", () => ({
  useFlash: () => ({ importDeck: mockImportDeck, deckNames: [] }),
}));
jest.mock("@/hooks/use-clipboard", () => ({
  useClipboard: () => ({
    copyToClipboard: async (text: string) => {
      mockCopy(text);
      return mockCopyWorks;
    },
    fetchCopiedText: async (onCopy: (text: string) => void) =>
      onCopy(mockClipboard),
  }),
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "generated-id" }));
jest.mock("expo-router", () => ({
  router: { replace: (path: string) => mockReplace(path) },
}));
jest.mock("../../notifier", () => ({
  showNotification: (...args: unknown[]) => mockNotify(...args),
}));

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
  mockCopy.mockReset();
  mockShare.mockReset();
  mockCopyWorks = true;
  jest.spyOn(Share, "share").mockImplementation((content) => {
    mockShare(content);
    return Promise.resolve({ action: "dismissedAction" } as never);
  });
  mockNotify.mockReset();
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

    await act(async () => button("Paste from clipboard").props.onPress());

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

    await act(async () => button("Paste from clipboard").props.onPress());
    await act(async () => button("Import deck").props.onPress());

    const savedId = mockImportDeck.mock.calls[0][0];
    expect(savedId).toBe("generated-id");
    expect(mockReplace).toHaveBeenCalledWith(`/${savedId}`);
  });

  it("explains when the clipboard isn't JSON", async () => {
    mockClipboard = "just some text";
    const { button, text } = render();

    await act(async () => button("Paste from clipboard").props.onPress());

    expect(text()).toContain("isn't valid JSON");
    expect(button("Import deck").props.disabled).toBe(true);
  });

  it("rejects JSON that isn't a deck", async () => {
    mockClipboard = JSON.stringify({ hello: "world" });
    const { button, text } = render();

    await act(async () => button("Paste from clipboard").props.onPress());

    expect(text()).toContain("isn't a flashcard deck");
  });

  it("cancels without importing", () => {
    const { button, onCancel } = render();

    act(() => button("Cancel").props.onPress());

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(mockImportDeck).not.toHaveBeenCalled();
  });

  it("copies the AI prompt and says so", async () => {
    const { button } = render();

    await act(async () => button("Copy AI prompt").props.onPress());

    expect(mockCopy).toHaveBeenCalledWith(deckPrompt);
    expect(mockNotify).toHaveBeenCalledWith(
      "Prompt copied",
      expect.stringContaining("Paste"),
    );
  });

  it("hides the AI prompt once a deck is loaded", async () => {
    mockClipboard = JSON.stringify(deck);
    const { button, text } = render();
    expect(text()).toContain("Make a deck with AI");

    await act(async () => button("Paste from clipboard").props.onPress());

    expect(text()).not.toContain("Make a deck with AI");
  });

  it("falls back to the share sheet when the clipboard didn't take the prompt", async () => {
    mockCopyWorks = false;
    const { button } = render();

    await act(async () => button("Copy AI prompt").props.onPress());

    expect(mockNotify).toHaveBeenCalledWith(
      "Couldn't copy",
      expect.stringContaining("share sheet"),
    );
    expect(mockShare).toHaveBeenCalledWith({ message: deckPrompt });
  });

  it("does not open the share sheet when the copy worked", async () => {
    const { button } = render();

    await act(async () => button("Copy AI prompt").props.onPress());

    expect(mockShare).not.toHaveBeenCalled();
  });
});
