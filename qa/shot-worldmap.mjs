// shot-worldmap.mjs — 생성된 세계지도(육지 path + 기후 오버레이) 눈검수 렌더.
// node qa/shot-worldmap.mjs → qa/shots/worldmap.png (Read 도구로 확인)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const gen = readFileSync(join(ROOT, "src/ui/worldMap.generated.ts"), "utf8");
const landPath = gen.match(/WORLD_LAND_PATH =\s*"((?:[^"\\]|\\.)*)"/)[1];
const climB64 = readFileSync(join(ROOT, "public/soc/climate.webp")).toString("base64");

const html = `<!doctype html><body style="margin:0;background:#0E1B2E">
<svg id="map" width="1000" height="500" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="1000" height="500" fill="#CFE7F5"/>
  <defs><clipPath id="landclip"><path d="${landPath}" fill-rule="evenodd"/></clipPath></defs>
  <path d="${landPath}" fill="#EFE8DA" fill-rule="evenodd"/>
  <image href="data:image/webp;base64,${climB64}" x="0" y="0" width="1000" height="500" preserveAspectRatio="none" clip-path="url(#landclip)"/>
  <path d="${landPath}" stroke="rgba(46,58,76,.45)" stroke-width=".7" fill="none" fill-rule="evenodd"/>
</svg></body>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 500 } });
await page.setContent(html);
await page.waitForTimeout(600);
mkdirSync(join(ROOT, "qa/shots"), { recursive: true });
const buf = await page.screenshot();
writeFileSync(join(ROOT, "qa/shots/worldmap.png"), buf);
await browser.close();
console.log("wrote qa/shots/worldmap.png");
