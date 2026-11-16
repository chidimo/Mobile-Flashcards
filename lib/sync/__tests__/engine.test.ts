import { SyncEngine } from "../engine";
import { deckFileName, parseRemoteFile } from "../remote-file";
import { FakeProvider, FakeStore, makeCard, makeDeck } from "./helpers";

const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2026-02-02T00:00:00.000Z";
const T3 = "2026-03-03T00:00:00.000Z";

const device = (provider: FakeProvider) => {
  const store = new FakeStore();
  return { store, engine: new SyncEngine(provider, store) };
};

const setup = () => {
  const cloud = new FakeProvider();
  return { cloud, a: device(cloud), b: device(cloud) };
};

describe("SyncEngine two devices", () => {
  it("sends a new deck up and brings it down on the other device", async () => {
    const { cloud, a, b } = setup();
    a.store.save(makeDeck("d1"));

    const up = await a.engine.sync();
    const down = await b.engine.sync();

    expect(up.uploaded).toBe(1);
    expect(cloud.files.has(deckFileName("d1"))).toBe(true);
    expect(down.downloaded).toBe(1);
    expect(b.store.decks.d1).toEqual(a.store.decks.d1);
  });

  it("does nothing on a second sync when nothing changed, and opens no files", async () => {
    const { cloud, a } = setup();
    a.store.save(makeDeck("d1"));
    await a.engine.sync();
    cloud.reads = 0;

    const again = await a.engine.sync();

    expect(again).toMatchObject({
      uploaded: 0,
      downloaded: 0,
      merged: 0,
      deleted: 0,
    });
    expect(cloud.reads).toBe(0);
  });

  it("carries an edit from one device to the other", async () => {
    const { a, b } = setup();
    a.store.save(makeDeck("d1"));
    await a.engine.sync();
    await b.engine.sync();

    a.store.save({ ...a.store.decks.d1, title: "Renamed", updatedAt: T2 });
    await a.engine.sync();
    await b.engine.sync();

    expect(b.store.decks.d1.title).toBe("Renamed");
  });

  it("propagates a deletion", async () => {
    const { a, b } = setup();
    a.store.save(makeDeck("d1"));
    await a.engine.sync();
    await b.engine.sync();

    a.store.delete("d1");
    await a.engine.sync();
    const result = await b.engine.sync();

    expect(b.store.decks.d1).toBeUndefined();
    expect(result.deleted).toBe(1);
    const tombstone = parseRemoteFile(
      (await a.engine["provider"].read(deckFileName("d1"))).content,
    );
    expect(tombstone.kind).toBe("tombstone");
  });

  it("does not let a stale device resurrect a deleted deck", async () => {
    const { a, b } = setup();
    a.store.save(makeDeck("d1"));
    await a.engine.sync();
    await b.engine.sync();
    a.store.delete("d1");
    await a.engine.sync();

    await b.engine.sync();
    await a.engine.sync();

    expect(a.store.decks.d1).toBeUndefined();
    expect(b.store.decks.d1).toBeUndefined();
  });

  it("keeps a deck edited on one device over a deletion on the other", async () => {
    const { a, b } = setup();
    a.store.save(makeDeck("d1"));
    await a.engine.sync();
    await b.engine.sync();

    a.store.delete("d1");
    b.store.save({ ...b.store.decks.d1, title: "Edited", updatedAt: T2 });
    await a.engine.sync();
    await b.engine.sync();
    await a.engine.sync();

    expect(b.store.decks.d1.title).toBe("Edited");
    expect(a.store.decks.d1.title).toBe("Edited");
    expect(a.store.deleted.d1).toBeUndefined();
  });

  it("merges edits to different cards made on both devices", async () => {
    const { a, b } = setup();
    a.store.save(
      makeDeck("d1", {
        questions: [makeCard("q1", "one", T1), makeCard("q2", "two", T1)],
      }),
    );
    await a.engine.sync();
    await b.engine.sync();

    a.store.save({
      ...a.store.decks.d1,
      updatedAt: T2,
      questions: [makeCard("q1", "one (A)", T2), makeCard("q2", "two", T1)],
    });
    b.store.save({
      ...b.store.decks.d1,
      updatedAt: T3,
      questions: [makeCard("q1", "one", T1), makeCard("q2", "two (B)", T3)],
    });
    await a.engine.sync();
    const merged = await b.engine.sync();
    await a.engine.sync();

    expect(merged.merged).toBe(1);
    const texts = (d: string, s: FakeStore) =>
      s.decks[d].questions.map((q) => q.question).sort();
    expect(texts("d1", b.store)).toEqual(["one (A)", "two (B)"]);
    expect(texts("d1", a.store)).toEqual(["one (A)", "two (B)"]);
  });

  it("keeps both versions when the same card is edited on both devices", async () => {
    const { a, b } = setup();
    a.store.save(makeDeck("d1", { questions: [makeCard("q1", "orig", T1)] }));
    await a.engine.sync();
    await b.engine.sync();

    a.store.save({
      ...a.store.decks.d1,
      updatedAt: T2,
      questions: [makeCard("q1", "from A", T2)],
    });
    b.store.save({
      ...b.store.decks.d1,
      updatedAt: T3,
      questions: [makeCard("q1", "from B", T3)],
    });
    await a.engine.sync();
    await b.engine.sync();
    await a.engine.sync();

    const questions = (s: FakeStore) =>
      s.decks.d1.questions.map((q) => q.question).sort();
    expect(questions(a.store)).toEqual([
      "*(conflicting edit)* from A",
      "from B",
    ]);
    expect(questions(b.store)).toEqual(questions(a.store));
  });

  it("joins decks with the same id on first connect without losing either side's cards", async () => {
    const { a, b } = setup();
    a.store.save(makeDeck("d1", { questions: [makeCard("qa", "A card", T1)] }));
    b.store.save(makeDeck("d1", { questions: [makeCard("qb", "B card", T1)] }));

    await a.engine.sync();
    await b.engine.sync();
    await a.engine.sync();

    expect(a.store.decks.d1.questions.map((q) => q.id).sort()).toEqual([
      "qa",
      "qb",
    ]);
    expect(b.store.decks.d1.questions.map((q) => q.id).sort()).toEqual([
      "qa",
      "qb",
    ]);
  });

  it("unions scores from both devices", async () => {
    const { a, b } = setup();
    a.store.save(makeDeck("d1"));
    await a.engine.sync();
    await b.engine.sync();

    const score = (date: string) => ({
      numberOfQuestions: 2,
      actualScore: 1,
      date,
    });
    a.store.save({
      ...a.store.decks.d1,
      updatedAt: T2,
      scores: [score("2026-02-01")],
    });
    b.store.save({
      ...b.store.decks.d1,
      updatedAt: T3,
      scores: [score("2026-03-01")],
    });
    await a.engine.sync();
    await b.engine.sync();
    await a.engine.sync();

    expect(a.store.decks.d1.scores).toHaveLength(2);
    expect(b.store.decks.d1.scores).toHaveLength(2);
  });
});

describe("SyncEngine safety", () => {
  it("retries when another device writes in the middle of a sync", async () => {
    const { cloud, a, b } = setup();
    a.store.save(makeDeck("d1"));
    await a.engine.sync();
    await b.engine.sync();

    a.store.save({ ...a.store.decks.d1, title: "A's edit", updatedAt: T2 });
    cloud.beforeWrite = () => {
      // B uploads its own edit just before A's write lands.
      void (async () => {
        b.store.save({ ...b.store.decks.d1, title: "B's edit", updatedAt: T3 });
      })();
      cloud.files.set(deckFileName("d1"), {
        content: JSON.stringify({
          schemaVersion: 1,
          ...b.store.decks.d1,
        }),
        revision: 99,
      });
    };

    const result = await a.engine.sync();

    // The retry inside this one call saw B's write and merged it.
    expect(result.merged).toBe(1);
    expect(a.store.decks.d1.title).toBe("B's edit");
  });

  it("leaves an unreadable remote file alone and still syncs the rest", async () => {
    const { cloud, a } = setup();
    cloud.files.set(deckFileName("bad"), { content: "not json{", revision: 1 });
    a.store.save(makeDeck("good"));

    const result = await a.engine.sync();

    expect(result.uploaded).toBe(1);
    expect(result.errors).toEqual([{ id: "bad", message: expect.any(String) }]);
    expect(cloud.files.get(deckFileName("bad"))?.content).toBe("not json{");
  });

  it("refuses a file from a newer version of the app instead of overwriting it", async () => {
    const { cloud, a } = setup();
    cloud.files.set(deckFileName("d1"), {
      content: JSON.stringify({ schemaVersion: 2, id: "d1", title: "Future" }),
      revision: 1,
    });
    a.store.save(makeDeck("d1"));

    const result = await a.engine.sync();

    expect(result.errors).toHaveLength(1);
    expect(result.uploaded).toBe(0);
    expect(
      JSON.parse(cloud.files.get(deckFileName("d1"))!.content).schemaVersion,
    ).toBe(2);
  });

  it("does not overwrite a deck the person edited while syncing", async () => {
    const { cloud, a, b } = setup();
    a.store.save(makeDeck("d1"));
    await a.engine.sync();
    await b.engine.sync();
    b.store.save({ ...b.store.decks.d1, title: "Remote edit", updatedAt: T2 });
    await b.engine.sync();

    // While A downloads that edit, the person edits the same deck on A.
    const realRead = cloud.read.bind(cloud);
    cloud.read = async (name: string) => {
      a.store.save({
        ...a.store.decks.d1,
        title: "Typed meanwhile",
        updatedAt: T3,
      });
      return realRead(name);
    };
    await a.engine.sync();
    cloud.read = realRead;

    expect(a.store.decks.d1.title).toBe("Typed meanwhile");

    await a.engine.sync();
    await b.engine.sync();
    expect(b.store.decks.d1.title).toBe("Typed meanwhile");
  });

  it("runs one sync at a time", async () => {
    const { cloud, a } = setup();
    a.store.save(makeDeck("d1"));

    const [first, second] = await Promise.all([
      a.engine.sync(),
      a.engine.sync(),
    ]);

    expect(first).toBe(second);
    expect([...cloud.files.keys()]).toEqual([deckFileName("d1")]);
  });
});
