import { act, create } from "react-test-renderer";

import { DeckFromFile } from "../deck-from-file";

const mockImportDeck = jest.fn();
const mockReplace = jest.fn();
let mockPicked: {
  canceled: boolean;
  result: { text: () => Promise<string> } | null;
} = {
  canceled: true,
  result: null,
};

// The real icon loads a font asynchronously and logs after the test has finished.
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("expo-file-system", () => ({
  File: { pickFileAsync: async () => mockPicked },
}));
jest.mock("expo-router", () => ({
  router: { replace: (path: string) => mockReplace(path) },
}));
jest.mock("@/context/app-context", () => ({
  useFlash: () => ({ importDeck: mockImportDeck, deckNames: [] }),
}));
jest.mock("expo-crypto", () => ({ randomUUID: () => "generated-id" }));
jest.mock("../../notifier", () => ({ showNotification: jest.fn() }));

const deck = {
  id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  title: "Spanish",
  passMark: 70,
  questions: [
    { id: "q1", question: "Hola?", answer: "Hello", hint: "Greeting" },
  ],
};

const pickFile = (text: string) => {
  mockPicked = { canceled: false, result: { text: async () => text } };
};

const render = () => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<DeckFromFile onCancel={jest.fn()} />);
  });
  const button = (label: string) =>
    tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel === label &&
        node.props.accessibilityRole === "button" &&
        typeof node.type !== "string",
    )[0];
  const text = () => JSON.stringify(tree.toJSON());
  return { button, text };
};

beforeEach(() => {
  mockImportDeck.mockReset();
  mockReplace.mockReset();
  mockPicked = { canceled: true, result: null };
});

describe("DeckFromFile", () => {
  it("previews a chosen deck file and imports it, hints included", async () => {
    pickFile(JSON.stringify(deck));
    const { button, text } = render();

    await act(async () => button("Choose file").props.onPress());

    expect(text()).toContain("1 card ready to import");
    expect(text()).toContain("Hola?");

    await act(async () => button("Import deck").props.onPress());

    expect(mockImportDeck).toHaveBeenCalledWith(deck.id, "Spanish", 70, [
      {
        id: "generated-id",
        question: "Hola?",
        answer: "Hello",
        hint: "Greeting",
      },
    ]);
    expect(mockReplace).toHaveBeenCalledWith(`/${deck.id}`);
  });

  it("does nothing when the picker is cancelled", async () => {
    const { button, text } = render();

    await act(async () => button("Choose file").props.onPress());

    expect(text()).not.toContain("ready to import");
    expect(button("Import deck").props.disabled).toBe(true);
  });

  it("explains a file that isn't a deck", async () => {
    pickFile(JSON.stringify({ hello: "world" }));
    const { button, text } = render();

    await act(async () => button("Choose file").props.onPress());

    expect(text()).toContain("isn't a flashcard deck");
    expect(button("Import deck").props.disabled).toBe(true);
  });

  it("explains a file that isn't JSON", async () => {
    pickFile("just words");
    const { button, text } = render();

    await act(async () => button("Choose file").props.onPress());

    expect(text()).toContain("isn't valid JSON");
  });
});
