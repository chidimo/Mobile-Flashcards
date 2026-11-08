import { Deck } from "@/types/generic";
import { orderDecks } from "../deck-order";

const deck = (id: string): Deck => ({
  id,
  title: id,
  questions: [],
  passMark: 50,
  addedOn: "2026-01-01",
});

const decks = { a: deck("a"), b: deck("b"), c: deck("c") };
const ids = (list: Deck[]) => list.map((d) => d.id);

describe("orderDecks", () => {
  it("keeps the stored order when nothing has been ordered yet", () => {
    expect(ids(orderDecks(decks))).toEqual(["a", "b", "c"]);
    expect(ids(orderDecks(decks, []))).toEqual(["a", "b", "c"]);
  });

  it("follows the saved order", () => {
    expect(ids(orderDecks(decks, ["c", "a", "b"]))).toEqual(["c", "a", "b"]);
  });

  it("puts decks missing from the order after the ordered ones", () => {
    expect(ids(orderDecks(decks, ["c"]))).toEqual(["c", "a", "b"]);
  });

  it("skips ids whose deck was deleted", () => {
    expect(ids(orderDecks(decks, ["x", "b", "y", "a", "c"]))).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("lists each deck once, even if the order repeats an id", () => {
    expect(ids(orderDecks(decks, ["b", "b", "a"]))).toEqual(["b", "a", "c"]);
  });

  it("handles no decks", () => {
    expect(orderDecks({}, ["a"])).toEqual([]);
  });
});
