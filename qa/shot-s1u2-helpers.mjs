// s1u2 v1 저작 전 그림 샘플 갤러리 — 신작 2종(sxAsiaMapFig·sxPyramidFig)+데뷔 asiaClimateFig+
// 재사용 각도 전부를 실렌더 눈검수(esbuild 실로드 · dev 서버 불요 · file://).
// 실행: node qa/shot-s1u2-helpers.mjs → qa/shots/s1u2-helpers-N.png
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";

async function loadMod(entry) {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  return import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
}

const EX = await loadMod("src/ui/examFiguresSoc.ts");
const S2 = await loadMod("src/ui/socFigures2.ts");

const samples = [
  // ── 신작 1: sxAsiaMapFig ──
  ["sxAsiaMapFig terrain+레터(히말라야 dy-18·고비·카스피 dx-20)", EX.sxAsiaMapFig({ terrain: true, letters: [
    { lon: 84, lat: 28.5, t: "㉠", dy: -20 }, { lon: 105, lat: 43, t: "㉡" }, { lon: 50.5, lat: 41.5, t: "㉢", dx: -22, dy: 14 }] })],
  ["sxAsiaMapFig 인구 이동 화살표(남부→서남·동남→동아)", EX.sxAsiaMapFig({ arrows: [
    { from: [75, 22], to: [50, 25] }, { from: [107, 12], to: [117, 33] }], letters: [{ lon: 46, lat: 19, t: "㉮", dy: 16 }, { lon: 121, lat: 38, t: "㉯", dy: -14 }] })],
  ["sxAsiaMapFig 레터만(지역 판독 — 동아·동남·중앙)", EX.sxAsiaMapFig({ letters: [
    { lon: 115, lat: 38, t: "㉠" }, { lon: 103, lat: 13, t: "㉡" }, { lon: 66, lat: 44, t: "㉢" }] })],
  // ── 신작 2: sxPyramidFig ──
  ["sxPyramidFig 3패널(wide·aged·migrant)", EX.sxPyramidFig(["wide", "aged", "migrant"])],
  ["sxPyramidFig 2패널(aged·migrant)", EX.sxPyramidFig(["aged", "migrant"])],
  ["sxPyramidFig 1패널(migrant)", EX.sxPyramidFig(["migrant"], { tags: ["(가)"] })],
  // ── 데뷔: asiaClimateFig(레슨 미사용 헬퍼 — 기후 레터 §8-0 검산표) ──
  ["asiaClimateFig 레터(타이1·아라비아2·화북3·시베리아4)", S2.asiaClimateFig({ letters: [
    { lon: 101, lat: 16, t: "㉠" }, { lon: 45, lat: 24, t: "㉡" }, { lon: 115, lat: 36, t: "㉢" }, { lon: 120, lat: 54, t: "㉣" }] })],
  ["asiaClimateFig 레터(티베트 고산6·자와1)", S2.asiaClimateFig({ letters: [
    { lon: 88, lat: 32, t: "㉮" }, { lon: 110, lat: -7, t: "㉯" }] })],
  // ── 재사용 각도 ──
  ["asiaRegionsFig labels:false 레터(동아·중앙)", S2.asiaRegionsFig({ labels: false, letters: [
    { lon: 115, lat: 38, t: "㉠" }, { lon: 66, lat: 44, t: "㉡" }] })],
  ["religionMapFig 레터(인니·타이·사우디)", S2.religionMapFig({ letters: [
    { lon: 110, lat: -7, t: "㉠" }, { lon: 101, lat: 15, t: "㉡" }, { lon: 45, lat: 24, t: "㉢" }] })],
  ["monsoonPairFig(재사용 — (나) 겨울 축 예정)", S2.monsoonPairFig()],
  ["asiaPopFig(재사용 — 분포 판독 각도)", S2.asiaPopFig()],
  ["asiaIndustryFig 무레터(종합 판독)", S2.asiaIndustryFig()],
  ["factoryMoveFig(재사용 — 방향 판독 각도)", S2.factoryMoveFig()],
  ["socLifeSceneFig ger(유목 소재)", EX.socLifeSceneFig("ger")],
  ["socLifeSceneFig oasis(관개 소재)", EX.socLifeSceneFig("oasis")],
  ["socWorldFig 아시아 위치(대양 마커)", EX.socWorldFig({ eq: true, marks: [
    { lon: 160, lat: 8, t: "㉠" }, { lon: 75, lat: -28, t: "㉡" }, { lon: 55, lat: 82, t: "㉢" }] })],
];

fs.mkdirSync("tmp/s1u2-helpers/soc", { recursive: true });
fs.mkdirSync("qa/shots", { recursive: true });
if (fs.existsSync("public/soc/climate.webp")) fs.copyFileSync("public/soc/climate.webp", "tmp/s1u2-helpers/soc/climate.webp");

const CHUNK = 6;
const pages = [];
for (let i = 0; i < samples.length; i += CHUNK) pages.push(samples.slice(i, i + CHUNK));

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 940 }, deviceScaleFactor: 2 });
let broken = [];
for (let p = 0; p < pages.length; p++) {
  const cells = pages[p]
    .map(([name, svg]) => `<div class="cell"><h4>${name}</h4>${svg.replaceAll('href="/soc/', 'href="./soc/')}</div>`)
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{font-family:"Pretendard","Malgun Gothic",sans-serif;background:#F6F7F9;margin:0;padding:14px}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    .cell{background:#fff;border:1px solid #E2E6EA;border-radius:12px;padding:10px}
    .cell h4{margin:0 0 8px;font-size:12px;color:#556}
    .cell svg{width:100%;height:auto;display:block}
  </style><div class="grid">${cells}</div>`;
  fs.writeFileSync(`tmp/s1u2-helpers/page-${p + 1}.html`, html);
  await page.goto(`file:///${process.cwd().replace(/\\/g, "/")}/tmp/s1u2-helpers/page-${p + 1}.html`);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `qa/shots/s1u2-helpers-${p + 1}.png`, fullPage: true });
  const bad = await page.evaluate(() => [...document.images].filter((im) => !im.complete || im.naturalWidth <= 0).map((im) => im.src));
  broken.push(...bad);
  console.log(`saved qa/shots/s1u2-helpers-${p + 1}.png (${pages[p].length}칸)`);
}
await browser.close();
if (broken.length) { console.log("BROKEN IMAGES:", broken); process.exit(1); }
console.log("전 시트 이미지 로드 정상");
