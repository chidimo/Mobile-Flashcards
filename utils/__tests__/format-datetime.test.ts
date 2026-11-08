import { formatDate } from "../format-datetime";

describe("formatDate", () => {
  it("returns an empty string without a date", () => {
    expect(formatDate()).toBe("");
  });

  it("formats the date", () => {
    expect(formatDate("2024-03-05T10:00:00")).toBe("Tue, 05 Mar 2024");
  });

  it("includes the time when asked", () => {
    expect(formatDate("2024-03-05T14:07:09", true)).toBe(
      "Tue, 05 Mar 2024 @ 2:07:09 PM",
    );
  });
});
