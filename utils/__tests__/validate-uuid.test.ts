import { isValidV4UUID } from "../validate-uuid";

describe("isValidV4UUID", () => {
  it("accepts a v4 uuid", () => {
    expect(isValidV4UUID("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")).toBe(true);
  });

  it("rejects a non-v4 uuid", () => {
    expect(isValidV4UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(false);
  });

  it("rejects junk, empty and null", () => {
    expect(isValidV4UUID("not-a-uuid")).toBe(false);
    expect(isValidV4UUID("")).toBe(false);
    expect(isValidV4UUID(null)).toBe(false);
  });
});
