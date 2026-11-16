import { Deck } from "@/types/generic";
import { hashDeck, toSyncDeck } from "../deck-hash";
import { SyncDeck } from "../types";

const base: SyncDeck = {
  id: "d",
  title: "Deck",
  passMark: 50,
  addedOn: "2026-01-01",
  updatedAt: "2026-01-01",
  questions: [{ id: "q", question: "Q", answer: "A", updatedAt: "2026-01-01" }],
  scores: [],
};

describe("hashDeck", () => {
  it("is the same for the same content, whatever the key order", () => {
    const reordered = Object.fromEntries(
      Object.entries(base).reverse(),
    ) as SyncDeck;
    expect(hashDeck(reordered)).toBe(hashDeck(base));
  });

  it("ignores undefined fields", () => {
    expect(hashDeck({ ...base, isArchived: undefined })).toBe(hashDeck(base));
  });

  it.each([
    ["title", { ...base, title: "Other" }],
    ["archive state", { ...base, isArchived: true }],
    ["a card", { ...base, questions: [{ ...base.questions[0], answer: "B" }] }],
    [
      "scores",
      {
        ...base,
        scores: [{ numberOfQuestions: 1, actualScore: 1, date: "d" }],
      },
    ],
  ])("changes when %s changes", (_what, changed) => {
    expect(hashDeck(changed as SyncDeck)).not.toBe(hashDeck(base));
  });
});

describe("toSyncDeck", () => {
  const old: Deck = {
    id: "d",
    title: "Deck",
    passMark: 50,
    addedOn: "2026-01-01",
    questions: [{ id: "q", question: "Q", answer: "A" }],
  };

  it("fills in updatedAt from addedOn and attaches the scores", () => {
    const score = { numberOfQuestions: 1, actualScore: 1, date: "d" };
    const synced = toSyncDeck(old, [score]);

    expect(synced.updatedAt).toBe("2026-01-01");
    expect(synced.questions[0].updatedAt).toBe("2026-01-01");
    expect(synced.scores).toEqual([score]);
    expect(toSyncDeck(old, null).scores).toEqual([]);
  });
});
