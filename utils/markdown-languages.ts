// Prism lacks these, so show them as the closest language it has. Anything else unknown stays plain.
const aliases: Record<string, string> = {
  scss: "css",
  less: "css",
  html5: "html",
  vue: "html",
  svg: "xml",
  java: "kotlin",
  "c#": "cpp",
  cs: "cpp",
  csharp: "cpp",
  yml: "yaml",
  node: "js",
  mjs: "js",
  cjs: "js",
  json5: "json",
  jsonc: "json",
};

/** Rewrites the language on each ``` fence to one Prism can highlight, e.g. "```scss" -> "```css". */
export const aliasFenceLanguages = (markdown: string) =>
  markdown.replace(
    /^([ \t]*(?:```|~~~))[ \t]*([^\s`~]+)/gm,
    (match, fence: string, language: string) => {
      const mapped = aliases[language.toLowerCase()];
      return mapped ? `${fence}${mapped}` : match;
    },
  );
