---
name: feature
description: Spec-first workflow for any new feature, screen, user-facing behaviour change or product idea in this app. Runs a clarification interview with the user, writes a spec in docs/specs/, gets it validated, then implements it as one commit on main. Use it as soon as the user describes something to build or change, even casually ("on pourrait ajouter…", "je voudrais que…"), before reading code or writing any.
---

# Feature: spec first, then one commit

The user works alone and does not always know which details matter. Missing specs are the main risk on this project: the traveller cannot tell us what is wrong, so a wrong guess ships silently. Your job in this skill is to find the gaps **before** coding, by asking.

Skip this skill only for: bug fixes that restore already-specified behaviour, refactors with no visible change, tooling, docs. When unsure, run it.

## 1. Load context (silently)

Read `.claude/CLAUDE.md` (personas, design principles), `docs/product/` if present, `docs/engineering/` (code and security rules), the existing specs in `docs/specs/` and the decisions in `docs/decisions/`. Answers already written there are not asked again. Facts you can find in the code are not asked either.

## 2. Restate

In 2–3 sentences, say what you understood: who it is for, what problem it solves, what changes for that person. Ask the user to correct you if needed. This catches misunderstandings early.

## 3. Interview

Ask questions in rounds with `AskUserQuestion` (up to 4 questions per round). For each question:

- Explain in one line why it matters (what changes in the implementation depending on the answer).
- Offer concrete options, with your recommendation first, marked "(Recommandé)". The user can always answer something else.
- Write questions and options in French, in plain words, no jargon.

Walk through this checklist and ask only the items that are still open and would change the implementation:

1. **Persona and context**: traveller or social worker? Where, when, in what state (walking, stressed, in a bus, at night, in the rain)?
2. **Trigger**: what starts the feature? What does the person see or feel first?
3. **Happy path**: each step, what the person sees, hears, feels (vibration), and does.
4. **Signals**: which channels carry each piece of information (picture, colour, shape, sound, vibration, voice)? At least two per instruction for the traveller.
5. **Failure and edge cases**: no GPS fix, poor accuracy, no network, low battery, wrong direction, missed turn, arrived, appointment time passed, phone locked, app killed, permission refused.
6. **Help**: how does the traveller get help from here?
7. **Data and privacy**: what is stored, where, for how long, who can see it? Anything leaving the device, to which service, with which data (IP included)? New dependencies or permissions? Check against `docs/engineering/securite.md`.
8. **Offline and cost**: what must work without data? Any paid API?
9. **Accessibility and culture**: colour blindness, sunlight, noise, one hand, low-end phone, culturally neutral symbols.
10. **Out of scope**: what this feature deliberately does not do.
11. **Acceptance criteria**: observable checks ("the phone vibrates twice when the traveller turns the wrong way"), including how to test them in the field.

Keep asking rounds until no open question would change what you build. Then list the remaining **assumptions** explicitly. Never fill a gap silently.

## 4. Write the spec

Create `docs/specs/NNN-slug.md` (next free number, kebab-case slug) from `template.md` in this skill folder. Write it in French. Status `brouillon`. Show the user a short summary and ask for validation. Update it until the user approves, then set status `validé` and add the spec to the index in `docs/specs/README.md`.

## 5. Implement

Only once the spec is `validé`:

- Follow `docs/engineering/code.md` and `docs/engineering/securite.md`.
- Tests first for the logic in `src/domain/` (pure functions: bearings, distances, thresholds, state transitions, link decoding).
- Build the UI, then check it on screen (web through the browser, Android through `adb` screenshots) against the acceptance criteria.
- `npm run check` must pass.
- Reviews before commit: `ux-sans-texte-reviewer` for traveller-facing changes, `security-reviewer` for anything touching dependencies, native config, services, links, routes, permissions or storage. Fix the blocking findings.
- If a new unknown appears during implementation, **stop and ask**, then update the spec. Do not guess.

## 6. Commit

One feature = one commit on `main`, Conventional Commits, English: `feat(<scope>): <summary>`, with `Spec: docs/specs/NNN-slug.md` in the body. Set the spec status to `livré` in the same commit. Then report: what changed, the evidence (check output, screenshots), open questions.
