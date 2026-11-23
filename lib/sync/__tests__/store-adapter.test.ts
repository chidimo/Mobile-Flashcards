import { StoreValue } from "@/types/generic";
import { hashDeck } from "../deck-hash";
import { applyChangesToStore, snapshotFromStore } from "../store-adapter";
import { makeCard, makeDeck } from "./helpers";

const score = { numberOfQuestions: 2, actualScore: 1, date: "2026-02-02" };

const store: StoreValue = {
  flashcards: {
    a: {
      id: "a",
      title: "A",
      passMark: 50,
      addedOn: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      questions: [makeCard("q1", "Q", "2026-01-02T00:00:00.000Z")],
    },
  },
  myScores: { a: [score] },
  deletedDecks: [{ id: "gone", deletedAt: "2026-03-03T00:00:00.000Z" }],
  deckOrder: ["a"],
};

describe("snapshotFromStore", () => {
  it("joins each deck with its scores and lists deletions by id", () => {
    const snap = snapshotFromStore(store);

    expect(snap.decks.a.scores).toEqual([score]);
    expect(snap.deleted).toEqual({ gone: "2026-03-03T00:00:00.000Z" });
  });

  it("copes with an empty store", () => {
    expect(snapshotFromStore({ flashcards: null, myScores: null })).toEqual({
      decks: {},
      deleted: {},
    });
  });
});

describe("applyChangesToStore", () => {
  const none = { put: [], remove: [], clearDeleted: [] };

  it("stores a downloaded deck and its scores, and a re-read hashes the same", () => {
    const incoming = makeDeck("b", {
      questions: [makeCard("q", "Q", "2026-01-01T00:00:00.000Z")],
      scores: [score],
      isArchived: false,
    });

    const next = applyChangesToStore(store, { ...none, put: [incoming] });

    expect(next.flashcards?.b.title).toBe("b");
    expect(next.myScores?.b).toEqual([score]);
    // The baseline saved after a download is this hash; the next sync must see no local change.
    expect(hashDeck(snapshotFromStore(next).decks.b)).toBe(hashDeck(incoming));
  });

  it("replaces an existing deck", () => {
    const incoming = makeDeck("a", { title: "New title" });

    const next = applyChangesToStore(store, { ...none, put: [incoming] });

    expect(next.flashcards?.a.title).toBe("New title");
    expect(next.myScores?.a).toEqual([]);
  });

  it("removes a deck and its scores", () => {
    const next = applyChangesToStore(store, { ...none, remove: ["a"] });

    expect(next.flashcards?.a).toBeUndefined();
    expect(next.myScores?.a).toBeUndefined();
  });

  it("forgets deletions for decks that came back", () => {
    const next = applyChangesToStore(store, {
      ...none,
      clearDeleted: ["gone"],
    });
    expect(next.deletedDecks).toEqual([]);
  });

  it("leaves deck order and other deletions alone", () => {
    const next = applyChangesToStore(store, { ...none, put: [makeDeck("b")] });

    expect(next.deckOrder).toEqual(["a"]);
    expect(next.deletedDecks).toEqual(store.deletedDecks);
  });

  it("works on an empty store", () => {
    const next = applyChangesToStore(
      { flashcards: null, myScores: null },
      { ...none, put: [makeDeck("b")] },
    );
    expect(Object.keys(next.flashcards ?? {})).toEqual(["b"]);
  });
});
