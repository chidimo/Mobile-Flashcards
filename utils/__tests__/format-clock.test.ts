import { formatClock } from "../format-clock";

describe("formatClock", () => {
  it("formats minutes and zero-padded seconds", () => {
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(600)).toBe("10:00");
    expect(formatClock(9)).toBe("0:09");
  });

  it("never goes below zero", () => {
    expect(formatClock(-3)).toBe("0:00");
    expect(formatClock(0)).toBe("0:00");
  });
});
