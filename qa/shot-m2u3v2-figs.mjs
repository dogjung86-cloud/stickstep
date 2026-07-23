// 200제 중 그림 문항 전부를 4열 격자로 모아 렌더·촬영(눈검수 전용).
// node qa/shot-m2u3v2-figs.mjs → qa/shots/m2u3v2-figs-N.png
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";

const FILES = [
  ["qa/m2u3v2-pilot.ts", "POOL_M2U3V2_PILOT"],
  ["qa/m2u3v2-rest-a.ts", "POOL_M2U3V2_REST_A"],
  ["qa/m2u3v2-rest-b.ts", "POOL_M2U3V2_REST_B"],
  ["qa/m2u3v2-rest-c.ts", "POOL_M2U3V2_REST_C"],
  ["qa/m2u3v2-rest-d.ts", "POOL_M2U3V2_REST_D"],
  ["qa/m2u3v2-rest-e.ts", "POOL_M2U3V2_REST_E"],
];
async function loadPool(entry, key) {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  return mod[key];
}
const all = [];
for (const [e, k] of FILES) all.push(...(await loadPool(e, k)));
all.sort((a, b) => Number(a.id.replace("m2u3e", "")) - Number(b.id.replace("m2u3e", "")));
const figs = all.filter((it) => it.figure);
const cells = figs.map((it) => `<div class="cell"><div class="cap">${it.id.replace("m2u3e", "슬롯 ")} · ${it.lessonId.replace("m2u3", "")} · ${it.type}</div>${it.figure}</div>`).join("");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:"Malgun Gothic",sans-serif;background:#fff;margin:0;padding:10px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.cell{border:1px solid #D5DAE2;border-radius:8px;padding:6px}
.cap{font-size:11px;font-weight:700;color:#1B64DA;margin-bottom:4px}
svg{width:100%;height:auto;display:block}
</style></head><body><div class="grid">${cells}</div></body></html>`;
mkdirSync("tmp/m2u3v2-figs", { recursive: true });
writeFileSync("tmp/m2u3v2-figs/index.html", html);
console.log(`그림 ${figs.length}개 격자 렌더`);
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1240, height: 1000 } });
await page.goto(pathToFileURL("tmp/m2u3v2-figs/index.html").href, { waitUntil: "load" });
await page.waitForTimeout(250);
const total = await page.evaluate(() => document.body.scrollHeight);
let n = 0;
for (let y = 0; y < total; y += 950) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(100);
  n += 1;
  await page.screenshot({ path: `qa/shots/m2u3v2-figs-${n}.png` });
}
console.log(`전체 높이 ${total}px → ${n}장(qa/shots/m2u3v2-figs-*.png)`);
await browser.close();
