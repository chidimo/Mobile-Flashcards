import { hashDeck } from "./deck-hash";
import { mergeDecks } from "./merge-deck";
import { planSync } from "./plan-sync";
import { ConflictError, StorageProvider } from "./provider";
import {
  deckFileName,
  deckIdFromFileName,
  parseRemoteFile,
  RemoteContent,
  serializeDeck,
  serializeTombstone,
} from "./remote-file";
import { SyncDeck, SyncRecord } from "./types";

/** What the engine needs from the app's own storage. */
export interface SyncStore {
  read(): Promise<{
    decks: Record<string, SyncDeck>;
    deleted: Record<string, string>;
    records: Record<string, SyncRecord>;
  }>;
  write(changes: {
    put: SyncDeck[];
    remove: string[];
    /** Tombstones to forget (the deck came back). */
    clearDeleted: string[];
    /** The full set of baselines after this sync. */
    records: Record<string, SyncRecord>;
  }): Promise<void>;
}

export type SyncResult = {
  uploaded: number;
  downloaded: number;
  merged: number;
  deleted: number;
  /** Per-deck problems (an unreadable remote file); the rest of the sync still ran. */
  errors: { id: string; message: string }[];
};

const MAX_ATTEMPTS = 3;

const recordFor = (deck: SyncDeck, revision: string): SyncRecord => ({
  revision,
  hash: hashDeck(deck),
  cards: Object.fromEntries(deck.questions.map((q) => [q.id, q.updatedAt])),
});

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

/** One pass. Returns `retry` when another device wrote in the middle of it. */
const syncPass = async (provider: StorageProvider, store: SyncStore) => {
  const snap = await store.read();
  const result: SyncResult = {
    uploaded: 0,
    downloaded: 0,
    merged: 0,
    deleted: 0,
    errors: [],
  };

  // Find out what is remote. A file is only opened when its revision differs from the last sync.
  const remote: Record<string, { revision: string; deletedAt?: string }> = {};
  const contents = new Map<string, RemoteContent>();
  const skip = new Set<string>();
  for (const file of await provider.list()) {
    const id = deckIdFromFileName(file.name);
    if (id === null) continue;
    const record = snap.records[id];
    if (record && record.revision === file.revision) {
      remote[id] = { revision: file.revision };
      continue;
    }
    try {
      const read = await provider.read(file.name);
      const parsed = parseRemoteFile(read.content);
      contents.set(id, parsed);
      remote[id] = {
        revision: read.revision,
        ...(parsed.kind === "tombstone" ? { deletedAt: parsed.deletedAt } : {}),
      };
    } catch (error) {
      // Never overwrite a file we can't read.
      skip.add(id);
      result.errors.push({ id, message: message(error) });
    }
  }

  const without = <T>(map: Record<string, T>) =>
    Object.fromEntries(Object.entries(map).filter(([id]) => !skip.has(id)));
  const plan = planSync({
    decks: without(snap.decks),
    deleted: without(snap.deleted),
    remote,
    records: without(snap.records),
  });

  const records = { ...snap.records };
  const put: SyncDeck[] = [];
  const remove: string[] = [];
  const clearDeleted: string[] = [];
  let retry = false;

  const attempt = async (work: () => Promise<void>) => {
    try {
      await work();
    } catch (error) {
      if (error instanceof ConflictError) retry = true;
      else throw error;
    }
  };
  const remoteDeck = (id: string) => {
    const content = contents.get(id);
    if (content?.kind !== "deck")
      throw new Error(`Expected a deck file for ${id}`);
    return content.deck;
  };

  for (const { id, ifRevision } of plan.uploads) {
    await attempt(async () => {
      const deck = snap.decks[id];
      const { revision } = await provider.write(
        deckFileName(id),
        serializeDeck(deck),
        ifRevision,
      );
      records[id] = recordFor(deck, revision);
      result.uploaded += 1;
    });
  }
  for (const { id, deletedAt, ifRevision } of plan.tombstones) {
    await attempt(async () => {
      await provider.write(
        deckFileName(id),
        serializeTombstone(id, deletedAt),
        ifRevision,
      );
      delete records[id];
      result.deleted += 1;
    });
  }
  for (const { id, revive } of plan.downloads) {
    const deck = remoteDeck(id);
    put.push(deck);
    records[id] = recordFor(deck, remote[id].revision);
    if (revive) clearDeleted.push(id);
    result.downloaded += 1;
  }
  for (const { id, ifRevision } of plan.conflicts) {
    await attempt(async () => {
      const merged = mergeDecks(
        snap.decks[id],
        remoteDeck(id),
        snap.records[id]?.cards,
      );
      const { revision } = await provider.write(
        deckFileName(id),
        serializeDeck(merged),
        ifRevision,
      );
      put.push(merged);
      records[id] = recordFor(merged, revision);
      result.merged += 1;
    });
  }
  for (const id of plan.deletes) {
    remove.push(id);
    delete records[id];
    result.deleted += 1;
  }
  for (const id of plan.forget) delete records[id];

  // The person may have edited while we were talking to the network. Don't overwrite those decks
  // or move their baselines: the next sync sees the edit and merges.
  const now = await store.read();
  const stale = (id: string) => {
    const before = snap.decks[id];
    const after = now.decks[id];
    return (
      (before ? hashDeck(before) : null) !== (after ? hashDeck(after) : null)
    );
  };
  const applicable = (id: string) => {
    if (!stale(id)) return true;
    if (snap.records[id]) records[id] = snap.records[id];
    else delete records[id];
    return false;
  };

  await store.write({
    put: put.filter((deck) => applicable(deck.id)),
    remove: remove.filter(applicable),
    clearDeleted: clearDeleted.filter((id) => !stale(id)),
    records,
  });
  return { result, retry };
};

/** Runs one sync at a time, retrying when another device wrote in the middle of a pass. */
export class SyncEngine {
  private running: Promise<SyncResult> | null = null;

  constructor(
    private readonly provider: StorageProvider,
    private readonly store: SyncStore,
  ) {}

  sync(): Promise<SyncResult> {
    this.running ??= this.run().finally(() => {
      this.running = null;
    });
    return this.running;
  }

  private async run(): Promise<SyncResult> {
    const total: SyncResult = {
      uploaded: 0,
      downloaded: 0,
      merged: 0,
      deleted: 0,
      errors: [],
    };
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const { result, retry } = await syncPass(this.provider, this.store);
      total.uploaded += result.uploaded;
      total.downloaded += result.downloaded;
      total.merged += result.merged;
      total.deleted += result.deleted;
      total.errors = result.errors;
      if (!retry) return total;
    }
    throw new Error(
      "Another device kept changing your decks. Try syncing again.",
    );
  }
}
