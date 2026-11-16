# Cloud sync: Google Drive, Dropbox and OneDrive

Created: 2026-11-13

Status: Planned for after 1.4 (archive + search). Supersedes the Drive-only plan ([google-drive-sync](2026-11-09-google-drive-sync.md)), whose Google Cloud setup and olamma-reuse notes still apply to the Drive provider.

Goal: decks follow a person across devices through storage they already own. Text only, no server of ours. On open, decks are loaded from the connected storage, and edits flow back (two-way).

## Providers (one connected at a time in v1)

|                  | Drive                                                | Dropbox                                                               | OneDrive                                                        |
| ---------------- | ---------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| Scope            | `drive.appdata` (hidden app folder)                  | "App folder" permission (`/Apps/<app>`)                               | `Files.ReadWrite.AppFolder` (`/drive/special/approot`)          |
| Auth native      | `@react-native-google-signin` (`getTokens()`)        | OAuth2 code + PKCE (`expo-auth-session`), `token_access_type=offline` | OAuth2 code + PKCE (MSAL-style public client), `offline_access` |
| Auth web         | Google token client (1 h tokens, no refresh)         | PKCE, refresh token works                                             | PKCE; SPA refresh tokens last only 24 h                         |
| Change detection | file `version` / `md5Checksum`, `changes` feed       | `rev`, `list_folder/continue` cursor                                  | `eTag`, delta query                                             |
| Safe overwrite   | `If-Match` not offered; re-read version before write | upload `mode: update` with `rev`                                      | `If-Match: eTag`                                                |
| Addressing       | by file id (keep a name→id map)                      | by path                                                               | by path                                                         |

All three give an app-scoped folder, so the app never sees other files. Each is a small `fetch` client, no vendor SDK.

```ts
interface StorageProvider {
  id: "drive" | "dropbox" | "onedrive";
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  list(): Promise<RemoteFile[]>; // { name, revision }
  read(name: string): Promise<string>;
  write(name: string, body: string, ifRevision?: string): Promise<RemoteFile>; // throws Conflict on stale revision
  remove(name: string): Promise<void>;
}
```

The sync engine only talks to this interface, so adding a provider is auth + about 50 lines, and tests use a fake provider.

## Remote layout

One file per deck, `deck-<id>.json`, self-contained:

```json
{ "schemaVersion": 1, "id": "...", "title": "...", "passMark": 70, "isArchived": false,
  "updatedAt": "2026-11-13T10:00:00Z", "questions": [...], "scores": [...] }
```

A deleted deck's file is replaced by a tombstone `{ "schemaVersion": 1, "id": "...", "deletedAt": "..." }`, purged after 30 days. No manifest: `list()` is the manifest, which avoids one more file to conflict on. `schemaVersion` lets the later chat plugin write the same files.

Deck order stays per device in v1 (new decks go last).

## Two-way sync: how it works

The hard part is knowing _who changed what_ without trusting clocks. Keep a local **sync record** per deck: `{ remoteRevision, syncedHash }`, the remote revision and a content hash at the last successful sync. Then for each deck id seen locally or remotely:

| Local vs last sync  | Remote vs last sync | Action                                                         |
| ------------------- | ------------------- | -------------------------------------------------------------- |
| unchanged           | unchanged           | nothing                                                        |
| changed             | unchanged           | upload (with the old revision, so a racing device is detected) |
| unchanged           | changed             | download, replace local                                        |
| changed             | changed             | **conflict**, see below                                        |
| new                 | absent              | upload                                                         |
| absent              | new                 | download                                                       |
| deleted (tombstone) | unchanged           | upload tombstone                                               |
| deleted             | changed             | keep the remote edit (an edit beats a delete)                  |
| unchanged           | tombstone           | delete local                                                   |

Change detection uses revisions and hashes, not clocks, so clock skew can't cause a wrong overwrite. `updatedAt` is only the tiebreak.

**Conflicts (both sides edited the same deck):**

- Merge cards by card id: a card present on one side only is kept (added there); a card edited on both sides takes the newer `updatedAt` (add per-card `updatedAt`).
- Scores are append-only: take the union by `date`.
- Deck title, pass mark and archive flag: newest `updatedAt` wins.
- If a card was edited on both sides, keep the losing version as a card in the same deck marked "(conflicting edit)" rather than dropping it. Nothing is silently lost.

**Concurrency:** every upload carries the revision it was based on; a `Conflict` means someone wrote in between, so re-read, re-merge, retry (bounded, 3 tries).

**When it runs:** on app open (local data renders immediately, merge runs in the background), about 5 s after an edit (debounced), when the app goes to background, and a manual "Sync now". One run at a time. Show last-synced time and the last error in Settings.

**Switching provider or first connect:** merge, never replace. Local decks upload, remote decks download; same-id decks go through the table above with no base record (treated as both changed, so merged). A pre-sync local backup is kept for one cycle.

**Sign out:** stops syncing, keeps local decks and the remote data. A separate "Delete my synced data" removes the remote files.

## Data model prerequisites

- `Deck.updatedAt` (bumped on any edit to the deck, its cards, archive flag or scores), `Question.updatedAt`, local `deletedDecks` tombstones, sync records. Migration: `updatedAt = addedOn`.
- `isArchived` (1.4) syncs with the deck.
- `ImportSchema` and file import/export keep the new fields optional.
- Tokens go in `expo-secure-store`, not AsyncStorage. This is an exception to the `lib/work-with-storage.ts` rule, so add a small wrapper beside it.

## Setup (owner)

- **Drive:** as in the Drive plan (Cloud project, consent screen in production, web + Android EAS + Android Play + iOS clients).
- **Dropbox:** create an app with the "App folder" type, scoped access with `files.content.read/write`, add redirect URIs (`mobile-flashcards://` and the web origin). Check Dropbox's rule for moving an app from development status to production, since development apps cap the number of linked users.
- **OneDrive:** Azure app registration for personal accounts, "Mobile and desktop" and "SPA" redirect URIs, `Files.ReadWrite.AppFolder`, `offline_access`. Check whether publisher verification is needed for outside users.
- Client IDs as `EXPO_PUBLIC_*` env vars; the provider's option is hidden when its ID is unset.
- Update the Play Data safety form and privacy policy (decks stored in the person's own Drive, Dropbox or OneDrive; nothing on our servers).

## Steps

1. Model fields, migration, tombstones (with tests).
2. Pure `planSync(local, remote, records)` returning `{ uploads, downloads, deletes, conflicts }` plus a pure deck merge function. Test every row of the table, skew, empty sides, first connect.
3. `StorageProvider` interface and a fake provider; sync engine with retries, debounce and a run lock.
4. Drive provider (port `google.ts` from olamma), then Dropbox, then OneDrive. Ship Drive first if the others slip.
5. Settings UI: provider picker, connect/disconnect (two functions, a `Switch` calls them), Sync now, last synced, errors.
6. Real-device and web tests with two accounts per provider, including offline edits on two devices and the conflict cases.
7. Privacy policy and store forms. Release as a minor version.

## Risks

- **Merge bugs lose data.** Pure planner, exhaustive tests, local backup before the first sync, conflicts keep both versions.
- **OneDrive web refresh tokens expire after 24 h**, and Drive web tokens after 1 h: show a clear "Reconnect" button.
- **Three auth flows** are the largest cost; the sync engine is shared.
- **Provider app review limits** (Dropbox development status, Microsoft verification) could delay public use.
- **Large decks** (many cards) make bigger files; fine for text, but upload only changed decks.

## Open questions

- Is one connected provider at a time enough, or should a person sync to two?
- Sync deck order across devices, or keep it per device?
- Per-card `updatedAt` from day one (recommended, because it makes conflicts mild), or deck-level first?
