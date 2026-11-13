import { act, create } from "react-test-renderer";

import { SearchScreen } from "../search-screen";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
}));
jest.mock("@react-native-vector-icons/feather", () => () => null);
jest.mock("@/context/app-context", () => ({
  useFlash: () => ({
    deckOfCards: [
      {
        id: "d1",
        title: "Spanish",
        passMark: 50,
        addedOn: "",
        questions: [{ id: "q1", question: "Hello", answer: "Hola" }],
      },
    ],
    archivedDecks: [
      {
        id: "d2",
        title: "Old French",
        passMark: 50,
        addedOn: "",
        isArchived: true,
        questions: [{ id: "q2", question: "Hello", answer: "Bonjour" }],
      },
    ],
  }),
}));

const render = () => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<SearchScreen />);
  });
  const byLabel = (label: string) =>
    tree.root.findAll(
      (n) => n.props.accessibilityLabel === label && typeof n.type !== "string",
    )[0];
  const type = (text: string) =>
    act(() => byLabel("Search decks and cards").props.onChangeText(text));
  return { byLabel, type, tree };
};

beforeEach(() => mockPush.mockReset());

describe("SearchScreen", () => {
  it("lists nothing until something is typed", () => {
    const { byLabel } = render();
    expect(byLabel("Open Spanish")).toBeUndefined();
  });

  it("finds cards in active and archived decks", () => {
    const { byLabel, type } = render();
    type("hello");
    expect(byLabel("Open Spanish")).toBeDefined();
    expect(byLabel("Open Old French")).toBeDefined();
  });

  it("opens the matching card for editing", () => {
    const { byLabel, type } = render();
    type("bonjour");
    act(() => byLabel("Open card Hello").props.onPress());
    expect(mockPush).toHaveBeenCalledWith("/d2/edit-card?cardId=q2");
  });

  it("says when nothing matches", () => {
    const { type, tree } = render();
    type("zzz");
    expect(JSON.stringify(tree.toJSON())).toContain("No matches");
  });
});
