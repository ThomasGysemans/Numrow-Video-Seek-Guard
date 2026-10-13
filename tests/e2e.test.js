// End-to-end tests: load the extension into a real Firefox and check which key
// events reach the page.
//
// WebDriver derives `event.code` from a US layout, so sending "&" yields
// code "Digit7" with key "&": a number-row key that produced a symbol, which is
// exactly what the extension looks for. No AZERTY keyboard is needed.

import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const ROOT = join(import.meta.dirname, "..");
const FIXTURES = join(import.meta.dirname, "fixtures");
const CONTENT_TYPES = { ".html": "text/html", ".js": "text/javascript" };

// Unshifted-symbol stand-ins for Digit1..Digit0 on the US layout WebDriver uses.
const NUMBER_ROW_SYMBOLS = "!@#$%^&*()";

let server;
let baseUrl;
let extensionDir;
let driver;

// Copies only what the manifest ships, so the installed add-on never contains
// node_modules or the tests themselves.
const packExtension = async () => {
  const dir = await mkdtemp(join(tmpdir(), "numrow-video-seek-guard-"));
  const manifest = JSON.parse(await readFile(join(ROOT, "manifest.json"), "utf8"));
  const files = ["manifest.json", ...manifest.content_scripts.flatMap((script) => script.js)];
  for (const file of files) {
    await cp(join(ROOT, file), join(dir, file));
  }
  return dir;
};

const startServer = () =>
  new Promise((resolve) => {
    const srv = createServer(async (request, response) => {
      try {
        const file = join(FIXTURES, new URL(request.url, "http://localhost").pathname);
        const body = await readFile(file);
        response.writeHead(200, { "Content-Type": CONTENT_TYPES[extname(file)] });
        response.end(body);
      } catch {
        response.writeHead(404).end();
      }
    });
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });

const open = (page) => driver.get(`${baseUrl}/${page}`);

// Runs `sendKeys` and returns the number-row events the page received.
//
// A letter the extension never touches is sent afterwards: it proves the page
// was receiving keys, so an empty result really means "blocked".
const numberRowEventsSeenByPage = async (sendKeys) => {
  await driver.executeScript("window.receivedKeys.length = 0");
  await sendKeys(driver.actions());
  await driver.actions().sendKeys("a").perform();

  const events = await driver.executeScript("return window.receivedKeys");
  assert.ok(
    events.some((event) => event.key === "a"),
    "the page did not receive the control key, so it was not listening",
  );
  return events.filter((event) => event.code.startsWith("Digit"));
};

const press = (keys) => (actions) => actions.sendKeys(keys).perform();

before(async () => {
  server = await startServer();
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  extensionDir = await packExtension();

  const options = new firefox.Options().addArguments("-headless");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
  await driver.installWebExtension(extensionDir, { permanent: false });
});

after(async () => {
  await driver?.quit();
  server?.close();
  if (extensionDir) await rm(extensionDir, { recursive: true });
});

describe("on a page with a video", () => {
  before(() => open("media.html"));

  it("blocks every number-row key that produced a symbol", async () => {
    assert.deepEqual(await numberRowEventsSeenByPage(press(NUMBER_ROW_SYMBOLS)), []);
  });

  it("lets a real digit through", async () => {
    const events = await numberRowEventsSeenByPage(press("7"));
    assert.deepEqual(events, [
      { type: "keydown", key: "7", code: "Digit7" },
      { type: "keypress", key: "7", code: "Digit7" },
      { type: "keyup", key: "7", code: "Digit7" },
    ]);
  });

  it("lets Ctrl combos through", async () => {
    const events = await numberRowEventsSeenByPage((actions) =>
      actions.keyDown(Key.CONTROL).sendKeys("&").keyUp(Key.CONTROL).perform(),
    );
    assert.ok(events.some((event) => event.type === "keydown" && event.code === "Digit7"));
  });

  it("lets Shift combos through", async () => {
    const events = await numberRowEventsSeenByPage((actions) =>
      actions.keyDown(Key.SHIFT).sendKeys("!").keyUp(Key.SHIFT).perform(),
    );
    assert.ok(events.some((event) => event.type === "keydown" && event.key === "!"));
  });

  it("does not interfere with typing in a text field", async () => {
    const input = await driver.findElement(By.id("text"));
    await input.click();
    const events = await numberRowEventsSeenByPage(press("&"));

    assert.ok(events.some((event) => event.type === "keydown" && event.key === "&"));
    assert.equal(await input.getAttribute("value"), "&a");
  });
});

describe("on a page without media", () => {
  before(() => open("no-media.html"));

  it("lets number-row symbols through", async () => {
    const events = await numberRowEventsSeenByPage(press("&"));
    assert.deepEqual(events, [
      { type: "keydown", key: "&", code: "Digit7" },
      { type: "keypress", key: "&", code: "Digit7" },
      { type: "keyup", key: "&", code: "Digit7" },
    ]);
  });
});

describe("media detection", () => {
  it("finds a video inside a closed shadow root", async () => {
    await open("shadow-closed.html");
    assert.deepEqual(await numberRowEventsSeenByPage(press("&")), []);
  });

  it("ignores a live stream, which has no timeline to seek in", async () => {
    await open("live-stream.html");
    const events = await numberRowEventsSeenByPage(press("&"));
    assert.ok(events.some((event) => event.type === "keydown" && event.code === "Digit7"));
  });

  it("is scoped to the frame that has focus", async () => {
    await open("iframe.html");
    const topFrameEvents = await numberRowEventsSeenByPage(press("&"));
    assert.ok(topFrameEvents.length > 0, "the top frame has no media of its own");

    await driver.switchTo().frame(await driver.findElement(By.css("iframe")));
    await driver.findElement(By.css("video")).click();
    assert.deepEqual(await numberRowEventsSeenByPage(press("&")), []);
  });
});

describe("on a page that holds the pointer lock", () => {
  it("steps aside while the lock is held, even though the page has media", async () => {
    await open("pointer-lock.html");
    assert.deepEqual(await numberRowEventsSeenByPage(press("&")), []);

    await driver.findElement(By.id("game")).click();
    await driver.wait(() => driver.executeScript("return document.pointerLockElement !== null"), 5000);

    const events = await numberRowEventsSeenByPage(press("&"));
    assert.ok(events.some((event) => event.type === "keydown" && event.code === "Digit7"));
  });
});
