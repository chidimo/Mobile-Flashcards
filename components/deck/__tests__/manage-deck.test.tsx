import { act, create } from "react-test-renderer";

import { ManageDeck } from "../manage-deck";

const mockResetScore = jest.fn();
const mockArchive = jest.fn();
const mockUnarchive = jest.fn();
let mockArchived = false;

jest.mock("@react-native-vector-icons/feather", () => () => null);
jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useGlobalSearchParams: () => ({ deckId: "d1" }),
}));
jest.mock("@/lib/share-deck", () => ({ shareDeckFile: jest.fn() }));
jest.mock("../edit-deck", () => ({ EditDeck: () => null }));
jest.mock("@/context/app-context", () => ({
  useFlash: () => ({
    getDeckById: () => ({
      id: "d1",
      title: "Spanish",
      questions: [],
      isArchived: mockArchived,
    }),
    archiveDeck: (...args: unknown[]) => mockArchive(...args),
    unarchiveDeck: (...args: unknown[]) => mockUnarchive(...args),
    deleteDeck: jest.fn(),
    resetScore: (...args: unknown[]) => mockResetScore(...args),
  }),
}));

const render = () => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<ManageDeck />);
  });
  return (label: string) =>
    tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel === label &&
        typeof node.type !== "string",
    )[0];
};

beforeEach(() => {
  mockResetScore.mockReset();
  mockArchive.mockReset();
  mockUnarchive.mockReset();
  mockArchived = false;
});

describe("ManageDeck reset scoreboard", () => {
  it("asks first and clears nothing yet", () => {
    const byLabel = render();

    act(() => byLabel("Reset scoreboard").props.onPress());

    expect(mockResetScore).not.toHaveBeenCalled();
    expect(byLabel("Reset")).toBeDefined();
  });

  it("clears the scores once confirmed", () => {
    const byLabel = render();

    act(() => byLabel("Reset scoreboard").props.onPress());
    act(() => byLabel("Reset").props.onPress());

    expect(mockResetScore).toHaveBeenCalledWith("d1");
  });

  it("keeps the scores when cancelled", () => {
    const byLabel = render();

    act(() => byLabel("Reset scoreboard").props.onPress());
    act(() => byLabel("Cancel").props.onPress());

    expect(mockResetScore).not.toHaveBeenCalled();
  });
});

describe("ManageDeck archive", () => {
  it("archives an active deck", () => {
    const byLabel = render();

    act(() => byLabel("Archive deck").props.onPress());

    expect(mockArchive).toHaveBeenCalledWith("d1");
  });

  it("offers Unarchive instead for an archived deck", () => {
    mockArchived = true;
    const byLabel = render();

    expect(byLabel("Archive deck")).toBeUndefined();
    act(() => byLabel("Unarchive deck").props.onPress());

    expect(mockUnarchive).toHaveBeenCalledWith("d1");
  });
});
