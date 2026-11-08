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

/**
 * Pulls the JSON out of what was pasted: drops a BOM, a ```json fence and any text around the object,
 * which is how it arrives from chat apps and notes.
 */
const extractJson = (text: string) => {
  let body = text.replace(/^\uFEFF/, "").trim();
  if (body.startsWith("```")) body = body.slice(body.indexOf("\n") + 1);
  if (body.endsWith("```")) body = body.slice(0, -3);
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start !== -1 && end > start ? body.slice(start, end + 1) : body.trim();
};

// Notes and Messages swap straight quotes for curly ones, which breaks JSON.
const straightenQuotes = (text: string) =>
  text.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return JSON.parse(straightenQuotes(text));
  }
};

/** Reads a deck from shared JSON, with errors fit to show a person. */
export const parseDeckFile = (text: string): ImportedDeck => {
  if (text.trim() === "") {
    throw new Error(
      "There's nothing to import: the text is empty. If iPhone asked to allow paste, choose Allow Paste.",
    );
  }
  let data: unknown;
  try {
    data = parseJson(extractJson(text));
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    throw new Error(
      `That isn't valid JSON${detail}. Copy the whole deck and try again.`,
    );
  }
  const result = ImportSchema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue.path.length ? `${issue.path.join(".")}: ` : "";
    throw new Error(
      `That JSON isn't a flashcard deck. ${where}${issue.message}`,
    );
  }
  const { id, title, passMark, questions } = result.data;
  return { id, title, passMark: Number(passMark), questions };
};
