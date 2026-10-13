// Numrow Video Seek Guard
//
// On AZERTY layouts the unshifted number row produces symbols (& é " ' ( § è ! ç à),
// but most video players listen to `event.code` ("Digit1".."Digit0") and treat
// those keys as "seek to N0%" shortcuts. This script runs first (document_start,
// window capture phase) and stops those key events from reaching page scripts.
//
// We only call stopImmediatePropagation(), never preventDefault(), so browser
// default behaviors (e.g. Firefox quick find on ') are left untouched.

(() => {
  "use strict";

  // When true, only intervene on pages that contain a <video>/<audio> element
  // (shadow DOM included). This avoids breaking legit site shortcuts elsewhere,
  // e.g. Gmail's "!" (report spam), which lives on Digit8 on some AZERTY layouts.
  // Set to false to block these keys on every page.
  const ONLY_WITH_MEDIA = true;

  const EVENT_TYPES = ["keydown", "keypress", "keyup"];
  const NON_TEXT_INPUT_TYPES = new Set([
    "button", "checkbox", "radio", "range", "color", "file", "image", "submit", "reset",
  ]);

  // True if the element accepts text, in which case typing must work normally.
  const isTextEntry = (el) => {
    if (!(el instanceof Element)) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === "TEXTAREA") return true;
    if (el.tagName === "INPUT") return !NON_TEXT_INPUT_TYPES.has(el.type);
    return el.closest('[role="textbox"], [role="searchbox"], [role="combobox"]') !== null;
  };

  // Recursive media lookup that also walks into shadow roots (some players,
  // such as Reddit's, render their <video> inside one).
  const containsMedia = (root) => {
    if (root.querySelector("video, audio")) return true;
    for (const el of root.querySelectorAll("*")) {
      const shadow = el.openOrClosedShadowRoot || el.shadowRoot;
      if (shadow && containsMedia(shadow)) return true;
    }
    return false;
  };

  // Short-lived cache so holding a key (auto-repeat) doesn't rescan the DOM.
  let mediaCache = { time: 0, value: false };
  const pageHasMedia = () => {
    const now = Date.now();
    if (now - mediaCache.time > 1000) {
      mediaCache = { time: now, value: containsMedia(document) };
    }
    return mediaCache.value;
  };

  const handler = (event) => {
    if (!event.isTrusted) return; // ignore synthetic events dispatched by pages

    // Physical number-row key only (not the numpad)...
    if (!/^Digit[0-9]$/.test(event.code)) return;
    // ...that produced a symbol. A real digit (Shift held, or QWERTY layout)
    // is left alone.
    if (/^[0-9]$/.test(event.key)) return;

    // Keep browser/app combos (Ctrl+1, Alt+1...) but still handle AltGr,
    // which is reported as Ctrl+Alt on Windows.
    if ((event.ctrlKey || event.metaKey || event.altKey) && !event.getModifierState("AltGraph")) {
      return;
    }

    const target = event.composedPath()[0] || event.target;
    if (isTextEntry(target)) return;
    if (ONLY_WITH_MEDIA && !pageHasMedia()) return;

    event.stopImmediatePropagation();
  };

  for (const type of EVENT_TYPES) {
    window.addEventListener(type, handler, { capture: true });
  }
})();
