import { hashDeck } from "./deck-hash";
import { SyncInput, SyncPlan } from "./types";

/**
 * Decides what to do for each deck by comparing three things: the local deck, the remote file, and
 * what the last sync saw (the record). Change is detected from content hashes and remote revisions,
 * never from clocks. Pure: it lists the work, the engine does it.
 *
 * Rules that keep data safe: nothing is deleted locally without a remote tombstone for an unedited
 * deck, and an edit always beats a delete.
 */
export const planSync = ({
  decks,
  deleted,
  remote,
  records,
}: SyncInput): SyncPlan => {
  const plan: SyncPlan = {
    uploads: [],
    downloads: [],
    tombstones: [],
    deletes: [],
    conflicts: [],
    forget: [],
  };
  const ids = new Set([
    ...Object.keys(decks),
    ...Object.keys(deleted),
    ...Object.keys(remote),
    ...Object.keys(records),
  ]);

  for (const id of ids) {
    const local = decks[id];
    const deletedAt = deleted[id];
    const file = remote[id];
    const record = records[id];

    const localChanged =
      !!local && (!record || hashDeck(local) !== record.hash);
    const remoteChanged =
      !!file && (!record || file.revision !== record.revision);
    const remoteLive = !!file && file.deletedAt === undefined;
    const remoteGone = !!file && file.deletedAt !== undefined;

    if (local) {
      if (!file) {
        // New here, or the remote file vanished: send it rather than ever deleting local data.
        plan.uploads.push({ id });
      } else if (remoteGone) {
        if (localChanged) plan.uploads.push({ id, ifRevision: file.revision });
        else plan.deletes.push(id);
      } else if (!localChanged && !remoteChanged) {
        // In step.
      } else if (localChanged && !remoteChanged) {
        plan.uploads.push({ id, ifRevision: file.revision });
      } else if (!localChanged && remoteChanged) {
        plan.downloads.push({ id, revive: false });
      } else {
        plan.conflicts.push({ id, ifRevision: file.revision });
      }
      continue;
    }

    if (deletedAt !== undefined) {
      if (remoteLive) {
        if (remoteChanged) plan.downloads.push({ id, revive: true });
        else plan.tombstones.push({ id, deletedAt, ifRevision: file.revision });
      }
      // Remote already a tombstone or absent: nothing to tell it.
      continue;
    }

    if (remoteLive) plan.downloads.push({ id, revive: false });
    else if (record) plan.forget.push(id);
  }

  return plan;
};
