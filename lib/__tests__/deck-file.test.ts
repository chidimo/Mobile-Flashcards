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

  it("stays fast on a very long run of separators", () => {
    const start = Date.now();

    expect(deckFileName(`${"-".repeat(30000)}x${"-".repeat(30000)}`)).toBe(
      "x.json",
    );
    expect(Date.now() - start).toBeLessThan(300);
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
    expect(() => parseDeckFile("not json")).toThrow("isn't valid JSON");
  });

  it("explains JSON that isn't a deck", () => {
    expect(() => parseDeckFile(JSON.stringify({ hello: "world" }))).toThrow(
      "isn't a flashcard deck",
    );
  });

  describe("forgiving of how it was copied", () => {
    const text = deckToFileContent(deck);
    const expected = parseDeckFile(text);

    it("accepts a ```json fence", () => {
      expect(parseDeckFile(`\`\`\`json\n${text}\n\`\`\``)).toEqual(expected);
    });

    it("accepts text around the JSON", () => {
      expect(parseDeckFile(`Here is your deck:\n\n${text}\n\nEnjoy!`)).toEqual(
        expected,
      );
    });

    it("accepts a byte order mark and surrounding whitespace", () => {
      expect(parseDeckFile(`\uFEFF\n  ${text}  \n`)).toEqual(expected);
    });

    it("accepts curly quotes", () => {
      const curly = text.replace(/"/g, (_m, i: number) =>
        i % 2 ? "\u201d" : "\u201c",
      );

      expect(parseDeckFile(curly).title).toBe("Spanish verbs");
    });
  });

  describe("says what is wrong", () => {
    it("explains an empty paste, which is what a blocked iPhone paste gives", () => {
      expect(() => parseDeckFile("")).toThrow("Allow Paste");
      expect(() => parseDeckFile("   \n ")).toThrow("nothing to import");
    });

    it("points at a truncated copy", () => {
      expect(() => parseDeckFile(deckToFileContent(deck).slice(0, 60))).toThrow(
        "isn't valid JSON",
      );
    });

    it("names the field that is wrong in a deck", () => {
      const broken = JSON.stringify({
        id: "d",
        title: "T",
        passMark: 70,
        questions: [{ id: "q", question: "Q" }],
      });

      expect(() => parseDeckFile(broken)).toThrow("questions.0.answer");
    });
  });
});
