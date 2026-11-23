import {
  deckFileName,
  deckIdFromFileName,
  parseRemoteFile,
  serializeDeck,
  serializeTombstone,
} from "../remote-file";
import { makeCard, makeDeck } from "./helpers";

describe("remote files", () => {
  it("names files by deck id and reads the id back", () => {
    expect(deckFileName("abc")).toBe("deck-abc.json");
    expect(deckIdFromFileName("deck-abc.json")).toBe("abc");
    expect(deckIdFromFileName("manifest.json")).toBeNull();
  });

  it("round-trips a deck", () => {
    const deck = makeDeck("d", {
      isArchived: true,
      questions: [
        { ...makeCard("q", "Q", "2026-01-01T00:00:00.000Z"), hint: "h" },
      ],
      scores: [{ numberOfQuestions: 1, actualScore: 1, date: "2026-02-02" }],
    });

    expect(parseRemoteFile(serializeDeck(deck))).toEqual({
      kind: "deck",
      deck,
    });
  });

  it("round-trips a tombstone", () => {
    expect(parseRemoteFile(serializeTombstone("d", "t"))).toEqual({
      kind: "tombstone",
      id: "d",
      deletedAt: "t",
    });
  });

  it("rejects other shapes and newer schema versions", () => {
    expect(() => parseRemoteFile("{}")).toThrow("readable sync file");
    expect(() =>
      parseRemoteFile('{"schemaVersion":2,"id":"d","deletedAt":"t"}'),
    ).toThrow();
    expect(() => parseRemoteFile("nope")).toThrow();
  });
});
