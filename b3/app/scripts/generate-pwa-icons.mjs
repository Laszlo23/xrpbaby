#!/usr/bin/env node
/**
 * Regenerate PWA / apple-touch icons from public/brand/miniapp-icon.svg.
 * Requires: npx @resvg/resvg-js-cli (pulled on demand).
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const svg = path.join(publicDir, "brand", "miniapp-icon.svg");
const resvg = "npx --yes @resvg/resvg-js-cli";

const targets = [
  { width: 512, out: path.join(publicDir, "icons", "icon-512.png") },
  { width: 192, out: path.join(publicDir, "icons", "icon-192.png") },
  { width: 180, out: path.join(publicDir, "apple-touch-icon.png") },
  { width: 32, out: path.join(publicDir, "favicon-32.png") },
];

for (const { width, out } of targets) {
  execSync(`${resvg} --fit-width ${width} "${svg}" "${out}"`, { stdio: "inherit" });
}

console.log("PWA icons written to app/public/");
