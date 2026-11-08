import { act, create } from "react-test-renderer";

import { CardListItem } from "../card-list-item";

const mockPush = jest.fn();
const mockDeleteCard = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: (path: string) => mockPush(path) },
}));
jest.mock("@/context/app-context", () => ({
  useFlash: () => ({
    deleteCard: (...args: unknown[]) => mockDeleteCard(...args),
  }),
}));

const render = () => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <CardListItem
        index={0}
        deckId="d1"
        question={{ id: "q1", question: "Hola?", answer: "Hello" }}
      />,
    );
  });
  return (label: string) =>
    tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel === label &&
        typeof node.type !== "string",
    )[0];
};

beforeEach(() => {
  mockPush.mockReset();
  mockDeleteCard.mockReset();
});

describe("CardListItem", () => {
  it("opens the edit screen for this card", () => {
    const byLabel = render();

    act(() => byLabel("Edit card 1").props.onPress());

    expect(mockPush).toHaveBeenCalledWith("/d1/edit-card?cardId=q1");
  });

  it("deletes this card", () => {
    const byLabel = render();

    act(() => byLabel("Delete card 1").props.onPress());

    expect(mockDeleteCard).toHaveBeenCalledWith("d1", "q1");
  });
});
