import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, create } from "react-test-renderer";

import { flashCardKey } from "@/constants";
import { FlashProvider, useFlash } from "../app-context";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/components/notifier", () => ({ showNotification: jest.fn() }));
jest.mock("expo-crypto", () => {
  let n = 0;
  return {
    randomUUID: () =>
      `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
  };
});

const deck = (id: string, title: string) => ({
  id,
  title,
  passMark: 50,
  addedOn: "2026-01-01",
  questions: [],
});

type Flash = ReturnType<typeof useFlash>;

const setup = async (stored?: object) => {
  await AsyncStorage.clear();
  if (stored) await AsyncStorage.setItem(flashCardKey, JSON.stringify(stored));
  const ref: { current: Flash | null } = { current: null };
  const Probe = () => {
    ref.current = useFlash();
    return null;
  };
  await act(async () => {
    create(
      <FlashProvider>
        <Probe />
      </FlashProvider>,
    );
  });
  return () => ref.current as Flash;
};

const titles = (flash: Flash) => (flash.deckOfCards ?? []).map((d) => d.title);
const store = {
  flashcards: { a: deck("a", "A"), b: deck("b", "B"), c: deck("c", "C") },
  myScores: null,
};

describe("deck order", () => {
  it("lists decks in stored order when none has been saved", async () => {
    const flash = await setup(store);

    expect(titles(flash())).toEqual(["A", "B", "C"]);
  });

  it("saves a new order and uses it", async () => {
    const flash = await setup(store);

    await act(async () => flash().reorderDecks(["c", "a", "b"]));

    expect(titles(flash())).toEqual(["C", "A", "B"]);
  });

  it("remembers the order after the app restarts", async () => {
    const flash = await setup(store);
    await act(async () => flash().reorderDecks(["b", "c", "a"]));
    const saved = JSON.parse(
      (await AsyncStorage.getItem(flashCardKey)) ?? "{}",
    );

    const reloaded = await setup(saved);

    expect(titles(reloaded())).toEqual(["B", "C", "A"]);
  });

  it("puts a new deck at the end of the order", async () => {
    const flash = await setup({ ...store, deckOrder: ["c", "a", "b"] });

    await act(async () => flash().addDeck("D", 50));

    expect(titles(flash())).toEqual(["C", "A", "B", "D"]);
  });

  it("forgets a deck's place when it is deleted", async () => {
    const flash = await setup({ ...store, deckOrder: ["c", "a", "b"] });

    await act(async () => flash().deleteDeck("a"));

    expect(titles(flash())).toEqual(["C", "B"]);
    const saved = JSON.parse(
      (await AsyncStorage.getItem(flashCardKey)) ?? "{}",
    );
    expect(saved.deckOrder).toEqual(["c", "b"]);
  });
});

describe("archiving", () => {
  it("moves a deck from Home to Archived and back", async () => {
    const flash = await setup(store);

    await act(async () => flash().archiveDeck("b"));
    expect(titles(flash())).toEqual(["A", "C"]);
    expect(flash().archivedDecks.map((d) => d.title)).toEqual(["B"]);

    await act(async () => flash().unarchiveDeck("b"));
    expect(titles(flash())).toEqual(["A", "B", "C"]);
    expect(flash().archivedDecks).toEqual([]);
  });

  it("keeps a deck archived after the app restarts", async () => {
    const flash = await setup(store);
    await act(async () => flash().archiveDeck("a"));
    const saved = JSON.parse(
      (await AsyncStorage.getItem(flashCardKey)) ?? "{}",
    );

    const reloaded = await setup(saved);

    expect(reloaded().archivedDecks.map((d) => d.title)).toEqual(["A"]);
  });

  it("keeps an archived deck's cards and still finds it by id", async () => {
    const flash = await setup(store);

    await act(async () => flash().archiveDeck("c"));

    expect(flash().getDeckById("c")?.isArchived).toBe(true);
  });
});

describe("importing a backup", () => {
  const backup = (id: string, title: string) => ({
    id,
    title,
    passMark: 50,
    questions: [],
    scores: [{ numberOfQuestions: 2, actualScore: 1, date: "2026-02-02" }],
  });

  it("adds new decks with their scores and saves them", async () => {
    const flash = await setup(store);

    let result;
    await act(async () => {
      result = flash().importBackup([backup("d", "D")]);
    });

    expect(result).toEqual({ added: 1, skipped: 0 });
    expect(titles(flash())).toEqual(["A", "B", "C", "D"]);
    expect(flash().getScoresById("d")).toHaveLength(1);
    const saved = JSON.parse(
      (await AsyncStorage.getItem(flashCardKey)) ?? "{}",
    );
    expect(saved.flashcards.d.title).toBe("D");
  });

  it("skips a deck whose id is already here", async () => {
    const flash = await setup(store);

    let result;
    await act(async () => {
      result = flash().importBackup([backup("a", "Other A")]);
    });

    expect(result).toEqual({ added: 0, skipped: 1 });
    expect(titles(flash())).toEqual(["A", "B", "C"]);
  });
});

describe("sync fields", () => {
  const stamped = {
    ...store,
    flashcards: {
      a: {
        ...deck("a", "A"),
        updatedAt: "2026-01-01T00:00:00.000Z",
        questions: [{ id: "q1", question: "Q", answer: "A" }],
      },
      b: deck("b", "B"),
    },
  };
  const OLD = "2026-01-01T00:00:00.000Z";

  it("fills in updatedAt for data saved before sync", async () => {
    const flash = await setup(store);

    expect(flash().getDeckById("a")?.updatedAt).toBe("2026-01-01");
  });

  it("bumps the deck's updatedAt when its title changes", async () => {
    const flash = await setup(stamped);

    await act(async () => flash().updateDeck("a", "New", 60));

    expect(flash().getDeckById("a")?.updatedAt).not.toBe(OLD);
    expect(flash().getDeckById("b")?.updatedAt).toBe("2026-01-01");
  });

  it("stamps a new card and its deck together", async () => {
    const flash = await setup(stamped);

    await act(async () => flash().addCardToDeck("a", "Q2", "A2"));

    const added = flash().getDeckById("a");
    const card = added?.questions[1];
    expect(card?.updatedAt).toBeDefined();
    expect(added?.updatedAt).toBe(card?.updatedAt);
  });

  it("bumps only the edited card", async () => {
    const flash = await setup(stamped);

    await act(async () => flash().updateCard("a", "q1", "Q!", "A!"));

    const edited = flash().getDeckById("a");
    expect(edited?.questions[0].updatedAt).not.toBe(OLD);
    expect(edited?.updatedAt).toBe(edited?.questions[0].updatedAt);
  });

  it.each([
    ["a card is deleted", (f: Flash) => f.deleteCard("a", "q1"), "a", OLD],
    ["a deck is archived", (f: Flash) => f.archiveDeck("b"), "b", "2026-01-01"],
    [
      "a score is saved",
      (f: Flash) => f.saveMyScore("b", 1, 2),
      "b",
      "2026-01-01",
    ],
    [
      "the scoreboard is reset",
      (f: Flash) => f.resetScore("b"),
      "b",
      "2026-01-01",
    ],
  ])("bumps the deck when %s", async (_name, change, id, before) => {
    const flash = await setup({
      ...stamped,
      myScores: { b: [{ numberOfQuestions: 1, actualScore: 1, date: "d" }] },
    });

    await act(async () => change(flash()));

    expect(flash().getDeckById(id)?.updatedAt).not.toBe(before);
  });

  it("records a tombstone when a deck is deleted", async () => {
    const flash = await setup(stamped);

    await act(async () => flash().deleteDeck("a"));

    const saved = JSON.parse(
      (await AsyncStorage.getItem(flashCardKey)) ?? "{}",
    );
    expect(saved.deletedDecks).toEqual([
      { id: "a", deletedAt: expect.any(String) },
    ]);
    expect(saved.flashcards.a).toBeUndefined();
  });

  it("forgets the tombstone when the same deck is imported again", async () => {
    const flash = await setup(stamped);
    await act(async () => flash().deleteDeck("b"));

    await act(async () =>
      flash().importDeck("00000000-0000-4000-8000-0000000000bb", "B", 50, []),
    );
    // A different id never matched the tombstone, so it is still there.
    let saved = JSON.parse((await AsyncStorage.getItem(flashCardKey)) ?? "{}");
    expect(saved.deletedDecks).toHaveLength(1);

    const id = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
    const fresh = await setup({
      ...stamped,
      deletedDecks: [{ id, deletedAt: "t" }],
    });
    await act(async () => fresh().importDeck(id, "Back", 50, []));
    saved = JSON.parse((await AsyncStorage.getItem(flashCardKey)) ?? "{}");
    expect(saved.deletedDecks).toEqual([]);
    expect(saved.flashcards[id].updatedAt).toBeDefined();
  });
});
