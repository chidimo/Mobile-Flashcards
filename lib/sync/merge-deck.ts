import { ScoreSaver } from "@/types/generic";
import { SyncDeck, SyncQuestion } from "./types";

const MARK = "*(conflicting edit)* ";

/**
 * Which of two things wins: the later `updatedAt`. A tie goes to the larger serialisation, so two
 * devices merging the same pair always agree.
 */
const newer = <T extends { updatedAt: string }>(a: T, b: T) => {
  if (a.updatedAt !== b.updatedAt) return a.updatedAt > b.updatedAt ? a : b;
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
};

const sameContent = (a: SyncQuestion, b: SyncQuestion) =>
  a.question === b.question && a.answer === b.answer && a.hint === b.hint;

const scoreKey = (s: ScoreSaver) =>
  `${s.date}|${s.numberOfQuestions}|${s.actualScore}`;

/** Scores only ever grow, so the merge is their union, oldest first. */
const mergeScores = (a: ScoreSaver[], b: ScoreSaver[]) => {
  const all = new Map([...a, ...b].map((s) => [scoreKey(s), s]));
  return [...all.values()].sort((x, y) => (x.date < y.date ? -1 : 1));
};

/** The losing version of a card, kept as a card of its own. Its id is derived, so every device makes the same one. */
const conflictCopy = (loser: SyncQuestion): SyncQuestion => ({
  ...loser,
  id: `${loser.id}:conflict:${loser.updatedAt}`,
  question: loser.question.startsWith(MARK)
    ? loser.question
    : MARK + loser.question,
});

/**
 * Merges two versions of one deck. Deck fields take the newer deck. Cards are joined by id: a card
 * on one side only is kept; a card on both takes the newer edit. If both sides edited it since
 * `base` (each card's updatedAt at the last sync; omit when there is none), the older edit is kept
 * as a "conflicting edit" card so nothing is lost. Scores are unioned. A card deleted on one side
 * and untouched on the other comes back: cards have no tombstones yet.
 */
export const mergeDecks = (
  local: SyncDeck,
  remote: SyncDeck,
  base?: Record<string, string>,
): SyncDeck => {
  const winner = newer(local, remote);
  const other = winner === local ? remote : local;

  const winnerCards = new Map(winner.questions.map((q) => [q.id, q]));
  const otherCards = new Map(other.questions.map((q) => [q.id, q]));
  const edited = (q: SyncQuestion) => !base || base[q.id] !== q.updatedAt;

  const questions: SyncQuestion[] = [];
  const copies: SyncQuestion[] = [];
  for (const mine of winner.questions) {
    const theirs = otherCards.get(mine.id);
    if (!theirs || sameContent(mine, theirs)) {
      questions.push(theirs ? newer(mine, theirs) : mine);
      continue;
    }
    const best = newer(mine, theirs);
    const loser = best === mine ? theirs : mine;
    questions.push(best);
    if (edited(mine) && edited(theirs)) copies.push(conflictCopy(loser));
  }
  for (const card of other.questions) {
    if (!winnerCards.has(card.id)) questions.push(card);
  }

  return {
    ...winner,
    addedOn: local.addedOn < remote.addedOn ? local.addedOn : remote.addedOn,
    updatedAt: newer(local, remote).updatedAt,
    questions: [...questions, ...copies],
    scores: mergeScores(local.scores, remote.scores),
  };
};
