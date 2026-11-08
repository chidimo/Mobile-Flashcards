import { act, create } from "react-test-renderer";

import { useClipboard } from "../use-clipboard";

let mockStored = "";
let mockDropsWrites = false;

jest.mock("expo-clipboard", () => ({
  setStringAsync: async (text: string) => {
    if (!mockDropsWrites) mockStored = text;
    return true;
  },
  getStringAsync: async () => mockStored,
}));

const setup = () => {
  const ref: { current: ReturnType<typeof useClipboard> | null } = {
    current: null,
  };
  const Probe = () => {
    ref.current = useClipboard();
    return null;
  };
  act(() => {
    create(<Probe />);
  });
  return () => ref.current as ReturnType<typeof useClipboard>;
};

beforeEach(() => {
  mockStored = "";
  mockDropsWrites = false;
});

describe("useClipboard", () => {
  it("reports a copy that landed", async () => {
    const clipboard = setup();

    await expect(clipboard().copyToClipboard("hello")).resolves.toBe(true);
    expect(mockStored).toBe("hello");
  });

  it("reports a copy the system dropped, even though the write didn't throw", async () => {
    mockDropsWrites = true;
    const clipboard = setup();

    await expect(clipboard().copyToClipboard("hello")).resolves.toBe(false);
  });

  it("reads what was copied", async () => {
    mockStored = "pasted";
    const clipboard = setup();
    const received: string[] = [];

    await clipboard().fetchCopiedText((text) => received.push(text));

    expect(received).toEqual(["pasted"]);
  });
});
