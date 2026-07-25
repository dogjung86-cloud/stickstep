// m1u3 v2 그림 105종 전용 격자 눈검수(m2u3 shot-figs 관행).
// node qa/shot-m1u3v2-figs.mjs → qa/shots/m1u3v2-figs-N.png
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const SOURCES = [
  ["qa/m1u3v2-pilot.ts", "POOL_M1U3V2_PILOT"],
  ["qa/m1u3v2-rest-a.ts", "POOL_M1U3V2_REST_A"],
  ["qa/m1u3v2-rest-b.ts", "POOL_M1U3V2_REST_B"],
  ["qa/m1u3v2-rest-c.ts", "POOL_M1U3V2_REST_C"],
  ["qa/m1u3v2-rest-d.ts", "POOL_M1U3V2_REST_D"],
  ["qa/m1u3v2-rest-e.ts", "POOL_M1U3V2_REST_E"],
];
const pool = [];
for (const [entry, name] of SOURCES) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  pool.push(...mod[name]);
}
pool.sort((a, b) => a.id.localeCompare(b.id));
const figured = pool.filter((it) => it.figure);
const cells = figured
  .map((it) => `<figure><figcaption>${it.id.replace("m1u3e", "슬롯 ")} · ${it.lessonId.replace("m1u3", "")}</figcaption>${it.figure}</figure>`)
  .join("\n");
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
  body { font-family: Pretendard, sans-serif; background: #fff; margin: 16px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  figure { margin: 0; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px; }
  figcaption { font-size: 12px; font-weight: 800; color: #1B64DA; margin-bottom: 6px; }
  svg { width: 100%; height: auto; display: block; }
  @font-face { font-family: "STIX Two Text"; src: url("../tmp/m1u3v2-full/stix-two-italic-latin.woff2") format("woff2");
    font-style: italic; font-weight: 400 700; unicode-range: U+0041-005A, U+0061-007A; }
  svg text[font-style="italic"] { font-family: "STIX Two Text", Pretendard, sans-serif; }
</style></head><body><div class="grid">${cells}</div></body></html>`;
mkdirSync("qa/shots", { recursive: true });
writeFileSync("qa/shots/m1u3v2-figs.html", html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1240, height: 1100 } });
await page.goto(pathToFileURL("qa/shots/m1u3v2-figs.html").href, { waitUntil: "load" });
await page.waitForTimeout(400);
const total = await page.evaluate(() => document.body.scrollHeight);
let n = 0;
for (let y = 0; y < total; y += 1040) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(120);
  n += 1;
  await page.screenshot({ path: `qa/shots/m1u3v2-figs-${n}.png` });
}
console.log(`그림 ${figured.length}종 → ${n}장 저장(qa/shots/m1u3v2-figs-*.png)`);
await browser.close();
