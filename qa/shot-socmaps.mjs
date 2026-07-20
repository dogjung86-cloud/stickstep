// 사회·역사 지도 그림 전수 검수 — public/qa-socmaps.html을 폰 폭으로 분할 캡처(스크롤 방식).
// PORT=<포트> node qa/shot-socmaps.mjs → qa/shots/socmaps-1..N.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const PORT = process.env.PORT || "5173";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 404, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/qa-socmaps.html`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.querySelectorAll(".card svg").length >= 30, undefined, { timeout: 15000 });
await page.waitForTimeout(600);
const total = await page.evaluate(() => document.body.scrollHeight);
let i = 0;
for (let y = 0; y < total; y += 860) {
  i += 1;
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(180);
  await page.screenshot({ path: `qa/shots/socmaps-${i}.png` });
  console.log("SHOT", i, "at", y, "/", total);
}
console.log("DONE", i, "shots");
await browser.close();
