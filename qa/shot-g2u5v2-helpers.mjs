// g2u5 v2 신작 헬퍼 9종 데뷔 전 눈검수 — 파일럿 스테이징에서 직접 로드해 대표 호출을 격자로 캡처한다.
// dev 서버 불요(esbuild 실로드). node qa/shot-g2u5v2-helpers.mjs
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const result = await build({ entryPoints: ["qa/g2u5v2-pilot.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const m = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

const cases = [
  ["PS photo · 가림 없음", m.psExchangeFig({ mode: "photo" })],
  ["PS photo · hide in1·out2 (㉠㉡)", m.psExchangeFig({ mode: "photo", hide: ["in1", "out2"] })],
  ["PS resp · hide in1 (㉠)", m.psExchangeFig({ mode: "resp", hide: ["in1"] })],
  ["PS resp · arrowSyms + reverse out1", m.psExchangeFig({ mode: "resp", arrowSyms: true, reverse: ["out1"] })],
  ["LF · 4부위 + 인셋", m.leafPartsFig({ marks: [{ part: "xylem", sym: "㉠" }, { part: "chloro", sym: "㉡" }, { part: "phloem", sym: "㉢" }, { part: "stoma", sym: "㉣" }], inset: true })],
  ["LF · 기공만", m.leafPartsFig({ marks: [{ part: "stoma", sym: "㉠" }, { part: "cell", sym: "㉡" }] })],
  ["ST · 반반(청람/없음) ㉠㉡", m.starchLeafFig({ regions: [{ result: "blue", sym: "㉠" }, { result: "none", sym: "㉡" }] })],
  ["ST · 3구역 + 가운데 은박", m.starchLeafFig({ regions: [{ result: "blue", sym: "㉠" }, { result: "none", sym: "㉡" }, { result: "blue", sym: "㉢" }], cover: 1 })],
  ["ST · 얼룩무늬(ring) 반응 후", m.starchLeafFig({ regions: [{ result: "none", sym: "㉠" }, { result: "blue", sym: "㉡" }], ring: true })],
  ["ST · 얼룩무늬(ring) 반응 전", m.starchLeafFig({ regions: [{ result: "white" }, { result: "green" }], ring: true })],
  ["SP · 2곡선 up/down", m.gasSensorFig({ series: [{ name: "이산화 탄소", shape: "down" }, { name: "산소", shape: "up" }] })],
  ["SP · flat 후 변화 + ㉠㉡㉢", m.gasSensorFig({ series: [{ name: "이산화 탄소", shape: "flat-down" }], changeAt: 0.5, marks: [{ frac: 0.25, sym: "㉠" }, { frac: 0.5, sym: "㉡" }, { frac: 0.75, sym: "㉢" }] })],
  ["EX · 2패널(빛/차광)", m.sealedPlantFig({ panels: [{ plant: "live", cover: "none", label: "(가)" }, { plant: "live", cover: "foil", label: "(나)" }] })],
  ["EX · 3패널(산 식물/삶은 식물/빈 용기) + 석회수", m.sealedPlantFig({ panels: [{ plant: "live", cover: "dark", label: "(가)" }, { plant: "boiled", cover: "dark", label: "(나)" }, { plant: "none", cover: "dark", label: "(다)" }], lime: true })],
  ["FC · sat 1곡선 + 구간 ㉠㉡㉢", m.factorGraphFig({ kind: "sat", curves: [{}], xLabel: "빛의 세기", marks: [{ frac: 0.15, sym: "㉠" }, { frac: 0.45, sym: "㉡" }, { frac: 0.8, sym: "㉢" }] })],
  ["FC · peak · 축 라벨 가림", m.factorGraphFig({ kind: "peak", curves: [{}] })],
  ["FC · sat 2곡선(제한 요인 전환)", m.factorGraphFig({ kind: "sat", curves: [{ label: "짙은 조건", scale: 1 }, { label: "옅은 조건", scale: 0.62 }], xLabel: "빛의 세기" })],
  ["DN · 강한 낮 / 밤", m.dayNightGasFig({ panels: [{ light: "bright", inGas: "co2", outGas: "o2", label: "(가)" }, { light: "none", inGas: "o2", outGas: "co2", label: "(나)" }] })],
  ["DN · 흐린 낮 / 강한 낮", m.dayNightGasFig({ panels: [{ light: "dim", inGas: "o2", outGas: "co2", label: "(가)" }, { light: "bright", inGas: "co2", outGas: "o2", label: "(나)" }] })],
  ["GB · 4시각 막대 쌍", m.rateBarsFig({ groups: [{ label: "새벽", photo: 2, resp: 5 }, { label: "아침", photo: 5, resp: 5 }, { label: "한낮", photo: 12, resp: 5 }, { label: "한밤", photo: 0, resp: 5 }] })],
  ["TR · 물관+체관 3갈래 ㉠㉡", m.transportRouteFig({ routes: ["xylem", "phloem-up", "phloem-down", "phloem-fruit"], syms: [{ route: "xylem", sym: "㉠" }, { route: "phloem-fruit", sym: "㉡" }] })],
  ["TR · 물관만 · 방향 반전", m.transportRouteFig({ routes: ["xylem"], syms: [{ route: "xylem", sym: "㉠" }], reverse: ["xylem"] })],
];

fs.mkdirSync("qa/shots", { recursive: true });
fs.mkdirSync("tmp/g2u5v2-helpers", { recursive: true });
const cells = cases
  .map(([name, svg]) => `<div style="border:1px solid #ddd;border-radius:10px;padding:8px;background:#fff">
    <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${name}</div>
    <div style="max-width:352px">${svg}</div></div>`)
  .join("");
const html = `<!doctype html><meta charset="utf-8"><body style="background:#F2F4F6;margin:0;padding:12px">
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${cells}</div></body>`;
const file = path.resolve("tmp/g2u5v2-helpers/page.html");
fs.writeFileSync(file, html);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/shots/g2u5v2-helpers.png", fullPage: true });
console.log(`SAVED qa/shots/g2u5v2-helpers.png (${cases.length}컷)`);
await browser.close();
