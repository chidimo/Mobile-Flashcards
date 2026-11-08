import { markdownToPlain } from "../markdown-plain";

describe("markdownToPlain", () => {
  it("strips inline formatting", () => {
    expect(markdownToPlain("Use `gap` in **flex** and *grid*")).toBe(
      "Use gap in flex and grid",
    );
  });

  it("keeps the code of a fenced block on one line", () => {
    expect(
      markdownToPlain(
        "What does this do?\n```css\n.a {\n  display: flex;\n}\n```",
      ),
    ).toBe("What does this do? .a { display: flex; }");
  });

  it("keeps link text and drops the url", () => {
    expect(markdownToPlain("See [the guide](https://x.dev/y)")).toBe(
      "See the guide",
    );
  });

  it("shortens long text with an ellipsis", () => {
    const plain = markdownToPlain("word ".repeat(40), 20);

    expect(plain.length).toBeLessThanOrEqual(20);
    expect(plain.endsWith("…")).toBe(true);
  });

  // These each took over a second at this size before the regexes were tightened.
  it.each([
    ["blank lines", "\n".repeat(30000)],
    ["unclosed brackets", "[".repeat(30000)],
    ["unclosed links", "[a](".repeat(7500)],
    ["a run of backticks", "`".repeat(30000)],
    ["spaced fences", "``` ".repeat(7500)],
  ])("stays fast on %s", (_name, input) => {
    const start = Date.now();

    markdownToPlain(input);

    expect(Date.now() - start).toBeLessThan(300);
  });
});
