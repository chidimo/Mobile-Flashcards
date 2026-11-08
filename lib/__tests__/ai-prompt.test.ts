import { parseDeckFile } from "../deck-file";
import { deckPrompt, exampleDeckJson } from "../ai-prompt";

describe("deckPrompt", () => {
  it("embeds an example deck the app can actually import", () => {
    const deck = parseDeckFile(exampleDeckJson);

    expect(deck.title).toBe("CSS Flexbox basics");
    expect(deck.questions).toHaveLength(1);
    expect(deck.questions[0].hint).toBe("Think main axis");
  });

  it("contains that same example", () => {
    expect(deckPrompt).toContain(exampleDeckJson);
  });

  it("asks for both a file and a copyable block", () => {
    expect(deckPrompt).toContain("[topic-name].json");
    expect(deckPrompt).toContain("ONE code block");
  });

  it("tells the AI to name code languages", () => {
    expect(deckPrompt).toContain("ALWAYS name the language");
  });
});
