import { StoreValue } from "@/types/generic";
import {
  addTombstone,
  migrateStore,
  removeTombstone,
} from "../store-migration";

const old: StoreValue = {
  myScores: null,
  flashcards: {
    a: {
      id: "a",
      title: "A",
      passMark: 50,
      addedOn: "2026-01-01T00:00:00.000Z",
      questions: [{ id: "q1", question: "Q", answer: "A" }],
    },
  },
};

describe("migrateStore", () => {
  it("gives old decks and cards an updatedAt from addedOn", () => {
    const deck = migrateStore(old).flashcards?.a;

    expect(deck?.updatedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(deck?.questions[0].updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("leaves existing timestamps alone", () => {
    const store: StoreValue = {
      ...old,
      flashcards: {
        a: {
          ...old.flashcards!.a,
          updatedAt: "2026-05-05T00:00:00.000Z",
          questions: [
            { id: "q1", question: "Q", answer: "A", updatedAt: "2026-06-06" },
          ],
        },
      },
    };

    const deck = migrateStore(store).flashcards?.a;

    expect(deck?.updatedAt).toBe("2026-05-05T00:00:00.000Z");
    expect(deck?.questions[0].updatedAt).toBe("2026-06-06");
  });

  it("gives the same result when run twice", () => {
    const once = migrateStore(old);
    expect(migrateStore(once)).toEqual(once);
  });

  it("copes with an empty store", () => {
    const empty: StoreValue = { flashcards: null, myScores: null };
    expect(migrateStore(empty)).toBe(empty);
  });
});

describe("tombstones", () => {
  it("adds a deletion and keeps only the latest per deck", () => {
    const first = addTombstone(undefined, "a", "t1");
    const second = addTombstone(first, "a", "t2");

    expect(second).toEqual([{ id: "a", deletedAt: "t2" }]);
  });

  it("forgets a deletion when the deck returns", () => {
    const deleted = addTombstone(addTombstone([], "a", "t1"), "b", "t1");

    expect(removeTombstone(deleted, "a")).toEqual([
      { id: "b", deletedAt: "t1" },
    ]);
    expect(removeTombstone(undefined, "a")).toBeUndefined();
  });
});
