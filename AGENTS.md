# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## What this is

A Firefox WebExtension (Manifest V3) made of three files: `manifest.json`, `content.js` and the icon `icon.svg`. Video players read `event.code` (`Digit0`..`Digit9`) and treat the number-row keys as "seek to N0%", on every keyboard layout, including those where these keys type symbols (AZERTY: `& é " ' ( § è ! ç à`). The content script swallows those key events before page scripts see them, unless Shift is held.

## Commands

Nothing is compiled: the browser loads `manifest.json` and `content.js` as-is. npm is only used for dev tooling (`npm install` first, Node 22 or later).

CI (`.github/workflows/ci.yml`) runs the lint and the tests on every pull request and on pushes to `main`.

- **Test**: `npm test` runs the end-to-end suite in headless Firefox (Firefox 140+ must be installed; the driver is downloaded automatically).
- **Single test**: `node --test --test-name-pattern="finds a video inside a closed shadow root" tests/e2e.test.js`
- **Package**: `npm run build` (`web-ext build`) zips the extension into `web-ext-artifacts/` (git-ignored), named after the `version` in `manifest.json`. That zip is what gets uploaded to the Firefox add-ons store; it is not needed to run or test the extension.
- **Lint**: `npm run lint` (`web-ext lint`). One warning, `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION`, is expected and must be left as-is: the extension targets desktop Firefox only, so do not add a `gecko_android` key to silence it.
- **Run**: in Firefox, open `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on…" → pick `manifest.json`.
- **After editing**: click "Reload" on the add-on in `about:debugging`, then reload the target tab (the script is injected at `document_start`, so already-open pages keep the old version).
- **Manual testing** works on any keyboard layout: open a page with a video, click outside any text field and press a number-row key. With Shift held, the key is let through on purpose.

## Tests

`tests/e2e.test.js` uses `node:test` and Selenium WebDriver. It installs the extension as a temporary add-on and serves the pages in `tests/fixtures/` from a local HTTP server.

- Each fixture loads `recorder.js`, which logs every key event the page receives into `window.receivedKeys`. A test passes or fails on what ends up there.
- WebDriver key presses are trusted events and derive `event.code` from a US layout. Sending `7` gives `code: "Digit7"`, `key: "7"`, as a QWERTY keyboard would; sending `&` gives `code: "Digit7"`, `key: "&"`, which stands in for a layout whose number row types symbols. `1234567890` and `!@#$%^&*()` each cover `Digit1`..`Digit0`.
- Every test loads its own page (`beforeEach` or an explicit `open`), so tests do not depend on the order they run in. Keep it that way: focus left behind by one test would otherwise change the next.
- `eventsSeenByPage` always sends a control letter after the keys under test. Keep it: without it, "the page saw nothing" cannot be told apart from "the page did not have focus".
- Only files referenced by the manifest (content scripts and icons) are copied into the installed add-on, so those are picked up automatically, but any other new runtime file must be added to `packExtension`.
- `webExt.ignoreFiles` in `package.json` keeps tests, docs and npm files out of `npm run lint` and out of the zip made by `npm run build`.

## Architecture

`content.js` is a single IIFE that registers one handler for `keydown`, `keypress` and `keyup`. The handler is a chain of early returns; an event is only swallowed if it passes all of them, in this order:

1. `event.isTrusted` — synthetic events dispatched by pages are ignored.
2. `event.code` matches `Digit[0-9]` — number row only, never the numpad.
3. Shift is not held — Shift is the deliberate way through, so the player's shortcut stays usable on purpose. `event.key` is never looked at: the key is swallowed whether it types a digit (QWERTY) or a symbol (AZERTY).
4. No Ctrl/Meta/Alt, unless `AltGraph` is active (Windows reports AltGr as Ctrl+Alt).
5. The focused element is not a text entry (`isTextEntry`). It is found by `focusedElement`, which follows `activeElement` down through shadow roots; `event.target` and `composedPath()` would stop at the host of a closed one.
6. The document does not hold the pointer lock — a game or remote session reads the number row by position.
7. If `ONLY_WITH_MEDIA` is true, the frame contains a seekable `<video>`/`<audio>` (`pageHasMedia`). Media fed by a `MediaStream` (video call, remote desktop, cloud gaming) is not seekable and does not count.

Steps 6 and 7 exist to avoid breaking pages that are not video players. "The frame contains media" is only a proxy for "a player will hijack this key", so keep it as narrow as possible.

### Invariants to preserve

- **Listener placement is the whole mechanism.** It must stay on `window`, in the capture phase, registered at `run_at: "document_start"`. That is what guarantees it runs before any listener a page can register; moving it to `document`, to the bubble phase, or to a later `run_at` lets page handlers win.
- **Only `stopImmediatePropagation()`, never `preventDefault()`.** Browser defaults (e.g. Firefox quick find on `'`) must keep working, and the character must still be typed where applicable.
- **Media detection is per frame.** With `all_frames: true` and `match_about_blank: true`, every frame gets its own script instance and its own `mediaCache`; `containsMedia(document)` does not look into child iframes. This works because key events are dispatched in the focused frame.
- **`mediaCache` (1 s TTL)** exists because `containsMedia` walks every element and shadow root; key auto-repeat would otherwise rescan the DOM on each event.

### Accepted limitations

These are known and were deliberately left alone. Do not "fix" them without being asked:

- Any attached `<audio>` counts as media, including a hidden notification sound, so a web app with one loses its own number-row shortcuts.
- Audio created with `new Audio()` and never attached to the DOM is not detected, so such players are not guarded.
- A `keydown` and its `keyup` can be treated differently when Shift is released in between.

### Firefox-specific parts

- `el.openOrClosedShadowRoot` is a Firefox-only API exposed to extension content scripts; it is what lets the script find media and the focused field inside *closed* shadow roots. The `|| el.shadowRoot` fallback in `shadowRootOf` only sees open roots.
- `browser_specific_settings.gecko.data_collection_permissions` is why `strict_min_version` is `140.0`.

### Configuration

The only setting is the `ONLY_WITH_MEDIA` constant at the top of `content.js`. There is no options page, background script, or storage. The version lives solely in `manifest.json`.

### Icon

`icon.svg` is a single hand-written SVG used for every size; Firefox renders SVG icons natively, so there are no PNG exports to keep in sync. It only uses shapes, never `<text>`, because text would depend on the fonts installed on each machine.
