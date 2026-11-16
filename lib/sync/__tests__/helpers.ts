import { SyncStore } from "../engine";
import { ConflictError, RemoteFile, StorageProvider } from "../provider";
import { SyncDeck, SyncRecord } from "../types";

/** An in-memory cloud folder with revisions, shared by every device in a test. */
export class FakeProvider implements StorageProvider {
  files = new Map<string, { content: string; revision: number }>();
  private counter = 0;
  /** Runs once before the next write: lets a test play another device writing mid-sync. */
  beforeWrite: (() => void) | null = null;
  reads = 0;

  async list(): Promise<RemoteFile[]> {
    return [...this.files].map(([name, f]) => ({
      name,
      revision: String(f.revision),
    }));
  }

  async read(name: string) {
    this.reads += 1;
    const file = this.files.get(name);
    if (!file) throw new Error(`no ${name}`);
    return { content: file.content, revision: String(file.revision) };
  }

  async write(name: string, content: string, ifRevision?: string) {
    if (this.beforeWrite) {
      const hook = this.beforeWrite;
      this.beforeWrite = null;
      hook();
    }
    const current = this.files.get(name);
    if (ifRevision !== undefined && String(current?.revision) !== ifRevision) {
      throw new ConflictError(name);
    }
    const revision = ++this.counter;
    this.files.set(name, { content, revision });
    return { revision: String(revision) };
  }
}

/** One device's local data, held in memory. */
export class FakeStore implements SyncStore {
  decks: Record<string, SyncDeck> = {};
  deleted: Record<string, string> = {};
  records: Record<string, SyncRecord> = {};

  async read() {
    return {
      decks: structuredClone(this.decks),
      deleted: { ...this.deleted },
      records: structuredClone(this.records),
    };
  }

  async write(changes: Parameters<SyncStore["write"]>[0]) {
    for (const deck of changes.put) this.decks[deck.id] = structuredClone(deck);
    for (const id of changes.remove) delete this.decks[id];
    for (const id of changes.clearDeleted) delete this.deleted[id];
    this.records = structuredClone(changes.records);
  }

  /** The person adds or edits a deck. */
  save(deck: SyncDeck) {
    this.decks[deck.id] = deck;
    delete this.deleted[deck.id];
  }

  /** The person deletes a deck. */
  delete(id: string, at = "2026-06-01T00:00:00.000Z") {
    delete this.decks[id];
    this.deleted[id] = at;
  }
}

export const makeDeck = (
  id: string,
  over: Partial<SyncDeck> = {},
): SyncDeck => ({
  id,
  title: id,
  passMark: 50,
  addedOn: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  questions: [],
  scores: [],
  ...over,
});

export const makeCard = (id: string, question: string, updatedAt: string) => ({
  id,
  question,
  answer: "ans",
  updatedAt,
});
