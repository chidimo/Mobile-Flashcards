import { act, create } from "react-test-renderer";

import { EditCard } from "../edit-card";

const mockUpdateCard = jest.fn();
const mockPush = jest.fn();
let mockParams: Record<string, string> = {};
let mockQuestion: object | null = null;

jest.mock("expo-router", () => ({
  router: { push: (path: string) => mockPush(path) },
  useGlobalSearchParams: () => mockParams,
}));
// The real icon loads a font asynchronously and logs after the test has finished.
jest.mock("@react-native-vector-icons/feather", () => () => null);
jest.mock("@/context/app-context", () => ({
  useFlash: () => ({
    getDeckById: () => ({ id: "d1", title: "Deck 1", questions: [] }),
    getQuestionById: () => mockQuestion,
    updateCard: (...args: unknown[]) => mockUpdateCard(...args),
  }),
}));

const render = () => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<EditCard />);
  });
  // nativewind wraps the components, so find them by label like a user would
  const byLabel = (label: string) =>
    tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel === label &&
        typeof node.type !== "string",
    )[0];
  const text = () => JSON.stringify(tree.toJSON());
  return { byLabel, text };
};

beforeEach(() => {
  mockUpdateCard.mockReset();
  mockPush.mockReset();
  mockParams = { deckId: "d1", cardId: "q1" };
  mockQuestion = {
    id: "q1",
    question: "Hola?",
    answer: "Hello",
    hint: "Greeting",
  };
});

describe("EditCard", () => {
  it("starts with the card's current text", () => {
    const { byLabel } = render();

    expect(byLabel("Question").props.value).toBe("Hola?");
    expect(byLabel("Answer").props.value).toBe("Hello");
    expect(byLabel("Hint (optional)").props.value).toBe("Greeting");
  });

  it("saves the changes to that card and goes back to the deck", async () => {
    const { byLabel } = render();

    await act(async () => {
      byLabel("Question").props.onChangeText("Adios?");
    });
    await act(async () => {
      await byLabel("Save changes").props.onPress();
    });

    expect(mockUpdateCard).toHaveBeenCalledWith(
      "d1",
      "q1",
      "Adios?",
      "Hello",
      "Greeting",
    );
    expect(mockPush).toHaveBeenCalledWith("/d1");
  });

  it("won't save a card with an empty question", async () => {
    const { byLabel, text } = render();

    await act(async () => {
      byLabel("Question").props.onChangeText("");
    });
    await act(async () => {
      await byLabel("Save changes").props.onPress();
    });

    expect(text()).toContain("Question is required");
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  it("leaves the card alone on cancel", () => {
    const { byLabel } = render();

    act(() => byLabel("Cancel").props.onPress());

    expect(mockUpdateCard).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/d1");
  });

  it("says so when the card no longer exists", () => {
    mockQuestion = null;
    const { text, byLabel } = render();

    expect(text()).toContain("Card not found");

    act(() => byLabel("Back to cards").props.onPress());
    expect(mockPush).toHaveBeenCalledWith("/d1");
  });
});
