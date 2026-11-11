import { deckPrompt } from "../ai-prompt";

describe("deckPrompt", () => {
  it("asks for a downloadable file named after the topic", () => {
    expect(deckPrompt).toContain("downloadable file");
    expect(deckPrompt).toContain("[topic-name].json");
  });

  it("asks for 25-30 cards", () => {
    expect(deckPrompt).toContain("25-30 cards");
  });

  it("asks for a mix of theory and code on technical topics", () => {
    expect(deckPrompt).toContain("technical");
    expect(deckPrompt).toContain("mix theory with code");
  });

  it("tells the AI to name code languages", () => {
    expect(deckPrompt).toContain("name the language");
  });

  it("stays short enough to paste without flooding the chat", () => {
    expect(deckPrompt.length).toBeLessThan(900);
  });
});
