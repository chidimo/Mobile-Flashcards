import { getFieldError } from "../get-error-message";

describe("getFieldError", () => {
  it("returns the message", () => {
    expect(getFieldError({ type: "required", message: "Required" })).toBe(
      "Required"
    );
  });

  it("returns undefined without an error", () => {
    expect(getFieldError(undefined)).toBeUndefined();
  });
});
