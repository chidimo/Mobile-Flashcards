import { hashDeck } from "../deck-hash";
import { planSync } from "../plan-sync";
import { SyncDeck, SyncInput, SyncPlan, SyncRecord } from "../types";

const deck = (id: string, title = id): SyncDeck => ({
  id,
  title,
  passMark: 50,
  addedOn: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  questions: [],
  scores: [],
});

/** The baseline a sync would have saved for this deck at remote revision `revision`. */
const synced = (d: SyncDeck, revision = "r1"): SyncRecord => ({
  revision,
  hash: hashDeck(d),
  cards: {},
});

const empty: SyncPlan = {
  uploads: [],
  downloads: [],
  tombstones: [],
  deletes: [],
  conflicts: [],
  forget: [],
};

const plan = (input: Partial<SyncInput>) =>
  planSync({ decks: {}, deleted: {}, remote: {}, records: {}, ...input });

const a = deck("a");
const aEdited = { ...a, title: "A edited" };

describe("planSync: the deck exists here", () => {
  it("does nothing when both sides are unchanged", () => {
    expect(
      plan({
        decks: { a },
        remote: { a: { revision: "r1" } },
        records: { a: synced(a) },
      }),
    ).toEqual(empty);
  });

  it("uploads a deck that is new here", () => {
    expect(plan({ decks: { a } }).uploads).toEqual([{ id: "a" }]);
  });

  it("uploads a local edit against the revision it was based on", () => {
    expect(
      plan({
        decks: { a: aEdited },
        remote: { a: { revision: "r1" } },
        records: { a: synced(a) },
      }).uploads,
    ).toEqual([{ id: "a", ifRevision: "r1" }]);
  });

  it("downloads a remote edit when nothing changed here", () => {
    expect(
      plan({
        decks: { a },
        remote: { a: { revision: "r2" } },
        records: { a: synced(a) },
      }).downloads,
    ).toEqual([{ id: "a", revive: false }]);
  });

  it("flags a conflict when both sides were edited", () => {
    expect(
      plan({
        decks: { a: aEdited },
        remote: { a: { revision: "r2" } },
        records: { a: synced(a) },
      }).conflicts,
    ).toEqual([{ id: "a", ifRevision: "r2" }]);
  });

  it("treats the same deck on both sides with no history as a conflict", () => {
    expect(
      plan({ decks: { a }, remote: { a: { revision: "r1" } } }).conflicts,
    ).toEqual([{ id: "a", ifRevision: "r1" }]);
  });

  it("re-uploads when the remote file has vanished, never deleting local data", () => {
    expect(plan({ decks: { a }, records: { a: synced(a) } }).uploads).toEqual([
      { id: "a" },
    ]);
  });

  it("deletes locally when deleted elsewhere and not edited here", () => {
    expect(
      plan({
        decks: { a },
        remote: { a: { revision: "r2", deletedAt: "t" } },
        records: { a: synced(a) },
      }).deletes,
    ).toEqual(["a"]);
  });

  it("keeps a local edit over a remote deletion", () => {
    expect(
      plan({
        decks: { a: aEdited },
        remote: { a: { revision: "r2", deletedAt: "t" } },
        records: { a: synced(a) },
      }).uploads,
    ).toEqual([{ id: "a", ifRevision: "r2" }]);
  });

  it("keeps a never-synced local deck over a remote tombstone with the same id", () => {
    expect(
      plan({
        decks: { a },
        remote: { a: { revision: "r2", deletedAt: "t" } },
      }).uploads,
    ).toEqual([{ id: "a", ifRevision: "r2" }]);
  });
});

describe("planSync: the deck is deleted here", () => {
  const deleted = { a: "2026-02-02T00:00:00.000Z" };

  it("tells the remote about the deletion when the remote is unchanged", () => {
    expect(
      plan({
        deleted,
        remote: { a: { revision: "r1" } },
        records: { a: synced(a) },
      }).tombstones,
    ).toEqual([{ id: "a", deletedAt: deleted.a, ifRevision: "r1" }]);
  });

  it("lets a remote edit bring the deck back", () => {
    expect(
      plan({
        deleted,
        remote: { a: { revision: "r2" } },
        records: { a: synced(a) },
      }).downloads,
    ).toEqual([{ id: "a", revive: true }]);
  });

  it("does nothing when the remote is already a tombstone", () => {
    expect(
      plan({
        deleted,
        remote: { a: { revision: "r2", deletedAt: "t" } },
        records: { a: synced(a) },
      }),
    ).toEqual(empty);
  });

  it("does nothing when the remote never had the deck", () => {
    expect(plan({ deleted })).toEqual(empty);
  });

  it("brings back a remote deck of the same id that this device never synced", () => {
    expect(
      plan({ deleted, remote: { a: { revision: "r1" } } }).downloads,
    ).toEqual([{ id: "a", revive: true }]);
  });
});

describe("planSync: the deck is not here", () => {
  it("downloads a deck that is new on the remote", () => {
    expect(plan({ remote: { a: { revision: "r1" } } }).downloads).toEqual([
      { id: "a", revive: false },
    ]);
  });

  it("downloads a deck that vanished locally without a tombstone", () => {
    expect(
      plan({
        remote: { a: { revision: "r1" } },
        records: { a: synced(a) },
      }).downloads,
    ).toEqual([{ id: "a", revive: false }]);
  });

  it("ignores a remote tombstone for a deck we don't have", () => {
    expect(plan({ remote: { a: { revision: "r1", deletedAt: "t" } } })).toEqual(
      empty,
    );
  });

  it("forgets a record that points at nothing", () => {
    expect(plan({ records: { a: synced(a) } }).forget).toEqual(["a"]);
  });
});

describe("planSync: several decks", () => {
  it("plans each deck on its own", () => {
    const b = deck("b");
    const result = plan({
      decks: { a: aEdited, b },
      remote: {
        a: { revision: "r1" },
        b: { revision: "r2" },
        c: { revision: "r1" },
      },
      records: { a: synced(a), b: synced(b) },
    });

    expect(result.uploads).toEqual([{ id: "a", ifRevision: "r1" }]);
    expect(result.downloads).toEqual([
      { id: "b", revive: false },
      { id: "c", revive: false },
    ]);
  });

  it("sees a score change as a deck change, since scores sync with the deck", () => {
    const withScore = {
      ...a,
      scores: [{ numberOfQuestions: 2, actualScore: 1, date: "2026-03-03" }],
    };
    expect(
      plan({
        decks: { a: withScore },
        remote: { a: { revision: "r1" } },
        records: { a: synced(a) },
      }).uploads,
    ).toEqual([{ id: "a", ifRevision: "r1" }]);
  });
});
