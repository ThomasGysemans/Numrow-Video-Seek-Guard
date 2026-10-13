// Records every key event the page receives, so tests can assert what got
// through. Window capture is the earliest a page script can listen.
window.receivedKeys = [];
for (const type of ["keydown", "keypress", "keyup"]) {
  window.addEventListener(
    type,
    (event) => window.receivedKeys.push({ type, key: event.key, code: event.code }),
    { capture: true },
  );
}
