# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## What this is

A Firefox WebExtension (Manifest V3) made of two files: `manifest.json` and `content.js`. On AZERTY layouts the unshifted number row types symbols (`& é " ' ( § è ! ç à`), but video players read `event.code` (`Digit0`..`Digit9`) and treat those keys as "seek to N0%". The content script swallows those key events before page scripts see them.

## Commands

There is no build step: the browser loads `manifest.json` and `content.js` as-is. npm is only used for dev tooling (`npm install` first).

- **Test**: `npm test` runs the end-to-end suite in headless Firefox (Firefox 140+ must be installed; the driver is downloaded automatically).
- **Single test**: `node --test --test-name-pattern="closed shadow root" tests/e2e.test.js`
- **Lint**: `npm run lint` (`web-ext lint`). One warning, `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION`, is expected and must be left as-is: the extension targets desktop Firefox only, so do not add a `gecko_android` key to silence it.
- **Run**: in Firefox, open `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on…" → pick `manifest.json`.
- **After editing**: click "Reload" on the add-on in `about:debugging`, then reload the target tab (the script is injected at `document_start`, so already-open pages keep the old version).
- **Manual testing without an AZERTY keyboard**: the handler fires whenever a `Digit*` key produces a non-digit `event.key`, so `Shift+<number>` on a QWERTY layout exercises the same code path.

## Tests

`tests/e2e.test.js` uses `node:test` and Selenium WebDriver. It installs the extension as a temporary add-on and serves the pages in `tests/fixtures/` from a local HTTP server.

- Each fixture loads `recorder.js`, which logs every key event the page receives into `window.receivedKeys`. A test passes or fails on what ends up there.
- WebDriver key presses are trusted events and derive `event.code` from a US layout, so sending `&` gives `code: "Digit7"`, `key: "&"`. That is how the suite triggers the handler without an AZERTY layout; `!@#$%^&*()` covers `Digit1`..`Digit0`.
- `numberRowEventsSeenByPage` always sends a control letter after the keys under test. Keep it: without it, "the page saw nothing" cannot be told apart from "the page did not have focus".
- Only files referenced by the manifest are copied into the installed add-on, so a new content script is picked up automatically, but any other new runtime file must be added to `packExtension`.
- `webExt.ignoreFiles` in `package.json` keeps tests, docs and npm files out of `web-ext lint` and `web-ext build`.

## Architecture

`content.js` is a single IIFE that registers one handler for `keydown`, `keypress` and `keyup`. The handler is a chain of early returns; an event is only swallowed if it passes all of them, in this order:

1. `event.isTrusted` — synthetic events dispatched by pages are ignored.
2. `event.code` matches `Digit[0-9]` — number row only, never the numpad.
3. `event.key` is *not* a digit — a real digit (Shift held on AZERTY, or QWERTY) passes through untouched.
4. No Ctrl/Meta/Alt, unless `AltGraph` is active (Windows reports AltGr as Ctrl+Alt).
5. The target is not a text entry (`isTextEntry`), resolved through `event.composedPath()[0]` so that focus inside a shadow root is not retargeted to its host.
6. If `ONLY_WITH_MEDIA` is true, the frame contains a `<video>`/`<audio>` (`pageHasMedia`).

### Invariants to preserve

- **Listener placement is the whole mechanism.** It must stay on `window`, in the capture phase, registered at `run_at: "document_start"`. That is what guarantees it runs before any listener a page can register; moving it to `document`, to the bubble phase, or to a later `run_at` lets page handlers win.
- **Only `stopImmediatePropagation()`, never `preventDefault()`.** Browser defaults (e.g. Firefox quick find on `'`) must keep working, and the character must still be typed where applicable.
- **Media detection is per frame.** With `all_frames: true` and `match_about_blank: true`, every frame gets its own script instance and its own `mediaCache`; `containsMedia(document)` does not look into child iframes. This works because key events are dispatched in the focused frame.
- **`mediaCache` (1 s TTL)** exists because `containsMedia` walks every element and shadow root; key auto-repeat would otherwise rescan the DOM on each event.

### Firefox-specific parts

- `el.openOrClosedShadowRoot` is a Firefox-only API exposed to extension content scripts; it is what lets the script find media inside *closed* shadow roots. The `|| el.shadowRoot` fallback only sees open roots.
- `browser_specific_settings.gecko.data_collection_permissions` is why `strict_min_version` is `140.0`.

### Configuration

The only setting is the `ONLY_WITH_MEDIA` constant at the top of `content.js`. There is no options page, background script, or storage. The version lives solely in `manifest.json`.
