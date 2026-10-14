// Builds the extension for Chromium-based browsers (Chrome, Edge, Opera...)
// from the same sources as the Firefox one. `npm run build:chromium` writes the
// unpacked extension to web-ext-artifacts/chromium/, to load in
// chrome://extensions, and zips it next to it for the Chrome Web Store.
//
// Only the packaging differs from Firefox:
// - Chromium does not accept SVG icons, so icon.svg is rendered to PNG.
// - browser_specific_settings is a Firefox key, which Chromium warns about.

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import webExt from "web-ext";

const ROOT = join(import.meta.dirname, "..");
const ARTIFACTS = join(ROOT, "web-ext-artifacts");

// 16 for menus, 32 for Windows, 48 for chrome://extensions, 128 for the
// install dialog and the Chrome Web Store.
const ICON_SIZES = [16, 32, 48, 128];

// Chrome's guidelines want the 128px icon drawn in 96px with 16px of
// transparent padding on each side: widen the viewBox by a sixth per side.
const withPadding = (svg) =>
  svg.replace(/viewBox="([^"]+)"/, (_, viewBox) => {
    const [x, y, width, height] = viewBox.trim().split(/[\s,]+/).map(Number);
    const pad = width / 6;
    return `viewBox="${x - pad} ${y - pad} ${width + 2 * pad} ${height + 2 * pad}"`;
  });

// Writes the unpacked Chromium extension into `dir`, which must exist.
export const buildChromium = async (dir) => {
  const manifest = JSON.parse(await readFile(join(ROOT, "manifest.json"), "utf8"));
  delete manifest.browser_specific_settings;

  const svg = await readFile(join(ROOT, "icon.svg"), "utf8");
  manifest.icons = {};
  for (const size of ICON_SIZES) {
    const file = `icon-${size}.png`;
    const source = size === 128 ? withPadding(svg) : svg;
    const png = new Resvg(source, { fitTo: { mode: "width", value: size } }).render().asPng();
    await writeFile(join(dir, file), png);
    manifest.icons[size] = file;
  }

  for (const file of manifest.content_scripts.flatMap((script) => script.js)) {
    await cp(join(ROOT, file), join(dir, file));
  }
  await writeFile(join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = join(ARTIFACTS, "chromium");
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await buildChromium(dir);
  await webExt.cmd.build({
    sourceDir: dir,
    artifactsDir: ARTIFACTS,
    overwriteDest: true,
    filename: "{name}-{version}-chromium.zip",
  });
}
