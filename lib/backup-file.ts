import * as Crypto from "expo-crypto";
import { z } from "zod";
import { Deck, ImportSchema, ScoreSaver, StoreValue } from "@/types/generic";
import { isValidV4UUID } from "@/utils/validate-uuid";
import { readJson } from "./deck-file";

const BackupSchema = z.object({
  type: z.literal("flashcards-backup"),
  version: z.literal(1),
  exportedAt: z.string().optional(),
  decks: z.array(
    ImportSchema.extend({
      isArchived: z.boolean().optional(),
      scores: z
        .array(
          z.object({
            numberOfQuestions: z.number(),
            actualScore: z.number(),
            date: z.string(),
          }),
        )
        .optional(),
    }),
  ),
});

export type BackupDeck = Omit<Deck, "addedOn"> & { scores: ScoreSaver[] };

/** "flashcards-backup-2026-11-16.json" */
export const backupFileName = (date: Date) =>
  `flashcards-backup-${date.toISOString().slice(0, 10)}.json`;

/** Every deck (archived too) with its scores, as one JSON file the app can read back. */
export const backupToFileContent = (
  decks: Deck[],
  scores: Record<string, ScoreSaver[]> | null,
  exportedAt: Date,
) =>
  JSON.stringify(
    {
      type: "flashcards-backup",
      version: 1,
      exportedAt: exportedAt.toISOString(),
      decks: decks.map((deck) => ({
        id: deck.id,
        title: deck.title,
        passMark: deck.passMark,
        ...(deck.isArchived ? { isArchived: true } : {}),
        questions: deck.questions.map(({ id, question, answer, hint }) => ({
          id,
          question,
          answer,
          ...(hint ? { hint } : {}),
        })),
        scores: scores?.[deck.id] ?? [],
      })),
    },
    null,
    2,
  );

const withValidId = (id: string) =>
  isValidV4UUID(id) ? id : Crypto.randomUUID();

/** Reads a backup file, with errors fit to show a person. */
export const parseBackupFile = (text: string): BackupDeck[] => {
  const result = BackupSchema.safeParse(readJson(text));
  if (!result.success) {
    throw new Error(
      "That file isn't a Flashcards backup. Use a file made with Export all decks.",
    );
  }
  return result.data.decks.map((deck) => ({
    id: withValidId(deck.id),
    title: deck.title,
    passMark: Number(deck.passMark),
    isArchived: deck.isArchived,
    questions: deck.questions.map((q) => ({ ...q, id: withValidId(q.id) })),
    scores: deck.scores ?? [],
  }));
};

/**
 * Adds backed-up decks to the store. A deck whose id is already here is left alone, so importing
 * never overwrites or duplicates what the person has.
 */
export const mergeBackup = (
  state: StoreValue,
  backup: BackupDeck[],
  now: Date,
) => {
  const flashcards = { ...state.flashcards };
  const myScores = { ...state.myScores };
  let added = 0;
  for (const { scores, ...deck } of backup) {
    if (flashcards[deck.id]) continue;
    flashcards[deck.id] = { ...deck, addedOn: now.toISOString() };
    if (scores.length > 0) myScores[deck.id] = scores;
    added += 1;
  }
  return {
    next: { ...state, flashcards, myScores },
    added,
    skipped: backup.length - added,
  };
};
