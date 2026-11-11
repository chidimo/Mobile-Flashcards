# Sync decks across devices with Google Drive

Created: 2026-11-09

Status: Planned. Starts after the 1.3.0 release and the web deployment ([web plan](2026-11-09-web-deploy.md)); nothing is built yet.

Goal: a person signs in with Google once per device and their decks follow them (phone, PC web). Text only, no server of ours.

## Design

- **Storage:** the Drive `appDataFolder` (scope `https://www.googleapis.com/auth/drive.appdata`). A hidden folder only this app can read; the app never sees the person's other Drive files. It is a non-sensitive scope, so no Google security review is expected.
- **Local first:** `lib/work-with-storage.ts` stays the source of truth and the app works fully offline and signed out. Drive is a sync target, opt-in from Settings.
- **Layout:** one `manifest.json` (deck ids, `updatedAt`, deleted ids) plus one `deck-<id>.json` per deck, so two devices editing different decks never clash.
- **Merge:** last-write-wins per deck by `updatedAt`. Deleting a deck leaves a tombstone (id + `deletedAt`) so it doesn't come back from another device. Per-card merge is a later option, not v1.
- **When it syncs:** on app open, shortly after a change (debounced), and a "Sync now" button. Show last-synced time and any error in Settings.
- **Sign out:** stops syncing, keeps the local decks, leaves Drive data in place. A separate "Delete my synced data" removes the Drive files.

## Data model change (prerequisite)

`Deck` has only `addedOn`; there is no `updatedAt`, no per-card timestamps and no tombstones. Add:

- `updatedAt` on `Deck`, set on every change to the deck, its cards or its scores.
- A local `deletedDecks` list of `{ id, deletedAt }`.
- A migration that sets `updatedAt = addedOn` for existing decks.
- Decide whether scores (the scoreboard) sync with the deck or stay per device. Default: sync them with the deck.
- Update `ImportSchema` and deck import/export so the new fields are optional.

## Reuse from olamma

Sign-in is already solved in `/Users/chidimo001/projects/olamma/apps/mobile`:

- `src/auth/google.ts`: configure once, `hasPlayServices`, `signIn`, cancel and `IN_PROGRESS` handling, Play-services error text, and `signOut`. Copy the shape.
- `app.config.js`: turns `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` into the reversed URL scheme for the plugin. Copy it.
- README "Google sign-in" and "The three keys" sections: the OAuth client checklist and the fingerprint rules below come from there.

**What differs here:** olamma needs an ID token for its backend. We need an access token for Drive.

- Native: `GoogleSignin.configure({ scopes: [driveAppdataScope], webClientId })`, then `GoogleSignin.getTokens()` for the access token (the library refreshes it silently).
- Web: olamma's web app uses the Google Identity Services "Sign in" button (`accounts.id`). We need the token client (`google.accounts.oauth2.initTokenClient` with the Drive scope). Access tokens last about 1 hour and a static site has no refresh token, so re-request silently and fall back to a prompt.

## Google Cloud setup (owner)

Use a separate Google Cloud project from olamma, so the consent screen, app name and logo say "Mobile Flashcards".

1. Enable the Google Drive API.
2. OAuth consent screen: app name, logo, support email, privacy policy URL, add the `drive.appdata` scope, **publish to "In production"** (in "Testing" tokens expire after 7 days).
3. OAuth clients:
   - **Web** (also the `webClientId` for native), with the deployed web origin(s) as authorized JavaScript origins.
   - **Android** for `com.chidimo.mobileflashcards` with the **EAS key** SHA-1 (sideloaded and preview APKs).
   - A second **Android** client with the **Play app signing key** SHA-1 (store installs). Without it sign-in fails on store installs only.
   - **iOS** for `com.chidimo.mobileflashcards`; set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` in `eas.json`.
4. Add the client IDs as `EXPO_PUBLIC_GOOGLE_*` env vars in `eas.json` and the web build. Unset means the sync UI is hidden.

## Steps

1. Add the model fields, tombstones and migration, with tests (`updatedAt` bumps, deleting records a tombstone).
2. Write a pure merge function `merge(local, remote)` → `{ decks, uploads, deletes }`. Unit-test it hard: new on either side, edited on both, deleted on one side and edited on the other, clock skew, empty remote.
3. Drive client over `fetch` (no heavy SDK): list/get/create/update/delete in `appDataFolder`, with 401 → refresh token → retry once and 429/5xx backoff.
4. Port `google.ts` from olamma, adapted for the Drive scope and the web token client. Keep a one-line interface: `getAccessToken()`.
5. Sync engine: run on open, on change (debounced), and manually; guard against concurrent runs; record last-synced and last error.
6. Settings UI: "Sync with Google Drive" (sign in / sign out via two functions per the project rule, a `Switch` that calls them), last-synced time, "Sync now", "Delete my synced data".
7. First-sync rule: when both sides already have decks, merge them rather than replace either. Never delete local data without a tombstone.
8. Add `drive.appdata` handling to the Play Data safety form and the privacy policy (we store the person's decks in their own Drive; nothing on our servers).
9. Tests for the engine with a fake Drive client; keep typecheck, lint, knip, prettier green. Test on a real Android phone and the web build with two Google accounts.
10. Release as a minor version after web, behind the Settings toggle.

## Risks

- **Merge bugs lose data.** Mitigate with the pure merge function and exhaustive tests; keep a local backup of the pre-sync state for one cycle.
- **Wrong or missing SHA-1** gives a sign-in error on one build type. Follow the checklist above.
- **Web token expiry** causes a re-prompt about hourly; use silent re-auth where possible and surface a clear "Reconnect" button.
- **Google-only.** Anyone without a Google account keeps using export/import.
- **Two devices editing the same deck at once** loses the older edit (last-write-wins). Acceptable for v1; per-card merge later.

## Open questions

- Sync scores or keep them per device?
- Per-card timestamps in v1, or deck-level only?
- Do we also need Sign in with Apple on iOS? Apple requires it only when other third-party sign-in is the _app's login_; here Drive is an optional storage link, so likely not, but check the App Store guideline before submitting.
- Does this replace the roadmap's "Add a backend" item, or only its sync half?
