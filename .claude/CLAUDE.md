# CLAUDE.md

Guidance for Claude Code in this repository. Everything under `.claude/` is committed; personal overrides go in `.claude/settings.local.json` (git-ignored).

## Product

A GPS navigation app for people who cannot read: refugees accompanied by social workers who miss appointments because mainstream GPS apps need reading, or do not speak their language. The app must work **without any text** in the traveller's interface.

Two personas:

- **Traveller**: cannot read (or not in any language the app could offer). Often a low-end Android phone, limited mobile data, sometimes no data at all. May be stressed, in an unfamiliar city.
- **Social worker**: literate, prepares the trip for the traveller (destination, appointment time). Their interface may contain text.

## Design principles (traveller interface)

- **Zero text, zero numbers to read.** Meaning comes from pictograms, photos, colour, shape, sound and vibration. Distances and times are shown as visual quantities (gauges, footsteps, clock faces), never as digits.
- **One screen, one decision.** Show only what the traveller needs now: the next move. No menus, no settings, no typing.
- **Redundant signals.** Every instruction uses at least two channels (e.g. arrow + vibration, colour + sound), so it survives sunlight, noise, colour blindness.
- **Large touch targets**, high contrast, nothing that depends on reading a map.
- **Reassurance first.** The traveller must always know "am I on the right way?" and must always have a way to call for help (the social worker), one tap away.
- **Culturally neutral pictograms.** Avoid symbols that only make sense in one culture or that require literacy (letters, arrows-with-labels, flags as languages).
- **Privacy.** Travellers are vulnerable people: no account for them, no tracking server, location stays on the device unless they explicitly share it.

Product decisions still open are tracked in `docs/` once the project is set up.

## Technical context

Expo rules, commands and routing conventions live in `AGENTS.md` (imported by the root `CLAUDE.md`). Package manager is **npm**. For Expo work, use the `expo:*` skills, starting with `expo:expo-overview`.

## Quality gates

`npm run check` runs lint (zero warnings), typecheck, Prettier check and Jest with coverage. Run it before declaring a task done; CI (`.github/workflows/ci.yml`) runs the same plus `expo-doctor`, a JS bundle export per platform, `npm run audit` (audit-ci, allowlist in `audit-ci.jsonc`) and, on pull requests, dependency review and commitlint.

- Git hooks (husky): pre-commit runs lint-staged, commit-msg enforces Conventional Commits, pre-push runs typecheck and tests. Never bypass them with `--no-verify`.
- Tests live in `__tests__/` folders as `<name>-test.ts(x)` (jest-expo preset). Never put test files under `src/app/`: every file there is a route.
- TypeScript is strict with `noUncheckedIndexedAccess`.
