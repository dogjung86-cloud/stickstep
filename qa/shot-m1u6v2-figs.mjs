// m1u6 v2 시각자료 172종 격자 눈검수(그림·표만 슬롯 태그와 함께 조밀 렌더 → 분할 샷).
// node qa/shot-m1u6v2-figs.mjs → tmp/m1u6v2-full/figs.html + qa/shots/m1u6v2-figs-N.png
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";

const SRC = [
  ["qa/m1u6v2-pilot.ts", "POOL_M1U6V2_PILOT"],
  ["qa/m1u6v2-rest-a.ts", "POOL_M1U6V2_REST_A"],
  ["qa/m1u6v2-rest-b.ts", "POOL_M1U6V2_REST_B"],
  ["qa/m1u6v2-rest-c.ts", "POOL_M1U6V2_REST_C"],
  ["qa/m1u6v2-rest-d.ts", "POOL_M1U6V2_REST_D"],
  ["qa/m1u6v2-rest-e.ts", "POOL_M1U6V2_REST_E"],
  ["qa/m1u6v2-rest-f.ts", "POOL_M1U6V2_REST_F"],
];
const items = [];
for (const [p, name] of SRC) {
  const r = await build({ entryPoints: [p], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  items.push(...mod[name]);
}
const figs = items.filter((i) => i.figure).sort((a, b) => Number(a.id.replace("m1u6e", "")) - Number(b.id.replace("m1u6e", "")));
const cards = figs.map((it) => {
  const slot = it.id.replace("m1u6e", "");
  return `<div class="c"><div class="t">슬롯 ${slot} · ${it.lessonId.replace("m1u6", "")} · ${it.type}</div>${it.figure}</div>`;
}).join("");
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>m1u6 v2 시각자료 격자</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body { font-family: "Pretendard", "Malgun Gothic", sans-serif; background: #F1F3F7; padding: 14px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .c { background: #fff; border: 1px solid #DDE3EC; border-radius: 8px; padding: 8px; }
  .t { font-size: 11px; font-weight: 800; color: #1B64DA; margin-bottom: 5px; }
  svg { width: 100%; height: auto; display: block; }
</style></head><body><div class="grid">${cards}</div></body></html>`;
mkdirSync("tmp/m1u6v2-full", { recursive: true });
writeFileSync("tmp/m1u6v2-full/figs.html", html);
console.log(`격자 렌더: ${figs.length}종 → tmp/m1u6v2-full/figs.html`);

mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto(pathToFileURL("tmp/m1u6v2-full/figs.html").href, { waitUntil: "load" });
await page.waitForTimeout(300);
const total = await page.evaluate(() => document.body.scrollHeight);
let n = 0;
for (let y = 0; y < total; y += 940) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(120);
  n += 1;
  await page.screenshot({ path: `qa/shots/m1u6v2-figs-${n}.png` });
}
console.log(`전체 높이 ${total}px → ${n}장 저장(qa/shots/m1u6v2-figs-*.png)`);
await browser.close();
