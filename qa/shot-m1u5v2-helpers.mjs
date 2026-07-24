// m1u5 v2 확대 신작 헬퍼 9종 샘플 갤러리(저작 전 눈검수 — m2u5 관행).
// 슬롯 대표 파라미터로 렌더 → tmp/m1u5v2-helpers/index.html → qa/shots/m1u5v2-helpers-N.png
// node qa/shot-m1u5v2-helpers.mjs
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";

const entry = `
import {
  m5TriChainFig, m5RollFig, m5NetPrismFig, m5PlatonicNetFig, m5PyramidDimFig,
  m5WaterFig, m5ShellFig, m5PolyJoinFig, m5CircleParallelFig,
} from "../src/ui/examFiguresMath";
export const SAMPLES = [
  ["TX cevian(슬롯 23 후보) b35 a1 40 a2 32, D 외각 107", m5TriChainFig({ mode: "cevian", bDeg: 35, a1Deg: 40, a2Deg: 32, labels: { b: "35°", a1: "40°", a2: "32°", dExt: "x°" } })],
  ["TX bisect(슬롯 26) A76 → E38", m5TriChainFig({ mode: "bisect", bDeg: 58, aDeg: 76, labels: { a: "76°", e: "x°" } })],
  ["RL(슬롯 96) 5×12 대각선 13", m5RollFig({ w: 12, h: 5, wLabel: "12 cm", hLabel: "5 cm", diagLabel: "13 cm" })],
  ["NP(슬롯 145) 밑 5×4 h11", m5NetPrismFig({ a: 5, b: 4, h: 11, aLabel: "5 cm", bLabel: "4 cm", hLabel: "11 cm" })],
  ["PN tri8(슬롯 120) 정팔면체 전개도", m5PlatonicNetFig("tri8")],
  ["PN tri4(예비) 정사면체 전개도", m5PlatonicNetFig("tri4")],
  ["PY(슬롯 159) 밑 7×6 h4", m5PyramidDimFig({ a: 7, b: 6, h: 4, aLabel: "7 cm", bLabel: "6 cm", hLabel: "4 cm" })],
  ["WT(슬롯 154) 가 8×6×4 → 나 밑 8×4 x3", m5WaterFig({ a: { w: 8, d: 6, h: 4, wLabel: "8 cm", dLabel: "6 cm", hLabel: "4 cm" }, b: { w: 8, d: 4, water: 3, wLabel: "8 cm", dLabel: "4 cm", waterLabel: "x cm" } })],
  ["SH(슬롯 182) R6 r3", m5ShellFig({ R: 6, r: 3, RLabel: "6 cm", rLabel: "3 cm" })],
  ["PJ(슬롯 55) 정8+정6+정4 틈새 15", m5PolyJoinFig({ sides: [8, 6, 4], gapLabel: "x°" })],
  ["CX2(슬롯 78) c35 호 AC 4·호 CD x", m5CircleParallelFig({ cDeg: 35, angleLabel: "35°", arcAC: "4 cm", arcCD: "x cm", boldCD: true })],
];
`;
writeFileSync("tmp/_m1u5v2-helpers-entry.ts", entry);
const r = await build({ entryPoints: ["tmp/_m1u5v2-helpers-entry.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
const cells = mod.SAMPLES.map(([cap, svg]) => `<div class="cell"><div class="cap">${cap}</div>${svg}</div>`).join("");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:"Malgun Gothic",sans-serif;background:#fff;margin:0;padding:12px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.cell{border:1px solid #D5DAE2;border-radius:8px;padding:8px}
.cap{font-size:11.5px;font-weight:700;color:#1B64DA;margin-bottom:5px}
svg{width:100%;height:auto;display:block}
</style></head><body><div class="grid">${cells}</div></body></html>`;
mkdirSync("tmp/m1u5v2-helpers", { recursive: true });
writeFileSync("tmp/m1u5v2-helpers/index.html", html);
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1240, height: 1000 } });
await page.goto(pathToFileURL("tmp/m1u5v2-helpers/index.html").href, { waitUntil: "load" });
await page.waitForTimeout(250);
const total = await page.evaluate(() => document.body.scrollHeight);
let n = 0;
for (let y = 0; y < total; y += 950) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(120);
  n += 1;
  await page.screenshot({ path: `qa/shots/m1u5v2-helpers-${n}.png` });
}
console.log(`샘플 ${mod.SAMPLES.length}종 → ${n}장(qa/shots/m1u5v2-helpers-*.png)`);
await browser.close();
