import { cn } from "../cn";

describe("cn", () => {
  it("joins strings and skips falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("keeps the keys of an object whose value is on", () => {
    expect(cn("a", { b: true, c: false, d: null })).toBe("a b");
  });

  it("returns an empty string for nothing", () => {
    expect(cn()).toBe("");
  });
});
