import { Deck, ImportSchema, Question } from "@/types/generic";

export type ImportedDeck = {
  id: string;
  title: string;
  passMark: number;
  questions: Question[];
};

/** "Spanish verbs!" -> "spanish-verbs.json" */
export const deckFileName = (title: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "deck"}.json`;
};

/** The JSON a deck is shared as: just what's needed to rebuild it, so it can be imported again. */
export const deckToFileContent = (deck: Deck) =>
  JSON.stringify(
    {
      id: deck.id,
      title: deck.title,
      passMark: deck.passMark,
      questions: deck.questions.map(({ id, question, answer, hint }) => ({
        id,
        question,
        answer,
        ...(hint ? { hint } : {}),
      })),
    },
    null,
    2,
  );

/** Reads a deck from shared JSON, with errors fit to show a person. */
export const parseDeckFile = (text: string): ImportedDeck => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That isn't a JSON deck. Check the file and try again.");
  }
  const result = ImportSchema.safeParse(data);
  if (!result.success) {
    throw new Error("That JSON isn't a flashcard deck.");
  }
  const { id, title, passMark, questions } = result.data;
  return { id, title, passMark: Number(passMark), questions };
};
