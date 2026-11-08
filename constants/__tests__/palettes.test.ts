import { defaultPaletteId, getPalette, palettes } from "../palettes";

describe("palettes", () => {
  it("has unique ids and includes the default", () => {
    const ids = palettes.map((palette) => palette.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(defaultPaletteId);
  });

  it("gives every palette the shades the tailwind config uses", () => {
    for (const palette of palettes) {
      expect(Object.keys(palette.primary).sort()).toEqual(
        ["100", "200", "400", "50", "500", "600", "700"].sort(),
      );
      expect(Object.keys(palette.ink).sort()).toEqual([
        "700",
        "800",
        "900",
        "950",
      ]);
    }
  });

  it("falls back to the first palette for an unknown id", () => {
    expect(getPalette("nope")).toBe(palettes[0]);
    expect(getPalette(null)).toBe(palettes[0]);
  });
});
