# Web deployment

Created: 2026-11-09

Status: Planned. Starts after the 1.3.0 store release; nothing is built yet.

Goal: ship the existing Expo app as a static website that people can use on a PC. No separate web codebase.

## Approach

- `react-native-web` is already installed and `app.json` already sets `web.output: "static"` with a favicon.
- Build with `npx expo export --platform web` (output in `dist/`). Host it as static files.
- One PR off `dev`, targeting `dev`, with a ✨ prefix.

## Known limits (tell users)

- Decks live in the browser's `localStorage` (via `lib/work-with-storage.ts`). They are per browser and per device, and clearing site data erases them.
- The phone and PC copies don't sync. Export/import of decks is the bridge until a backend exists (see roadmap).

## Steps

1. **Spike (no commit).** Run `yarn web` and `expo export -p web`; click through every screen and note what breaks.
2. **Layout.** Add a max-width centered column so wide screens don't stretch; check the drawer on a wide viewport (permanent vs overlay).
3. **Export/share.** `lib/share-deck.ts` uses `expo-sharing`, which doesn't work on web. Add a web branch that downloads the deck JSON as a file. Keep the native path unchanged.
4. **Import.** Confirm `expo-document-picker` import and `lib/document-parser.ts` work in the browser.
5. **Clipboard.** Confirm `hooks/use-clipboard.tsx` works (needs HTTPS or localhost; paste may need a user gesture).
6. **Reordering.** Check drag-to-reorder decks with a mouse.
7. **Markdown and code blocks.** Check rendering and dark mode on web.
8. **Polish.** Page title, favicon, meta description, theme colour, keyboard focus states.
9. **Tests.** Cover the new web download branch; keep `yarn test`, typecheck, lint, knip and prettier green.
10. **Scripts and CI.** Add a `build:web` script (`expo export --platform web`). Make sure CI still passes.
11. **Hosting setup (owner).** Pick a static host, point it at `dist/`, and add an SPA fallback rule so deep links like `/<deckId>/...` don't 404. Add HTTPS.
12. **Docs.** A short README section on building and deploying the web version.

## Done when

- Home, deck, quiz, add/edit card, import/export and settings all work in desktop Chrome, Firefox and Safari.
- A deployed URL works after a hard refresh on a deep link.
- Native builds are unaffected.

## Open questions

- Which host, and which domain?
- Should the web version have its own short "data stays in this browser" notice in Settings?
- Do we want it installable as a PWA later?
