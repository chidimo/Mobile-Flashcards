/** What to paste into an AI chat so it turns the conversation into a deck file this app can import. */
export const deckPrompt = `Turn what we've discussed into a flashcard deck and generate it as a downloadable file named [topic-name].json (lowercase, hyphens).

Make 25-30 cards that test understanding, not just recall. If the topic is technical, mix theory with code: about half the cards should show code ("what does this do?", "spot the bug", "which property or function?") and the rest should cover concepts and why things work.

File shape: {"id", "title", "passMark" (1-100), "questions": [{"id", "question", "answer", "hint" (optional)}]}. Valid JSON only. Every "id" is a unique UUID v4. "question", "answer" and "hint" are Markdown; put code in fenced blocks that name the language (\`\`\`css, \`\`\`js).`;
