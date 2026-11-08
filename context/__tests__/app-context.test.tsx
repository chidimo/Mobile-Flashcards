import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, create } from "react-test-renderer";

import { flashCardKey } from "@/constants";
import { FlashProvider, useFlash } from "../app-context";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/components/notifier", () => ({ showNotification: jest.fn() }));
jest.mock("expo-crypto", () => {
  let n = 0;
  return {
    randomUUID: () =>
      `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`,
  };
});

const deck = (id: string, title: string) => ({
  id,
  title,
  passMark: 50,
  addedOn: "2026-01-01",
  questions: [],
});

type Flash = ReturnType<typeof useFlash>;

const setup = async (stored?: object) => {
  await AsyncStorage.clear();
  if (stored) await AsyncStorage.setItem(flashCardKey, JSON.stringify(stored));
  const ref: { current: Flash | null } = { current: null };
  const Probe = () => {
    ref.current = useFlash();
    return null;
  };
  await act(async () => {
    create(
      <FlashProvider>
        <Probe />
      </FlashProvider>,
    );
  });
  return () => ref.current as Flash;
};

const titles = (flash: Flash) => (flash.deckOfCards ?? []).map((d) => d.title);
const store = {
  flashcards: { a: deck("a", "A"), b: deck("b", "B"), c: deck("c", "C") },
  myScores: null,
};

describe("deck order", () => {
  it("lists decks in stored order when none has been saved", async () => {
    const flash = await setup(store);

    expect(titles(flash())).toEqual(["A", "B", "C"]);
  });

  it("saves a new order and uses it", async () => {
    const flash = await setup(store);

    await act(async () => flash().reorderDecks(["c", "a", "b"]));

    expect(titles(flash())).toEqual(["C", "A", "B"]);
  });

  it("remembers the order after the app restarts", async () => {
    const flash = await setup(store);
    await act(async () => flash().reorderDecks(["b", "c", "a"]));
    const saved = JSON.parse(
      (await AsyncStorage.getItem(flashCardKey)) ?? "{}",
    );

    const reloaded = await setup(saved);

    expect(titles(reloaded())).toEqual(["B", "C", "A"]);
  });

  it("puts a new deck at the end of the order", async () => {
    const flash = await setup({ ...store, deckOrder: ["c", "a", "b"] });

    await act(async () => flash().addDeck("D", 50));

    expect(titles(flash())).toEqual(["C", "A", "B", "D"]);
  });

  it("forgets a deck's place when it is deleted", async () => {
    const flash = await setup({ ...store, deckOrder: ["c", "a", "b"] });

    await act(async () => flash().deleteDeck("a"));

    expect(titles(flash())).toEqual(["C", "B"]);
    const saved = JSON.parse(
      (await AsyncStorage.getItem(flashCardKey)) ?? "{}",
    );
    expect(saved.deckOrder).toEqual(["c", "b"]);
  });
});
