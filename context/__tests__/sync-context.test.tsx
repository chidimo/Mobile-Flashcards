import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, create } from "react-test-renderer";

import { flashCardKey, syncProviderKey, syncRecordsKey } from "@/constants";
import { deckFileName, serializeDeck } from "@/lib/sync/remote-file";
import { ProviderDefinition } from "@/lib/sync/provider";
import { FakeProvider, makeDeck } from "@/lib/sync/__tests__/helpers";
import { FlashProvider, useFlash } from "../app-context";
import { SyncProvider, useSync } from "../sync-context";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/components/notifier", () => ({ showNotification: jest.fn() }));
jest.mock("expo-crypto", () => ({
  randomUUID: () => "00000000-0000-4000-8000-000000000001",
}));

const localDeck = {
  id: "local1",
  title: "Local",
  passMark: 50,
  addedOn: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  questions: [],
};

type Handles = {
  flash: ReturnType<typeof useFlash>;
  sync: ReturnType<typeof useSync>;
};

const definition = (
  cloud: FakeProvider,
  restored = true,
): ProviderDefinition => ({
  id: "fake",
  label: "Fake",
  isConfigured: () => true,
  connect: async () => cloud,
  restore: async () => (restored ? cloud : null),
  disconnect: jest.fn(async () => undefined),
});

const setup = async (
  cloud: FakeProvider,
  {
    stored,
    def,
    debounceMs = 60000,
  }: { stored?: object; def?: ProviderDefinition; debounceMs?: number } = {},
) => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    flashCardKey,
    JSON.stringify(
      stored ?? { flashcards: { local1: localDeck }, myScores: null },
    ),
  );
  const handles: { current: Handles | null } = { current: null };
  const Probe = () => {
    handles.current = { flash: useFlash(), sync: useSync() };
    return null;
  };
  await act(async () => {
    create(
      <FlashProvider>
        <SyncProvider
          providers={[def ?? definition(cloud)]}
          debounceMs={debounceMs}
        >
          <Probe />
        </SyncProvider>
      </FlashProvider>,
    );
  });
  return () => handles.current as Handles;
};

describe("SyncProvider", () => {
  it("is off until a service is connected", async () => {
    const h = await setup(new FakeProvider());

    expect(h().sync.status).toBe("off");
    expect(h().sync.connectedId).toBeNull();
  });

  it("uploads local decks and downloads remote ones on connect", async () => {
    const cloud = new FakeProvider();
    await cloud.write(
      deckFileName("remote1"),
      serializeDeck(makeDeck("remote1", { title: "Remote" })),
    );
    const h = await setup(cloud);

    await act(async () => h().sync.connect("fake"));

    expect(cloud.files.has(deckFileName("local1"))).toBe(true);
    expect(
      h()
        .flash.deckOfCards?.map((d) => d.title)
        .sort(),
    ).toEqual(["Local", "Remote"]);
    expect(h().sync.status).toBe("idle");
    expect(h().sync.lastSyncedAt).not.toBeNull();
    expect(await AsyncStorage.getItem(syncProviderKey)).toBe(
      JSON.stringify("fake"),
    );
  });

  it("syncs again after the decks change, without a tap", async () => {
    const cloud = new FakeProvider();
    const h = await setup(cloud, { debounceMs: 10 });
    await act(async () => h().sync.connect("fake"));

    await act(async () => h().flash.updateDeck("local1", "Renamed", 50));
    await act(async () => new Promise((r) => setTimeout(r, 60)));

    const uploaded = JSON.parse(
      cloud.files.get(deckFileName("local1"))!.content,
    );
    expect(uploaded.title).toBe("Renamed");
  });

  it("goes back in on launch when a service was connected", async () => {
    const cloud = new FakeProvider();
    await AsyncStorage.clear();
    await AsyncStorage.setItem(syncProviderKey, JSON.stringify("fake"));
    const h = await setupWithSavedProvider(cloud);

    expect(cloud.files.has(deckFileName("local1"))).toBe(true);
    expect(h().sync.connectedId).toBe("fake");
  });

  it("asks to sign in again when the saved session is gone", async () => {
    const cloud = new FakeProvider();
    const h = await setupWithSavedProvider(cloud, definition(cloud, false));

    expect(h().sync.status).toBe("error");
    expect(h().sync.error).toContain("Sign in again");
    expect(cloud.files.size).toBe(0);
  });

  it("shows the error when a sync fails and recovers on the next", async () => {
    const cloud = new FakeProvider();
    const h = await setup(cloud);
    await act(async () => h().sync.connect("fake"));

    const realList = cloud.list.bind(cloud);
    cloud.list = async () => {
      throw new Error("Offline");
    };
    await act(async () => h().sync.syncNow());
    expect(h().sync.status).toBe("error");
    expect(h().sync.error).toBe("Offline");

    cloud.list = realList;
    await act(async () => h().sync.syncNow());
    expect(h().sync.status).toBe("idle");
    expect(h().sync.error).toBeNull();
  });

  it("disconnecting stops syncing, keeps the local decks and forgets the baselines", async () => {
    const cloud = new FakeProvider();
    const def = definition(cloud);
    const h = await setup(cloud, { def });
    await act(async () => h().sync.connect("fake"));

    await act(async () => h().sync.disconnect());

    expect(h().sync.status).toBe("off");
    expect(def.disconnect).toHaveBeenCalled();
    expect(h().flash.deckOfCards).toHaveLength(1);
    expect(await AsyncStorage.getItem(syncProviderKey)).toBeNull();
    expect(await AsyncStorage.getItem(syncRecordsKey)).toBeNull();
  });
});

async function setupWithSavedProvider(
  cloud: FakeProvider,
  def = definition(cloud),
) {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(syncProviderKey, JSON.stringify("fake"));
  await AsyncStorage.setItem(
    flashCardKey,
    JSON.stringify({ flashcards: { local1: localDeck }, myScores: null }),
  );
  const handles: { current: Handles | null } = { current: null };
  const Probe = () => {
    handles.current = { flash: useFlash(), sync: useSync() };
    return null;
  };
  await act(async () => {
    create(
      <FlashProvider>
        <SyncProvider providers={[def]} debounceMs={60000}>
          <Probe />
        </SyncProvider>
      </FlashProvider>,
    );
  });
  await act(async () => new Promise((r) => setTimeout(r, 20)));
  return () => handles.current as Handles;
}
