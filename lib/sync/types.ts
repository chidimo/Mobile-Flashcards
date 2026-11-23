import { Deck, Question, ScoreSaver } from "@/types/generic";

export type SyncQuestion = Question & { updatedAt: string };

/** A deck as it travels to and from storage: self-contained, with its scores and timestamps. */
export type SyncDeck = Omit<Deck, "updatedAt" | "questions"> & {
  updatedAt: string;
  questions: SyncQuestion[];
  scores: ScoreSaver[];
};

/** What the last successful sync saw of a deck; the baseline for "what changed since". */
export type SyncRecord = {
  /** The remote file's revision after that sync. */
  revision: string;
  /** hashDeck of the local deck after that sync. */
  hash: string;
  /** Each card's updatedAt after that sync, to tell which cards were edited since. */
  cards: Record<string, string>;
};

/** One deck's remote file as listed by the provider (no content). */
type RemoteEntry = {
  revision: string;
  /** Set when the file is a tombstone: the deck was deleted. */
  deletedAt?: string;
};

export type SyncInput = {
  /** Local decks by id. */
  decks: Record<string, SyncDeck>;
  /** Locally deleted decks, id to deletedAt. */
  deleted: Record<string, string>;
  /** Remote files by deck id. */
  remote: Record<string, RemoteEntry>;
  /** Baselines from the last sync, by deck id. */
  records: Record<string, SyncRecord>;
};

export type SyncPlan = {
  /** Send the local deck. `ifRevision` is the remote revision it was based on; absent for a new file. */
  uploads: { id: string; ifRevision?: string }[];
  /** Fetch the remote deck and replace the local one. `revive` when it overrides a local deletion. */
  downloads: { id: string; revive: boolean }[];
  /** Replace the remote file with a tombstone. */
  tombstones: { id: string; deletedAt: string; ifRevision?: string }[];
  /** The deck was deleted elsewhere and not edited here: remove it locally. */
  deletes: string[];
  /** Edited on both sides: fetch the remote deck, merge, then upload the result. */
  conflicts: { id: string; ifRevision: string }[];
  /** Baselines that no longer point at anything. */
  forget: string[];
};
