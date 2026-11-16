import { mergeDecks } from "../merge-deck";
import { SyncDeck, SyncQuestion } from "../types";

const card = (
  id: string,
  question: string,
  updatedAt = "2026-01-01T00:00:00.000Z",
  answer = "ans",
): SyncQuestion => ({ id, question, answer, updatedAt });

const deck = (over: Partial<SyncDeck> = {}): SyncDeck => ({
  id: "d",
  title: "Deck",
  passMark: 50,
  addedOn: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  questions: [],
  scores: [],
  ...over,
});

const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2026-02-02T00:00:00.000Z";
const T3 = "2026-03-03T00:00:00.000Z";
const ids = (d: SyncDeck) => d.questions.map((q) => q.id);

describe("mergeDecks deck fields", () => {
  it("takes the title, pass mark and archive state of the newer deck", () => {
    const local = deck({ title: "Old", passMark: 40, updatedAt: T1 });
    const remote = deck({
      title: "New",
      passMark: 80,
      isArchived: true,
      updatedAt: T2,
    });

    const merged = mergeDecks(local, remote);

    expect(merged).toMatchObject({
      title: "New",
      passMark: 80,
      isArchived: true,
      updatedAt: T2,
    });
    expect(mergeDecks(remote, local)).toEqual(merged);
  });

  it("keeps the earliest addedOn", () => {
    const merged = mergeDecks(
      deck({ addedOn: "2026-05-05T00:00:00.000Z" }),
      deck({ addedOn: "2026-04-04T00:00:00.000Z" }),
    );
    expect(merged.addedOn).toBe("2026-04-04T00:00:00.000Z");
  });

  it("agrees on a tie whichever side is called local", () => {
    const x = deck({ title: "X" });
    const y = deck({ title: "Y" });
    expect(mergeDecks(x, y)).toEqual(mergeDecks(y, x));
  });
});

describe("mergeDecks cards", () => {
  it("keeps cards that exist on one side only", () => {
    const merged = mergeDecks(
      deck({ questions: [card("a", "A")] }),
      deck({ questions: [card("b", "B")] }),
    );
    expect(ids(merged).sort()).toEqual(["a", "b"]);
  });

  it("takes the newer edit of a card both sides have, with no copy when only one side edited it", () => {
    const base = { a: T1 };
    const merged = mergeDecks(
      deck({ questions: [card("a", "old", T1)] }),
      deck({ questions: [card("a", "edited", T2)] }),
      base,
    );

    expect(merged.questions).toEqual([card("a", "edited", T2)]);
  });

  it("keeps the older edit as a conflicting-edit card when both sides edited it", () => {
    const base = { a: T1 };
    const merged = mergeDecks(
      deck({ questions: [card("a", "mine", T2)] }),
      deck({ questions: [card("a", "theirs", T3)] }),
      base,
    );

    expect(merged.questions).toHaveLength(2);
    expect(merged.questions[0]).toMatchObject({ id: "a", question: "theirs" });
    expect(merged.questions[1]).toMatchObject({
      id: `a:conflict:${T2}`,
      question: "*(conflicting edit)* mine",
    });
  });

  it("makes the same conflict copy whichever side merges", () => {
    const base = { a: T1 };
    const mine = deck({ questions: [card("a", "mine", T2)] });
    const theirs = deck({ questions: [card("a", "theirs", T3)] });

    expect(mergeDecks(mine, theirs, base)).toEqual(
      mergeDecks(theirs, mine, base),
    );
  });

  it("keeps a copy when there is no history and the cards differ", () => {
    const merged = mergeDecks(
      deck({ questions: [card("a", "mine", T2)] }),
      deck({ questions: [card("a", "theirs", T3)] }),
    );
    expect(merged.questions).toHaveLength(2);
  });

  it("makes no copy when both sides made the identical edit", () => {
    const merged = mergeDecks(
      deck({ questions: [card("a", "same", T2)] }),
      deck({ questions: [card("a", "same", T3)] }),
      { a: T1 },
    );
    expect(merged.questions).toHaveLength(1);
  });

  it("does not stack the conflicting-edit mark on a card that already has it", () => {
    const marked = card("a", "*(conflicting edit)* mine", T2);
    const merged = mergeDecks(
      deck({ questions: [marked] }),
      deck({ questions: [card("a", "theirs", T3)] }),
      { a: T1 },
    );
    expect(merged.questions[1].question).toBe("*(conflicting edit)* mine");
  });

  it("is stable: merging the result with either side again changes nothing", () => {
    const base = { a: T1 };
    const mine = deck({ questions: [card("a", "mine", T2), card("m", "M")] });
    const theirs = deck({
      questions: [card("a", "theirs", T3), card("t", "T")],
    });
    const merged = mergeDecks(mine, theirs, base);

    expect(
      mergeDecks(merged, theirs, base)
        .questions.map((q) => q.id)
        .sort(),
    ).toEqual(merged.questions.map((q) => q.id).sort());
  });
});

describe("mergeDecks scores", () => {
  const s = (date: string, actualScore = 1) => ({
    numberOfQuestions: 2,
    actualScore,
    date,
  });

  it("unions the scores, oldest first, without repeats", () => {
    const merged = mergeDecks(
      deck({ scores: [s("2026-03-03"), s("2026-01-01")] }),
      deck({ scores: [s("2026-02-02"), s("2026-01-01")] }),
    );

    expect(merged.scores.map((x) => x.date)).toEqual([
      "2026-01-01",
      "2026-02-02",
      "2026-03-03",
    ]);
  });

  it("keeps two different scores from the same moment", () => {
    const merged = mergeDecks(
      deck({ scores: [s("2026-01-01", 1)] }),
      deck({ scores: [s("2026-01-01", 2)] }),
    );
    expect(merged.scores).toHaveLength(2);
  });
});
