# Project standards

- Keep code comments and docstrings short. State the non-obvious rule in one line; don't restate history, alternatives considered, or every downstream consequence. If an example gets the point across faster than an explanation, use the example instead of prose.

- No nested or complex ternaries (`a ? x : b ? y : z`, or a ternary whose branches are long JSX). When there are more than two outcomes, use early returns in a small component or helper or an `if / else if` chain; for a value, a small function or a lookup object. A single `cond ? a : b` or `cond ? <X /> : null` is fine.

- `useState` pairs follow the hook convention `[thing, setThing]`: the setter is `set` plus the exact state name.

- No boolean flag that picks which action a function takes (`savePref(enabled)`). Write two functions (`enablePref()` / `disablePref()`). A flag that only changes a value or an option is fine; the one unavoidable place to branch is a UI control that reports a single on/off value (a `Switch`), and it should call the two functions.

- Persistent storage goes through `lib/work-with-storage.ts`, never `AsyncStorage` directly.

## Git branching workflow

- `master` is the deploy branch — always production-ready.
- `dev` is the integration branch. New work branches off `dev` (or off the exact branch it stacks on top of), and PRs target `dev`, not `master`.
- Occasionally `dev` is merged into `master` as a release. Right after that merge, sync `dev` back to `master`'s tip:
  ```
  git checkout dev && git reset --hard origin/master && git push --force-with-lease origin dev
  ```
  A plain `git merge --ff-only` will *not* work if GitHub's squash-merge gave the same content a different commit SHA on each branch.
- After any PR merges, delete its branch both locally and on `origin`.
- Commit subjects and PR titles are both prefixed with a matching [gitmoji.dev](https://gitmoji.dev) emoji (✨ feature, 🐛 fix, 💥 breaking change, ✏️ copy/rename, etc.) — one prefix per commit/PR, matching the change type.
