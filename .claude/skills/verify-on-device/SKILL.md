---
name: verify-on-device
description: Run the GPS app and look at a screen for real — in Chrome at phone size (web) or on a USB Android phone (adb) — to check a UI change against its spec and the design principles, with screenshots as evidence. Use before committing any UI work, or when asked to run, screenshot or check the app.
---

# Verify on device

Tests prove logic; this skill proves what the person sees. Every UI commit needs at least one screenshot checked against the spec's acceptance criteria.

## 1. Pick the target

- **Web (default, always available)**: layout, colours, pictograms, flows. Sensors (GPS, compass, haptics) do not exist there: drive them with mocks or test props.
- **Android phone (when `adb devices` lists one)**: sensors, haptics, sound, real performance on a low-end device. There is no Android SDK or emulator on this machine, so it is a physical phone over USB only.

## 2. Web

1. Start the dev server in the background if it is not already up: `npx expo start --web --port 8081` (Bash `run_in_background`). Wait until `http://localhost:8081` answers.
2. Load the browser tools in one ToolSearch call (`tabs_context_mcp`, `tabs_create_mcp`, `navigate`, `computer`, `read_page`, `resize_window`, `read_console_messages`), then: get the tab context, open a new tab, resize to a phone (`390x844`), navigate to the route.
3. Screenshot each state named in the spec (initial, each step, error cases). Interact with clicks as the user would.
4. Read the console filtered on errors (`pattern: "error|warn"`). Any red error is a failure.

## 3. Android

1. `adb devices` must list a device in `device` state. If it is `unauthorized`, ask the user to accept the prompt on the phone.
2. Expo Go works while the app only uses modules bundled in Expo Go: `npx expo start --android`. Once a native module outside Expo Go is added (background location, for example), a development build is needed: tell the user, since `eas build` needs their approval.
3. Screenshot: `adb exec-out screencap -p > <scratchpad>/screen-<state>.png`, then Read the PNG to look at it.
4. Logs: `adb logcat -d -t 200 ReactNativeJS:V *:E`.
5. Simulate taps with `adb shell input tap <x> <y>` when needed. Location cannot be faked on a physical phone without a mock-location app: for movement scenarios, prefer the app's own debug mocks.

## 4. Check and report

- Compare each screenshot to the spec's acceptance criteria and to `docs/product/principes.md`: no text or digits, at least two channels per instruction, large targets, contrast, help reachable.
- For traveller-facing changes, hand the screenshots and the diff to the `ux-sans-texte-reviewer` agent.
- Report: target used, states checked, screenshot paths (full absolute paths), console or logcat errors, what could not be verified (and why).
- Stop the dev server you started when done.
