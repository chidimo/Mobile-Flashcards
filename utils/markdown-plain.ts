/** A one-line plain version of markdown, for previews: "Use `gap` in **flex**" -> "Use gap in flex". */
export const markdownToPlain = (markdown: string, maxLength = 80) => {
  const plain = markdown
    // no backtick in the info string: a run of backticks would otherwise be rescanned from every position
    .replace(/```[^\n`]*\n([\s\S]*?)```/g, " $1 ")
    // [ \t] not \s: stay on one line, or blank lines are rescanned from every line start
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
    // stop at the next bracket so an unclosed "[" doesn't scan to the end
    .replace(/!?\[([^[\]]*)\]\([^()\s]*\)/g, "$1")
    .replace(/[*_~`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength
    ? `${plain.slice(0, maxLength - 1).trimEnd()}…`
    : plain;
};
