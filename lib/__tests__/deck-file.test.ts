import { deckFileName, deckToFileContent, parseDeckFile } from "../deck-file";

const deck = {
  id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  title: "Spanish verbs",
  passMark: 70,
  addedOn: "2026-01-01T00:00:00.000Z",
  questions: [
    { id: "q1", question: "Hola?", answer: "Hello", hint: "Greeting" },
    { id: "q2", question: "Adios?", answer: "Goodbye" },
  ],
};

describe("deckFileName", () => {
  it("makes a safe file name from the title", () => {
    expect(deckFileName("Spanish verbs!")).toBe("spanish-verbs.json");
    expect(deckFileName("  A/B: C  ")).toBe("a-b-c.json");
  });

  it("falls back when the title has nothing usable", () => {
    expect(deckFileName("日本語")).toBe("deck.json");
    expect(deckFileName("")).toBe("deck.json");
  });
});

describe("deckToFileContent", () => {
  it("shares only what's needed to rebuild the deck", () => {
    const shared = JSON.parse(deckToFileContent(deck));

    expect(shared).toEqual({
      id: deck.id,
      title: "Spanish verbs",
      passMark: 70,
      questions: [
        { id: "q1", question: "Hola?", answer: "Hello", hint: "Greeting" },
        { id: "q2", question: "Adios?", answer: "Goodbye" },
      ],
    });
  });
});

describe("parseDeckFile", () => {
  it("reads back what was shared, hints included", () => {
    expect(parseDeckFile(deckToFileContent(deck))).toEqual({
      id: deck.id,
      title: "Spanish verbs",
      passMark: 70,
      questions: [
        { id: "q1", question: "Hola?", answer: "Hello", hint: "Greeting" },
        { id: "q2", question: "Adios?", answer: "Goodbye" },
      ],
    });
  });

  it("accepts the pass mark as text", () => {
    const text = JSON.stringify({ ...deck, passMark: "80" });

    expect(parseDeckFile(text).passMark).toBe(80);
  });

  it("explains text that isn't JSON", () => {
    expect(() => parseDeckFile("not json")).toThrow("isn't a JSON deck");
  });

  it("explains JSON that isn't a deck", () => {
    expect(() => parseDeckFile(JSON.stringify({ hello: "world" }))).toThrow(
      "isn't a flashcard deck",
    );
  });
});
