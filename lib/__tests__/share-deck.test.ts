import { shareDeckFile } from "../share-deck";

const mockCreate = jest.fn();
const mockWrite = jest.fn();
const mockShare = jest.fn();
let mockAvailable = true;
let mockPath: unknown[] = [];

jest.mock("expo-file-system", () => ({
  Paths: { cache: "cache-dir" },
  File: class {
    uri = "file:///cache/spanish.json";
    constructor(...path: unknown[]) {
      mockPath = path;
    }
    create(options: unknown) {
      mockCreate(options);
    }
    write(content: string) {
      mockWrite(content);
    }
  },
}));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: async () => mockAvailable,
  shareAsync: (...args: unknown[]) => mockShare(...args),
}));

const deck = {
  id: "d1",
  title: "Spanish",
  passMark: 70,
  addedOn: "2026-01-01",
  questions: [{ id: "q1", question: "Hola?", answer: "Hello" }],
};

beforeEach(() => {
  mockCreate.mockReset();
  mockWrite.mockReset();
  mockShare.mockReset();
  mockAvailable = true;
});

describe("shareDeckFile", () => {
  it("writes the deck to a json file in the cache and shares it", async () => {
    await shareDeckFile(deck);

    expect(mockPath).toEqual(["cache-dir", "spanish.json"]);
    expect(mockCreate).toHaveBeenCalledWith({ overwrite: true });
    expect(JSON.parse(mockWrite.mock.calls[0][0])).toMatchObject({
      id: "d1",
      title: "Spanish",
    });
    expect(mockShare).toHaveBeenCalledWith(
      "file:///cache/spanish.json",
      expect.objectContaining({ mimeType: "application/json" }),
    );
  });

  it("says so when sharing isn't available", async () => {
    mockAvailable = false;

    await expect(shareDeckFile(deck)).rejects.toThrow("isn't available");
    expect(mockShare).not.toHaveBeenCalled();
  });
});
