import { Deck, ScoreSaver } from "@/types/generic";
import { SyncDeck } from "./types";

// Sorted keys, so the same content always serialises the same way.
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : 1));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

/** cyrb53: a quick 53-bit string hash. Change detection only, not security. */
const cyrb53 = (text: string) => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
};

/** Fingerprint of a deck's content, to tell whether it changed since the last sync. */
export const hashDeck = (deck: SyncDeck) => cyrb53(stable(deck));

/** A local deck plus its scores, in the shape that syncs (updatedAt filled in for old data). */
export const toSyncDeck = (
  deck: Deck,
  scores: ScoreSaver[] | null,
): SyncDeck => {
  const updatedAt = deck.updatedAt ?? deck.addedOn;
  return {
    ...deck,
    updatedAt,
    questions: deck.questions.map((q) => ({
      ...q,
      updatedAt: q.updatedAt ?? updatedAt,
    })),
    scores: scores ?? [],
  };
};
