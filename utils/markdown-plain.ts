const FENCE = /(```[^\n`]*\n[\s\S]*?```)/;
const INLINE_CODE = /(`[^`\n]+`)/;

// Formatting marks only; the text between them is kept.
const stripMarks = (text: string) =>
  text
    // [ \t] not \s: stay on one line, or blank lines are rescanned from every line start
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
    .replace(/^[ \t]*>+[ \t]?/gm, "")
    // stop at the next bracket so an unclosed "[" doesn't scan to the end
    .replace(/!?\[([^[\]]*)\]\([^()\s]*\)/g, "$1")
    .replace(/[*~]/g, "")
    // underscores only as emphasis, so snake_case survives
    .replace(/(^|[\s(])_+([^_\s][^_]*?)_+(?=$|[\s).,!?])/g, "$1$2");

/** A one-line plain version of markdown, for previews: "Use `gap` in **flex**" -> "Use gap in flex". Code is kept as written. */
export const markdownToPlain = (markdown: string, maxLength = 80) => {
  const plain = markdown
    .split(FENCE)
    .map((part, i) => {
      // Odd parts are fenced blocks: keep the code, drop the fences.
      if (i % 2) return ` ${part.replace(/^```[^\n`]*\n/, "").slice(0, -3)} `;
      return part
        .split(INLINE_CODE)
        .map((piece, j) => (j % 2 ? piece.slice(1, -1) : stripMarks(piece)))
        .join("");
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength
    ? `${plain.slice(0, maxLength - 1).trimEnd()}…`
    : plain;
};
