# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## What this is

A WebExtension (Manifest V3) for Firefox and Chromium-based browsers (Chrome, Edge, Opera...), made of three files: `manifest.json`, `content.js` and the icon `icon.svg`. These are the Firefox extension as-is; the Chromium one is generated from them by `scripts/build-chromium.js`. Video players read `event.code` (`Digit0`..`Digit9`) and treat the number-row keys as "seek to N0%", on every keyboard layout, including those where these keys type symbols (AZERTY: `& é " ' ( § è ! ç à`). The content script swallows those key events before page scripts see them, unless Shift is held.

## Commands

Nothing is compiled: Firefox loads `manifest.json` and `content.js` as-is, and the Chromium build only repackages them. npm is only used for dev tooling (`npm install` first, Node 22 or later).

CI (`.github/workflows/ci.yml`) runs the lint, the tests and the Chromium build on every pull request and on pushes to `main`.

- **Test**: `npm test` runs the end-to-end suite in headless Firefox, then in headless Chrome (Firefox 140+ and Chrome must be installed; the drivers are downloaded automatically).
- **Single test**: `node --test --test-name-pattern="finds a video inside a closed shadow root" tests/e2e.test.js` runs it in both browsers; add the browser to the pattern (`"in Chromium.*closed shadow root"`), or give only `"in Chromium"`, to stick to one.
- **Package for Firefox**: `npm run build` (`web-ext build`) zips the extension into `web-ext-artifacts/` (git-ignored), named after the `version` in `manifest.json`. That zip is what gets uploaded to the Firefox add-ons store; it is not needed to run or test the extension.
- **Package for Chromium**: `npm run build:chromium` (`scripts/build-chromium.js`) writes the unpacked extension to `web-ext-artifacts/chromium/` and zips it as `web-ext-artifacts/<name>-<version>-chromium.zip`, the file uploaded to the Chrome Web Store.
- **Lint**: `npm run lint` (`web-ext lint`). One warning, `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION`, is expected and must be left as-is: the extension targets desktop Firefox only, so do not add a `gecko_android` key to silence it.
- **Run**: in Firefox, open `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on…" → pick `manifest.json`. In Chrome, run `npm run build:chromium`, open `chrome://extensions`, turn on "Developer mode" → "Load unpacked" → pick `web-ext-artifacts/chromium/`.
- **After editing**: click "Reload" on the add-on in `about:debugging` (in Chrome: rerun `npm run build:chromium` first, then reload it in `chrome://extensions`), then reload the target tab (the script is injected at `document_start`, so already-open pages keep the old version).
- **Manual testing** works on any keyboard layout: open a page with a video, click outside any text field and press a number-row key. With Shift held, the key is let through on purpose.

## Tests

`tests/e2e.test.js` uses `node:test` and Selenium WebDriver. It serves the pages in `tests/fixtures/` from a local HTTP server and runs the whole suite once per browser (`in Firefox`, `in Chromium`), each in a fresh instance with the package shipped to that browser installed: the files the manifest lists (`packFirefox`), or the output of `buildChromium`.

- Each fixture loads `recorder.js`, which logs every key event the page receives into `window.receivedKeys`. A test passes or fails on what ends up there.
- Keys are sent over WebDriver BiDi (`perform`), never with the classic `actions().perform()`: ChromeDriver's classic actions take `event.key` from the system keyboard layout (on a French Mac, `a` arrives as `q`), BiDi does not. BiDi key presses are trusted events and derive `event.code` from a US layout. Sending `7` gives `code: "Digit7"`, `key: "7"`, as a QWERTY keyboard would; sending `&` gives `code: "Digit7"`, `key: "&"`, which stands in for a layout whose number row types symbols. `1234567890` and `!@#$%^&*()` each cover `Digit1`..`Digit0`.
- Every test loads its own page (`beforeEach` or an explicit `open`), so tests do not depend on the order they run in. Keep it that way: focus left behind by one test would otherwise change the next.
- `eventsSeenByPage` always sends a control letter after the keys under test. Keep it: without it, "the page saw nothing" cannot be told apart from "the page did not have focus".
- Chrome ignores `--load-extension` since version 137, so the extension is installed over BiDi (`installWebExtension`), which only works with the `--enable-unsafe-extension-debugging` and `--remote-debugging-pipe` flags.
- Chrome holds a page's `load` event until each `<video>` has a frame, so `driver.get` hangs on a fixture whose video never gets one. `live-stream.html` draws into its canvas for that reason.
- `once the extension is removed` uninstalls the extension mid-suite, then reinstalls it in its `after` hook so that the tests after it still have it. It watches BiDi `log.entryAdded` (`getLogInspector`), the only place where an error thrown by the content script shows up.
- Only files referenced by the manifest (content scripts and icons) are copied into either package, so those are picked up automatically, but any other new runtime file must be added to both `packFirefox` and `buildChromium`.
- `webExt.ignoreFiles` in `package.json` keeps tests, scripts, docs (the READMEs and the screenshots in `docs/` they show) and npm files out of `npm run lint` and out of the zip made by `npm run build`.

## Architecture

`content.js` is a single IIFE that registers one handler for `keydown`, `keypress` and `keyup`. The handler is a chain of early returns; an event is only swallowed if it passes all of them, in this order:

1. `event.isTrusted` — synthetic events dispatched by pages are ignored.
2. `event.code` matches `Digit[0-9]` — number row only, never the numpad.
3. Shift is not held — Shift is the deliberate way through, so the player's shortcut stays usable on purpose. `event.key` is never looked at: the key is swallowed whether it types a digit (QWERTY) or a symbol (AZERTY).
4. No Ctrl/Meta/Alt, unless `AltGraph` is active (Windows reports AltGr as Ctrl+Alt).
5. The extension is still there (`chrome.runtime.id` is set; checked in Chromium only). Chromium keeps a content script running in the pages already open when its extension is disabled, removed, reloaded or updated, and every extension API then throws "Extension context invalidated". Such an orphaned script steps aside, as Firefox does by unloading it; without this check, `chrome.dom` would throw on each number-row key.
6. The focused element is not a text entry (`isTextEntry`). It is found by `focusedElement`, which follows `activeElement` down through shadow roots; `event.target` and `composedPath()` would stop at the host of a closed one.
7. The document does not hold the pointer lock — a game or remote session reads the number row by position.
8. If `ONLY_WITH_MEDIA` is true, the frame contains a seekable `<video>`/`<audio>` (`pageHasMedia`). Media fed by a `MediaStream` (video call, remote desktop, cloud gaming) is not seekable and does not count.

Steps 7 and 8 exist to avoid breaking pages that are not video players. "The frame contains media" is only a proxy for "a player will hijack this key", so keep it as narrow as possible.

### Invariants to preserve

- **Listener placement is the whole mechanism.** It must stay on `window`, in the capture phase, registered at `run_at: "document_start"`. That is what guarantees it runs before any listener a page can register; moving it to `document`, to the bubble phase, or to a later `run_at` lets page handlers win.
- **Only `stopImmediatePropagation()`, never `preventDefault()`.** Browser defaults (e.g. Firefox quick find on `'`) must keep working, and the character must still be typed where applicable.
- **Media detection is per frame.** With `all_frames: true` and `match_about_blank: true`, every frame gets its own script instance and its own `mediaCache`; `containsMedia(document)` does not look into child iframes. This works because key events are dispatched in the focused frame.
- **`mediaCache` (1 s TTL)** exists because `containsMedia` walks every element and shadow root; key auto-repeat would otherwise rescan the DOM on each event. In Chromium the walk makes one extension API call per element (about 8 ms per 10,000 elements).

### Accepted limitations

These are known and were deliberately left alone. Do not "fix" them without being asked:

- Any attached `<audio>` counts as media, including a hidden notification sound, so a web app with one loses its own number-row shortcuts.
- Audio created with `new Audio()` and never attached to the DOM is not detected, so such players are not guarded.
- A `keydown` and its `keyup` can be treated differently when Shift is released in between.

### Browser-specific parts

- Finding media and the focused field inside *closed* shadow roots takes an extension-only API, which differs per browser. `shadowRootOf` picks one once, depending on whether `chrome.dom` exists (Firefox has no such API):
  - Firefox: `el.openOrClosedShadowRoot`. The `|| el.shadowRoot` fallback only sees open roots.
  - Chromium: `chrome.dom.openOrClosedShadowRoot(el)`. It throws on anything but an `HTMLElement` (an SVG element, `null`), which would make the handler throw and let the key through; hence the `instanceof HTMLElement` guard, covered by `svg-icon.html`. Only HTML elements can host a shadow root, so nothing is missed.
- Chromium leaves orphaned content scripts behind in open pages, where extension APIs throw; Firefox unloads them. See step 5 of the handler.
- `browser_specific_settings.gecko.data_collection_permissions` is why `strict_min_version` is `140.0`.
- `scripts/build-chromium.js` derives the Chromium manifest from `manifest.json`: it drops `browser_specific_settings`, which Chromium does not know, and swaps the SVG icons for PNG ones, which it requires.
- The manifest `description` must stay within 132 characters, the Chrome Web Store limit.

### Configuration

The only setting is the `ONLY_WITH_MEDIA` constant at the top of `content.js`. There is no options page, background script, or storage. The version lives solely in `manifest.json`.

### Icon

`icon.svg` is a single hand-written SVG used for every size. Firefox renders SVG icons natively; for Chromium, `npm run build:chromium` renders it to PNG (16, 32, 48 and 128 px, with resvg), so there are no PNG exports to keep in sync. The 128 px one is drawn in 96 px with 16 px of transparent padding, as the Chrome Web Store guidelines ask. It only uses shapes, never `<text>`, because text would depend on the fonts installed on each machine.
