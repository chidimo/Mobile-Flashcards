import { ImportSchema } from "../generic";

const deck = {
  id: "d1",
  title: "Deck",
  passMark: 70,
  questions: [{ id: "q1", question: "Q", answer: "A" }],
};

describe("ImportSchema", () => {
  it("accepts a valid deck", () => {
    expect(ImportSchema.safeParse(deck).success).toBe(true);
  });

  it("accepts passMark as a string", () => {
    expect(ImportSchema.safeParse({ ...deck, passMark: "70" }).success).toBe(
      true
    );
  });

  it("rejects a question without an answer", () => {
    const bad = { ...deck, questions: [{ id: "q1", question: "Q" }] };
    expect(ImportSchema.safeParse(bad).success).toBe(false);
  });
});
