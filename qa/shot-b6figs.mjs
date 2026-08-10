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
await browser.close();
