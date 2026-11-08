import { aliasFenceLanguages } from "../markdown-languages";

describe("aliasFenceLanguages", () => {
  it("maps languages Prism lacks to a close one", () => {
    expect(aliasFenceLanguages("```scss\na { b: c }\n```")).toBe(
      "```css\na { b: c }\n```",
    );
    expect(aliasFenceLanguages("```java\nint x;\n```")).toContain("```kotlin");
  });

  it("leaves supported and unknown languages alone", () => {
    expect(aliasFenceLanguages("```js\nlet a\n```")).toBe("```js\nlet a\n```");
    expect(aliasFenceLanguages("```bash\nls\n```")).toBe("```bash\nls\n```");
  });

  it("handles several fences and ignores text that only looks like one", () => {
    const text = "Use `scss` here\n```scss\n.a{}\n```\nthen\n~~~yml\na: 1\n~~~";

    expect(aliasFenceLanguages(text)).toBe(
      "Use `scss` here\n```css\n.a{}\n```\nthen\n~~~yaml\na: 1\n~~~",
    );
  });

  it("is case-insensitive about the language", () => {
    expect(aliasFenceLanguages("```SCSS\n.a{}\n```")).toContain("```css");
  });

  it.each([
    ["blank lines", "\n".repeat(30000)],
    ["lines of spaces", "  \n".repeat(10000)],
  ])("stays fast on %s", (_name, input) => {
    const start = Date.now();

    aliasFenceLanguages(input);

    expect(Date.now() - start).toBeLessThan(300);
  });
});
