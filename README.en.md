# Numrow Video Seek Guard

*[Lire en français](README.md)*

A Firefox extension that stops the AZERTY number row from making your videos jump around.

On an AZERTY keyboard, the number-row keys type symbols (`& é " ' ( § è ! ç à`) unless you hold Shift. Many video players ignore that and treat those keys as "jump to 10%, 20%, …" shortcuts, so one stray keypress loses your place. This extension blocks those accidental jumps. Deliberate jumps still work: hold Shift while pressing the key.

## Install

<!-- TODO: once published, replace the "Coming soon" line with the link to the listing, after checking the URL:
**[Get Numrow Video Seek Guard for Firefox](https://addons.mozilla.org/firefox/addon/numrow-video-seek-guard/)** -->
**Coming soon to the Firefox add-ons catalog.**

Installing will take one click, with nothing to configure. In the meantime, you can try the extension by [running it from source](#run-from-source).

The extension only exists for Firefox on desktop, version 140 or later. It is not available for other browsers or for Firefox for Android.

## What to expect

- Pressing a number-row key without Shift no longer makes the video jump.
- With Shift held, the same key still makes the video jump, so the player's shortcut remains available when you really want it.
- Typing in text fields, the numpad, and browser shortcuts such as Ctrl+1 work as usual.
- Pages without a video or audio player are left alone.
- So are video calls, remote desktops and games that capture the mouse, even though they use video or sound.

## Privacy

The extension collects no data and makes no network requests. Firefox asks for access to all websites only because a video player can be on any page.

## Run from source

Open `about:debugging#/runtime/this-firefox` in Firefox, click **Load Temporary Add-on…** and select `manifest.json`. There is no build step.

## License

[MIT](LICENSE)
