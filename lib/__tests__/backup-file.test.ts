import { Deck } from "@/types/generic";
import {
  backupFileName,
  backupToFileContent,
  mergeBackup,
  parseBackupFile,
} from "../backup-file";

jest.mock("expo-crypto", () => ({
  randomUUID: () => "00000000-0000-4000-8000-000000000099",
}));

const ID_A = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
const ID_B = "1c9f7a52-6f0e-4d0e-9a6b-3f6c1b2e8d40";
const Q1 = "3d594650-3436-4c3b-8f0e-1a2b3c4d5e6f";

const deck = (id: string, title: string, extra: Partial<Deck> = {}): Deck => ({
  id,
  title,
  passMark: 70,
  addedOn: "2026-01-01",
  questions: [{ id: Q1, question: "Hola?", answer: "Hello", hint: "Greeting" }],
  ...extra,
});

const score = { numberOfQuestions: 5, actualScore: 4, date: "2026-02-02" };
const exportedAt = new Date("2026-11-16T10:00:00Z");

describe("backup file", () => {
  it("names the file by date", () => {
    expect(backupFileName(exportedAt)).toBe(
      "flashcards-backup-2026-11-16.json",
    );
  });

  it("round-trips decks, archived state and scores", () => {
    const text = backupToFileContent(
      [deck(ID_A, "Spanish"), deck(ID_B, "French", { isArchived: true })],
      { [ID_A]: [score] },
      exportedAt,
    );

    const decks = parseBackupFile(text);

    expect(decks.map((d) => d.title)).toEqual(["Spanish", "French"]);
    expect(decks[0].scores).toEqual([score]);
    expect(decks[0].isArchived).toBeUndefined();
    expect(decks[1].isArchived).toBe(true);
    expect(decks[1].scores).toEqual([]);
    expect(decks[0].questions[0]).toMatchObject({ id: Q1, hint: "Greeting" });
  });

  it("gives decks and cards with unusable ids new ones", () => {
    const text = JSON.stringify({
      type: "flashcards-backup",
      version: 1,
      decks: [
        {
          id: "not-a-uuid",
          title: "Old",
          passMark: "60",
          questions: [{ id: "q1", question: "Q", answer: "A" }],
        },
      ],
    });

    const [parsed] = parseBackupFile(text);

    expect(parsed.id).toBe("00000000-0000-4000-8000-000000000099");
    expect(parsed.questions[0].id).toBe("00000000-0000-4000-8000-000000000099");
    expect(parsed.passMark).toBe(60);
  });

  it("rejects a file that isn't a backup", () => {
    const singleDeck = JSON.stringify({
      id: ID_A,
      title: "Spanish",
      passMark: 70,
      questions: [],
    });
    expect(() => parseBackupFile(singleDeck)).toThrow(
      "isn't a Flashcards backup",
    );
    expect(() => parseBackupFile("{}")).toThrow("isn't a Flashcards backup");
  });

  it("explains bad JSON and empty files", () => {
    expect(() => parseBackupFile("{nope")).toThrow("isn't valid JSON");
    expect(() => parseBackupFile("  ")).toThrow("nothing to import");
  });
});

describe("mergeBackup", () => {
  const now = new Date("2026-11-16T12:00:00Z");
  const backup = parseBackupFile(
    backupToFileContent(
      [deck(ID_A, "Spanish"), deck(ID_B, "French")],
      { [ID_B]: [score] },
      exportedAt,
    ),
  );

  it("adds decks and their scores to an empty store", () => {
    const { next, added, skipped } = mergeBackup(
      { flashcards: null, myScores: null },
      backup,
      now,
    );

    expect(added).toBe(2);
    expect(skipped).toBe(0);
    expect(Object.keys(next.flashcards ?? {})).toEqual([ID_A, ID_B]);
    expect(next.flashcards?.[ID_A].addedOn).toBe(now.toISOString());
    expect(next.myScores).toEqual({ [ID_B]: [score] });
  });

  it("leaves a deck that is already here untouched", () => {
    const mine = deck(ID_A, "My edited Spanish");
    const state = {
      flashcards: { [ID_A]: mine },
      myScores: { [ID_A]: [score] },
    };

    const { next, added, skipped } = mergeBackup(state, backup, now);

    expect(added).toBe(1);
    expect(skipped).toBe(1);
    expect(next.flashcards?.[ID_A].title).toBe("My edited Spanish");
    expect(next.myScores?.[ID_A]).toEqual([score]);
    expect(next.flashcards?.[ID_B].title).toBe("French");
  });

  it("keeps other store settings such as deck order", () => {
    const { next } = mergeBackup(
      { flashcards: null, myScores: null, deckOrder: ["x"] },
      backup,
      now,
    );
    expect(next.deckOrder).toEqual(["x"]);
  });

  it("stamps imported decks and cards for sync", () => {
    const { next } = mergeBackup(
      { flashcards: null, myScores: null },
      backup,
      now,
    );

    const imported = next.flashcards?.[ID_A];
    expect(imported?.updatedAt).toBe(now.toISOString());
    expect(imported?.questions[0].updatedAt).toBe(now.toISOString());
  });

  it("forgets the deletion of a deck that comes back", () => {
    const { next } = mergeBackup(
      {
        flashcards: null,
        myScores: null,
        deletedDecks: [
          { id: ID_A, deletedAt: "t" },
          { id: "other", deletedAt: "t" },
        ],
      },
      backup,
      now,
    );

    expect(next.deletedDecks).toEqual([{ id: "other", deletedAt: "t" }]);
  });
});
