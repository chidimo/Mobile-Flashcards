import { z } from "zod";
import { SyncDeck } from "./types";

const SCHEMA_VERSION = 1;

const DeckFile = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string(),
  title: z.string(),
  passMark: z.number(),
  isArchived: z.boolean().optional(),
  addedOn: z.string(),
  updatedAt: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      hint: z.string().optional(),
      updatedAt: z.string(),
    }),
  ),
  scores: z.array(
    z.object({
      numberOfQuestions: z.number(),
      actualScore: z.number(),
      date: z.string(),
    }),
  ),
});

const TombstoneFile = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string(),
  deletedAt: z.string(),
});

export type RemoteContent =
  | { kind: "deck"; deck: SyncDeck }
  | { kind: "tombstone"; id: string; deletedAt: string };

/** "deck-<id>.json": one file per deck, live or tombstone. */
export const deckFileName = (id: string) => `deck-${id}.json`;

export const deckIdFromFileName = (name: string) =>
  /^deck-(.+)\.json$/.exec(name)?.[1] ?? null;

export const serializeDeck = (deck: SyncDeck) =>
  JSON.stringify({ schemaVersion: SCHEMA_VERSION, ...deck }, null, 2);

export const serializeTombstone = (id: string, deletedAt: string) =>
  JSON.stringify({ schemaVersion: SCHEMA_VERSION, id, deletedAt }, null, 2);

/** Reads a sync file. Throws on anything unreadable, including files from a newer app version. */
export const parseRemoteFile = (text: string): RemoteContent => {
  const data: unknown = JSON.parse(text);
  const deck = DeckFile.safeParse(data);
  if (deck.success) {
    const { schemaVersion: _version, ...rest } = deck.data;
    return { kind: "deck", deck: rest };
  }
  const tombstone = TombstoneFile.safeParse(data);
  if (tombstone.success) {
    return {
      kind: "tombstone",
      id: tombstone.data.id,
      deletedAt: tombstone.data.deletedAt,
    };
  }
  throw new Error(
    "Not a readable sync file (it may come from a newer version of the app).",
  );
};
