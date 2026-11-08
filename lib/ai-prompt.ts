const example = {
  id: "00000000-0000-4000-8000-000000000000",
  title: "CSS Flexbox basics",
  passMark: 70,
  questions: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      question:
        "What does this do?\n```css\n.row { display: flex; gap: 8px; }\n```",
      answer: "It lays the children out in a **row** with 8px between them.",
      hint: "Think main axis",
    },
  ],
};

export const exampleDeckJson = JSON.stringify(example, null, 2);

/** What to paste into an AI chat so it turns the conversation into a deck this app can import. */
export const deckPrompt = `Turn what we've discussed into a flashcard deck for my quiz app.

Make 10-20 cards that test understanding, not just recall. Mix "what does this code do?", "which property...?" and "why...?" questions.

Give me the deck in BOTH of these forms:
1. A downloadable file named after the topic, as [topic-name].json in lowercase with hyphens (for example css-flexbox.json), if you can create files.
2. The same JSON in ONE code block I can copy.

The JSON must match this shape exactly:

\`\`\`json
${exampleDeckJson}
\`\`\`

Rules:
- Return only valid JSON, with no comments and no trailing commas.
- "id" values must be unique UUID v4 strings. Use a different one for the deck and every card.
- "passMark" is a number from 1 to 100.
- "hint" is optional; leave it out when there is nothing useful to say.
- "question", "answer" and "hint" are Markdown. Put code in fenced blocks and ALWAYS name the language (\`\`\`css, \`\`\`js, \`\`\`html, \`\`\`ts, \`\`\`json, \`\`\`python), so it is syntax highlighted. Use \`inline code\` for names and values, and **bold** for key terms.
- Keep answers short and focused: a sentence or two, plus a code sample only when it helps.`;
