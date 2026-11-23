import { Alert } from "react-native";
import { act, create } from "react-test-renderer";

import { BackupSection } from "../backup-section";

const mockShare = jest.fn();
const mockPick = jest.fn();
const mockImport = jest.fn();
const mockNotify = jest.fn();
let mockDecks: unknown[] = [];

jest.mock("@react-native-vector-icons/feather", () => () => null);
jest.mock("../../notifier", () => ({
  showNotification: (...args: unknown[]) => mockNotify(...args),
}));
jest.mock("@/lib/share-deck", () => ({
  shareJsonFile: (...args: unknown[]) => mockShare(...args),
}));
jest.mock("@/lib/pick-text-file", () => ({
  pickTextFile: () => mockPick(),
}));
jest.mock("@/context/app-context", () => ({
  useFlash: () => ({
    deckOfCards: mockDecks,
    archivedDecks: [],
    getScoresById: () => null,
    importBackup: (...args: unknown[]) => mockImport(...args),
  }),
}));

const render = () => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<BackupSection />);
  });
  return (label: string) =>
    tree.root.findAll(
      (n) => n.props.accessibilityLabel === label && typeof n.type !== "string",
    )[0];
};

const ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
const backupText = JSON.stringify({
  type: "flashcards-backup",
  version: 1,
  decks: [{ id: ID, title: "Spanish", passMark: 70, questions: [] }],
});

beforeEach(() => {
  [mockShare, mockPick, mockImport, mockNotify].forEach((m) => m.mockReset());
  mockDecks = [];
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("BackupSection export", () => {
  it("says so when there is nothing to export", async () => {
    const byLabel = render();

    await act(async () => byLabel("Export all decks").props.onPress());

    expect(mockShare).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Nothing to export",
      "Add a deck first.",
    );
  });

  it("shares one backup file holding every deck", async () => {
    mockDecks = [
      { id: ID, title: "Spanish", passMark: 70, addedOn: "", questions: [] },
    ];
    const byLabel = render();

    await act(async () => byLabel("Export all decks").props.onPress());

    const [fileName, content] = mockShare.mock.calls[0];
    expect(fileName).toMatch(/^flashcards-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(JSON.parse(content).decks[0].title).toBe("Spanish");
  });
});

describe("BackupSection import", () => {
  it("adds the decks and says how many", async () => {
    mockPick.mockResolvedValue(backupText);
    mockImport.mockReturnValue({ added: 1, skipped: 0 });
    const byLabel = render();

    await act(async () => byLabel("Import decks").props.onPress());

    expect(mockImport.mock.calls[0][0][0].title).toBe("Spanish");
    expect(mockNotify).toHaveBeenCalledWith("Success", "Added 1 deck.");
  });

  it("reports decks that were already here", async () => {
    mockPick.mockResolvedValue(backupText);
    mockImport.mockReturnValue({ added: 0, skipped: 1 });
    const byLabel = render();

    await act(async () => byLabel("Import decks").props.onPress());

    expect(mockNotify).toHaveBeenCalledWith(
      "Nothing new",
      "Every deck in that file is already here.",
    );
  });

  it("does nothing when the person backs out of the picker", async () => {
    mockPick.mockResolvedValue(null);
    const byLabel = render();

    await act(async () => byLabel("Import decks").props.onPress());

    expect(mockImport).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("shows why a file can't be imported", async () => {
    mockPick.mockResolvedValue('{"title":"just a deck"}');
    const byLabel = render();

    await act(async () => byLabel("Import decks").props.onPress());

    expect(mockImport).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Couldn't import",
      expect.stringContaining("isn't a Flashcards backup"),
    );
  });
});
