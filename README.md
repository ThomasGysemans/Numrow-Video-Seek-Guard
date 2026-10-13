# Numrow Video Seek Guard

A Firefox extension that stops the AZERTY number row from making your videos jump around.

On an AZERTY keyboard, the number-row keys type symbols (`& é " ' ( § è ! ç à`) unless you hold Shift. Many video players ignore that and treat those keys as "jump to 10%, 20%, …" shortcuts, so one stray keypress loses your place. This extension blocks those accidental jumps.

## Install

<!-- TODO: confirm this URL once the add-on is listed on addons.mozilla.org -->
**[Get Numrow Video Seek Guard for Firefox](https://addons.mozilla.org/firefox/addon/numrow-video-seek-guard/)**

Click **Add to Firefox** and you are done. There is nothing to configure. Requires Firefox 140 or later.

## What to expect

- Pressing a number-row key without Shift no longer makes the video jump.
- Shift + number still types a real digit, so the player's jump shortcuts remain available when you want them.
- Typing in text fields, the numpad, and browser shortcuts such as Ctrl+1 work as usual.
- Pages without a video or audio player are left alone.

## Privacy

The extension collects no data and makes no network requests. Firefox asks for access to all websites only because a video player can be on any page.

## Run from source

Open `about:debugging#/runtime/this-firefox` in Firefox, click **Load Temporary Add-on…** and select `manifest.json`. There is no build step.

## License

[MIT](LICENSE)
