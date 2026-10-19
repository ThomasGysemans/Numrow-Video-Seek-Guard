# Numrow Video Seek Guard

*[Lire en français](README.md)*

An extension for Firefox, Chrome and other Chromium-based browsers that stops the number row of your keyboard from making videos jump around.

Many video players treat the number-row keys as "jump to 10%, 20%, …" shortcuts, so one stray keypress loses your place. It happens on every keyboard layout, and it is even more surprising on those where these keys type symbols instead of digits, such as AZERTY (`& é " ' ( § è ! ç à`). This extension blocks those accidental jumps. Deliberate jumps still work: hold Shift while pressing the key.

## Install

**[Get Numrow Video Seek Guard for Firefox](https://addons.mozilla.org/firefox/addon/numrow-video-seek-guard/)**

**[Get Numrow Video Seek Guard for Chrome](https://chromewebstore.google.com/detail/numrow-video-seek-guard/lcihljbfkhnbdfiememedcefldpngedn)**

Installing will take one click, with nothing to configure. In the meantime, you can try the extension by [running it from source](#run-from-source).

The extension works on desktop, in Firefox 140 or later, and in Chrome as well as other Chromium-based browsers (Edge, Opera, Brave…), which can install it from the Chrome Web Store. It is not available for Firefox for Android.

## What to expect

- Pressing a number-row key no longer makes the video jump, whatever your keyboard layout.
- With Shift held, the extension lets the key through, so the player's shortcut remains available when you really want it.
- Typing in text fields, the numpad, and browser shortcuts such as Ctrl+1 work as usual.
- Pages without a video or audio player are left alone.
- So are video calls, remote desktops and games that capture the mouse, even though they use video or sound.

## Privacy

The extension collects no data and makes no network requests. The browser asks for access to all websites only because a video player can be on any page.

## Run from source

In Firefox, there is no build step: open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…** and select `manifest.json`.

For Chrome or another Chromium-based browser, build the extension first, with Node.js 22 or later: run `npm install`, then `npm run build:chromium`. Then open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select the `web-ext-artifacts/chromium` folder.

## License

[MIT](LICENSE)
