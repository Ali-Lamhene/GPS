# CLAUDE.md

Guidance for Claude Code in this repository. Everything under `.claude/` is committed; personal overrides go in `.claude/settings.local.json` (git-ignored).

## Product

A GPS navigation app for people who cannot read: refugees accompanied by social workers who miss appointments because mainstream GPS apps need reading, or do not speak their language. Two personas: the **traveller**, whose interface contains **no text and no numbers**, and the **social worker**, who prepares the trip and whose interface may contain text.

Read `docs/product/personas.md`, `docs/product/principes.md` and `docs/product/decisions.md` before any product or UI work. The principles in short: zero text, one screen one decision, every instruction on at least two channels, large targets and high contrast, reassurance and help always one gesture away, culturally neutral pictograms, location stays on the device.

**Security is non-negotiable.** Some travellers are watched by their home governments and the associations helping them are frequent hacking targets. No account, no identity data, no server of ours storing routes, addresses or positions, no analytics or crash reporting that sends device data. Routes travel inside the shared link itself. Any third-party call must be justified in the spec with the data it receives. See `docs/product/decisions.md` (D1).

## Session continuity

`docs/status.md` is the handoff between sessions: where we are, next step, open product questions, what waits on the user. A `SessionStart` hook injects it with the recent git log.

- When the user says "reprenons" (or "on reprend", "où en est-on"), answer from that context: where we are, the next step, the open questions that block it. Then propose to start the next step. Do not re-explore the repo to rebuild that picture.
- Update `docs/status.md` at the end of every task, in the same commit: move done items, set the next step, add or close open questions and pending user actions.

## Workflow

The user works alone, directly on `main`. One feature = one commit.

**Spec first, always.** Before building any new feature, screen or user-facing behaviour change, run the `feature` skill: interview the user with questions until no gap remains, write the spec in `docs/specs/`, get it validated, then implement. Never fill a missing requirement with a silent guess; ask, or write it down as an explicit assumption. If a new unknown appears mid-implementation, stop and ask. Exempt: bug fixes restoring specified behaviour, refactors with no visible change, tooling, docs.

Before committing UI work, check it on screen with the `verify-on-device` skill and have the `ux-sans-texte-reviewer` agent review traveller-facing changes. Before committing anything that touches `package.json`, `app.json`, `src/services/`, share link decoding, routes, permissions, storage or network calls, have the `security-reviewer` agent review it.

Specs and product docs are written in French; code, comments and commit messages in English.

## Technical context

Expo rules, commands and routing conventions live in `AGENTS.md` (imported by the root `CLAUDE.md`). Package manager is **npm**. For Expo work, use the `expo:*` skills, starting with `expo:expo-overview`.

- **Read `docs/engineering/code.md` and `docs/engineering/securite.md` before writing code.** They set the folder layout (`src/app`, `src/features`, `src/domain`, `src/services`, `src/ui`), component, TypeScript, error and test rules, and the security rules derived from D1.
- Traveller UI lives in `src/features/traveller/`, social worker UI in `src/features/social-worker/`. Route files in `src/app/` stay thin and render those.
- UI comes from the Claude Design system « GPS sans texte »: tokens and shared components in `src/ui/`, following the `expo:expo-design-system` skill. Use `expo:expo-native-ui`, `expo:expo-ui` and `expo:expo-animation` for native controls, motion and haptics.
- ESLint rule `gps/no-text-in-traveller-ui` (local plugin in `eslint/`) forbids displayed text in `src/features/traveller/`. Do not disable it; if a case seems to need text, ask the user.
- ESLint also forbids in `src/`: `console.*`, `any`, non-null `!`, `eval`, and imports of tracking SDKs listed in `eslint/forbidden-packages.js` (a Jest test checks `package.json` against the same list). Do not disable these rules.
- A `PostToolUse` hook runs Prettier on every file Claude edits in the project.

## Quality gates

`npm run check` runs lint (zero warnings), typecheck, Prettier check and Jest with coverage. Run it before declaring a task done; CI (`.github/workflows/ci.yml`) runs the same plus `expo-doctor`, a JS bundle export per platform, `npm run audit` (audit-ci, allowlist in `audit-ci.jsonc`) and, on pull requests, dependency review and commitlint.

- Git hooks (husky): pre-commit runs lint-staged, commit-msg enforces Conventional Commits, pre-push runs typecheck and tests. Never bypass them with `--no-verify`.
- Tests live in `__tests__/` folders as `<name>-test.ts(x)` (jest-expo preset). Never put test files under `src/app/`: every file there is a route.
- TypeScript is strict with `noUncheckedIndexedAccess`.
