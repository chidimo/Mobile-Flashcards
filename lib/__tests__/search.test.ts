import { Deck } from "@/types/generic";
import { searchDecks } from "../search";

const deck = (
  id: string,
  title: string,
  cards: [string, string, string?][] = [],
): Deck => ({
  id,
  title,
  passMark: 50,
  addedOn: "2026-01-01",
  questions: cards.map(([question, answer, hint], i) => ({
    id: `${id}-${i}`,
    question,
    answer,
    hint,
  })),
});

const decks = [
  deck("css", "CSS Flexbox", [
    ["What does `gap` do?", "Spaces flex items"],
    ["Which property centres items?", "justify-content", "main axis"],
  ]),
  deck("es", "Spanish", [["Hello", "Hola"]]),
];

const ids = (query: string) => searchDecks(decks, query).map((h) => h.deck.id);

describe("searchDecks", () => {
  it("finds nothing for a blank query", () => {
    expect(ids("")).toEqual([]);
    expect(ids("   ")).toEqual([]);
  });

  it("matches a deck title, ignoring case", () => {
    const [hit] = searchDecks(decks, "flexbox");
    expect(hit.deck.id).toBe("css");
    expect(hit.titleMatch).toBe(true);
  });

  it("matches questions, answers and hints", () => {
    expect(searchDecks(decks, "gap")[0].cards).toHaveLength(1);
    expect(ids("hola")).toEqual(["es"]);
    expect(searchDecks(decks, "main axis")[0].cards[0].id).toBe("css-1");
  });

  it("requires every word, in any order", () => {
    expect(ids("items spaces")).toEqual(["css"]);
    expect(ids("items hola")).toEqual([]);
  });

  it("searches archived decks too", () => {
    const archived = { ...decks[1], isArchived: true };
    expect(searchDecks([archived], "hola")).toHaveLength(1);
  });
});
