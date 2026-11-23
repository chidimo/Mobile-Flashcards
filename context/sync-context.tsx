import { useFlash } from "@/context/app-context";
import { syncProviderKey, syncRecordsKey, syncStatusKey } from "@/constants";
import { createAppSyncStore } from "@/lib/sync/app-sync-store";
import { SyncEngine } from "@/lib/sync/engine";
import { ProviderDefinition, StorageProvider } from "@/lib/sync/provider";
import { providers as defaultProviders } from "@/lib/sync/providers";
import { SyncRecord } from "@/lib/sync/types";
import {
  readFromStorage,
  removeFromStorage,
  setItemToStorage,
} from "@/lib/work-with-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

export type SyncStatus = "off" | "idle" | "syncing" | "error";

interface SyncContext {
  /** The services this build offers. */
  providers: ProviderDefinition[];
  /** The connected service's id, or null. */
  connectedId: string | null;
  status: SyncStatus;
  lastSyncedAt: string | null;
  error: string | null;
  connect: (id: string) => Promise<void>;
  disconnect: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const SyncCtx = createContext<SyncContext | null>(null);

/** Wait this long after the last change before syncing. */
const DEBOUNCE_MS = 5000;

type Props = {
  children: React.ReactNode;
  providers?: ProviderDefinition[];
  debounceMs?: number;
};

export function SyncProvider({
  children,
  providers = defaultProviders,
  debounceMs = DEBOUNCE_MS,
}: Readonly<Props>) {
  const flash = useFlash();
  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>("off");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<SyncEngine | null>(null);
  const flashRef = useRef(flash);
  flashRef.current = flash;
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  const makeEngine = useCallback((provider: StorageProvider) => {
    const store = createAppSyncStore(
      {
        readStore: () => flashRef.current.readStore(),
        applyChanges: (changes) => flashRef.current.applySyncChanges(changes),
      },
      {
        load: () => readFromStorage<Record<string, SyncRecord>>(syncRecordsKey),
        save: (records) => setItemToStorage(records, syncRecordsKey),
      },
    );
    return new SyncEngine(provider, store);
  }, []);

  const syncNow = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine || !flashRef.current.isLoaded) return;
    if (pending.current) clearTimeout(pending.current);
    pending.current = null;
    setStatus("syncing");
    try {
      await engine.sync();
      const at = new Date().toISOString();
      setLastSyncedAt(at);
      setError(null);
      setStatus("idle");
      await setItemToStorage({ lastSyncedAt: at }, syncStatusKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed.");
      setStatus("error");
    }
  }, []);

  // Back in with the saved service on launch, then sync once.
  useEffect(() => {
    if (!flash.isLoaded) return;
    void (async () => {
      const id = await readFromStorage<string>(syncProviderKey);
      const saved = await readFromStorage<{ lastSyncedAt?: string }>(
        syncStatusKey,
      );
      if (saved?.lastSyncedAt) setLastSyncedAt(saved.lastSyncedAt);
      const definition = providers.find((p) => p.id === id);
      if (!definition) return;
      try {
        const provider = await definition.restore();
        if (!provider) {
          setConnectedId(definition.id);
          setError("Sign in again to keep syncing.");
          setStatus("error");
          return;
        }
        engineRef.current = makeEngine(provider);
        setConnectedId(definition.id);
        await syncNow();
      } catch (e) {
        setConnectedId(definition.id);
        setError(e instanceof Error ? e.message : "Couldn't reconnect.");
        setStatus("error");
      }
    })();
  }, [providers, makeEngine, syncNow, flash.isLoaded]);

  // A little after the last change, and as the app goes to the background.
  useEffect(() => {
    if (!engineRef.current || status === "syncing") return;
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => void syncNow(), debounceMs);
    return () => {
      if (pending.current) clearTimeout(pending.current);
    };
    // Runs when the decks change; `status` is read, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash.deckOfCards, flash.archivedDecks, connectedId]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" && pending.current) void syncNow();
    });
    return () => sub.remove();
  }, [syncNow]);

  const value = useMemo<SyncContext>(
    () => ({
      providers,
      connectedId,
      status: connectedId ? status : "off",
      lastSyncedAt,
      error,
      syncNow,
      async connect(id: string) {
        const definition = providers.find((p) => p.id === id);
        if (!definition) throw new Error(`Unknown storage service: ${id}`);
        const provider = await definition.connect();
        engineRef.current = makeEngine(provider);
        await setItemToStorage(id, syncProviderKey);
        setConnectedId(id);
        setError(null);
        await syncNow();
      },
      async disconnect() {
        const definition = providers.find((p) => p.id === connectedId);
        if (pending.current) clearTimeout(pending.current);
        engineRef.current = null;
        await definition?.disconnect();
        await removeFromStorage(syncProviderKey);
        await removeFromStorage(syncRecordsKey);
        setConnectedId(null);
        setStatus("off");
        setError(null);
      },
    }),
    [providers, connectedId, status, lastSyncedAt, error, syncNow, makeEngine],
  );

  return <SyncCtx.Provider value={value}>{children}</SyncCtx.Provider>;
}

export function useSync() {
  const context = useContext(SyncCtx);
  if (!context) throw new Error("useSync must be used within a SyncProvider");
  return context;
}
