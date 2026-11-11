import { act, create } from "react-test-renderer";

import { QuizQuestion } from "../quiz-question";

const mockAnswer = jest.fn();
let mockPeek = true;
let mockShowHint = false;

// The real icon loads a font asynchronously and logs after the test has finished.
jest.mock("@react-native-vector-icons/feather", () => () => null);
jest.mock("@/context/quiz-context", () => ({
  useQuiz: () => ({
    showHint: mockShowHint,
    peekAnswer: mockPeek,
    allowBack: false,
    answers: [],
    currentPosition: 0,
    onAnswerQuestion: (side: string) => mockAnswer(side),
    onPreviousQuestion: jest.fn(),
    onEndQuiz: jest.fn(),
  }),
}));

const card = {
  id: "q1",
  question:
    "What does `gap` do?\n```css\n.row { display: flex; gap: 8px; }\n```",
  answer: "It sets the **gutter** of the flex items.",
};

const render = (
  qs: { id: string; question: string; answer: string; hint?: string } = card,
) => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<QuizQuestion qs={qs} />);
  });
  const byLabel = (label: string) =>
    tree.root.findAll(
      (node) =>
        node.props.accessibilityLabel === label &&
        typeof node.type !== "string",
    )[0];
  const text = () => JSON.stringify(tree.toJSON());
  return { byLabel, text };
};

beforeEach(() => {
  mockAnswer.mockReset();
  mockPeek = true;
  mockShowHint = false;
});

describe("QuizQuestion", () => {
  it("renders the question as markdown, code included", () => {
    const { text } = render();

    expect(text()).toContain("What does ");
    expect(text()).toContain("flex");
    expect(text()).not.toContain("```");
  });

  it("hides the answer until Show answer is pressed", () => {
    const { byLabel, text } = render();
    expect(text()).not.toContain("gutter");

    act(() => byLabel("Show answer").props.onPress());

    expect(text()).toContain("gutter");
    expect(text()).toContain("Answer");
    expect(byLabel("Hide answer")).toBeDefined();
  });

  it("hides the answer again", () => {
    const { byLabel, text } = render();

    act(() => byLabel("Show answer").props.onPress());
    act(() => byLabel("Hide answer").props.onPress());

    expect(text()).not.toContain("gutter");
  });

  it("has no peek control when peeking is off", () => {
    mockPeek = false;
    const { byLabel } = render();

    expect(byLabel("Show answer")).toBeUndefined();
  });

  it("shows the hint when the card has one", () => {
    mockShowHint = true;
    const { text } = render({ ...card, hint: "Think gutters" });

    expect(text()).toContain("Hint:");
    expect(text()).toContain("Think gutters");
  });

  it("shows no hint line for a card without one", () => {
    mockShowHint = true;
    const { text } = render();

    expect(text()).not.toContain("Hint");
    expect(text()).not.toContain("N/A");
  });

  it("answers from the buttons", () => {
    const { byLabel } = render();

    act(() => byLabel("Got it!").props.onPress());

    expect(mockAnswer).toHaveBeenCalledWith("right");
  });
});
