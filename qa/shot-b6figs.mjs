// body3Figures 그림 단독 렌더 눈검수 — 라스터 위 라벨 좌표 정렬 확인용.
//   PORT=5437 node qa/shot-b6figs.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5437";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 980 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);
await page.evaluate(async () => {
  const m = await import("/src/ui/body3Figures.ts");
  document.body.innerHTML = `<div style="width:380px;margin:10px auto;display:grid;gap:14px;background:#fff">
    <div id="f1">${m.digestReviewFig()}</div>
    <div id="f2">${m.villusLabeledFig()}</div>
  </div>`;
});
await page.waitForTimeout(1200);
await page.screenshot({ path: "qa/shots/b6figs-absorb.png", fullPage: true });
console.log("SHOT b6figs-absorb");

// 라스터 교체분(심장·기체 교환·콩팥단위) — blanks 모드까지 한 번에.
await page.evaluate(async () => {
  const m = await import("/src/ui/body3Figures.ts");
  document.body.innerHTML = `<div style="width:380px;margin:10px auto;display:grid;gap:14px;background:#fff">
    <div id="g1">${m.heartMapFig()}</div>
    <div id="g2">${m.gasExchangeFig()}</div>
    <div id="g3">${m.gasExchangeFig(["o2"])}</div>
  </div>`;
});
await page.waitForTimeout(1200);
await page.screenshot({ path: "qa/shots/b6figs-heart-gas.png", fullPage: true });
console.log("SHOT b6figs-heart-gas");

await page.evaluate(async () => {
  const m = await import("/src/ui/body3Figures.ts");
  document.body.innerHTML = `<div style="width:380px;margin:10px auto;display:grid;gap:14px;background:#fff">
    <div id="n1">${m.nephronMapFig()}</div>
    <div id="n2">${m.nephronMapFig(["glom"])}</div>
  </div>`;
});
await page.waitForTimeout(1200);
await page.screenshot({ path: "qa/shots/b6figs-nephron.png", fullPage: true });
console.log("SHOT b6figs-nephron");
await browser.close();
