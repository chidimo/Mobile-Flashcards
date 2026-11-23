import { StoreValue } from "@/types/generic";
import { SyncStore } from "./engine";
import { snapshotFromStore, StoreChanges } from "./store-adapter";
import { SyncRecord } from "./types";

type AppSide = {
  /** The app's latest data, not a stale render. */
  readStore: () => StoreValue;
  applyChanges: (changes: StoreChanges) => void;
};

type RecordsSide = {
  load: () => Promise<Record<string, SyncRecord> | null>;
  save: (records: Record<string, SyncRecord>) => Promise<void>;
};

/** Connects the sync engine to the app's own data and to the saved baselines. */
export const createAppSyncStore = (
  app: AppSide,
  records: RecordsSide,
): SyncStore => ({
  async read() {
    return {
      ...snapshotFromStore(app.readStore()),
      records: (await records.load()) ?? {},
    };
  },
  async write({ put, remove, clearDeleted, records: next }) {
    // Skip when nothing changed so a no-op sync doesn't re-render the app or trigger another sync.
    if (put.length || remove.length || clearDeleted.length) {
      app.applyChanges({ put, remove, clearDeleted });
    }
    await records.save(next);
  },
});
