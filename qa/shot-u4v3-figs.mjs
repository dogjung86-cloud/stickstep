// 중1 Ⅳ v3 — 그림 헬퍼 단독 렌더 눈검수(matter3Figures 전 그림 → qa/shots/u4v3-figs.png).
// 검수 항목: 텍스트 겹침·화살표 방향(가열=오른쪽 붉은, 냉각=왼쪽 푸른)·글자 12px 이상·입자 색 단서 없음.
//   PORT=5463 node qa/shot-u4v3-figs.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5463";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 760, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.evaluate(async () => {
  const m = await import("/src/ui/matter3Figures.ts");
  const figs = [
    ["diffuseTimeFig", m.diffuseTimeFig()], ["diffuseTimeFig quiz", m.diffuseTimeFig({ quiz: true })],
    ["evapParticleFig", m.evapParticleFig()],
    ["threeStatesFig", m.threeStatesFig()], ["threeStatesFig blank", m.threeStatesFig({ blank: true })],
    ["phaseCycleFig", m.phaseCycleFig()], ["phaseCycleFig blank", m.phaseCycleFig({ blank: true })],
    ["dishExpFig", m.dishExpFig()],
    ["arrangeChangeFig", m.arrangeChangeFig()], ["arrangeChangeFig blank", m.arrangeChangeFig({ blank: true })],
    ["volumeMassFig", m.volumeMassFig()],
    ["heatCurveFig", m.heatCurveFig()], ["heatCurveFig quiz", m.heatCurveFig({ quiz: true })],
    ["absorbArrangeFig", m.absorbArrangeFig()],
    ["coolCurveFig", m.coolCurveFig()], ["coolCurveFig quiz", m.coolCurveFig({ quiz: true })],
    ["releaseArrangeFig", m.releaseArrangeFig()], ["iceboxFig", m.iceboxFig()],
  ];
  const minis = ["diffuse", "evaporate", "selfMove", "solidBox", "liquidBox", "gasBox", "meltFreeze", "boilCondense", "sublime",
    "massSame", "volumeChange", "waterIce", "absorbHeat", "flatCurve", "meltBoil", "releaseHeat", "coolCurve", "surroundUse"];
  document.body.innerHTML = `<div id="figs" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px;background:#fff">${figs
    .map(([n, s]) => `<div style="border:1px solid #E5E8EB;border-radius:10px;padding:6px"><div style="font:700 11px sans-serif;color:#4E5968;margin-bottom:4px">${n}</div>${s}</div>`)
    .join("")}<div style="grid-column:1/-1;border:1px solid #E5E8EB;border-radius:10px;padding:6px"><div style="font:700 11px sans-serif;color:#4E5968;margin-bottom:4px">m3MiniArt ×${minis.length}</div><div style="display:grid;grid-template-columns:repeat(9,64px);gap:8px">${minis
      .map((k) => `<div style="width:64px;height:64px;border:1px solid #EEE;border-radius:8px">${m.m3MiniArt(k)}</div>`).join("")}</div></div></div>`;
});
await page.waitForTimeout(300);
const box = await page.locator("#figs").boundingBox();
await page.screenshot({ path: "qa/shots/u4v3-figs.png", clip: { x: 0, y: 0, width: 760, height: Math.ceil(box.height + 20) }, fullPage: true });
console.log("SHOT u4v3-figs", Math.ceil(box.height));
await browser.close();
