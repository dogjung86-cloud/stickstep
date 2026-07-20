// yeonho·eastAsia 카드만 고배율(3x) 요소 샷 — 헤더 클리핑·지도 디테일 확대 검수용.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const PORT = process.env.PORT || "5173";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 404, height: 900 }, deviceScaleFactor: 3 });
await page.goto(`http://localhost:${PORT}/qa-hisfigs.html`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.querySelectorAll(".card svg").length >= 35, undefined, { timeout: 15000 });
await page.waitForTimeout(500);
for (const label of ["yeonhoFig", "eastAsiaFig", "eastAsiaFig 기호판", "silverFlowFig", "searoutesFig marks", "triangleTradeFig"]) {
  const card = page.locator(".card", { has: page.locator("h3", { hasText: new RegExp(`^${label}$`) }) }).first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await card.screenshot({ path: `qa/shots/hisfigs-zoom-${label.replace(/\s+/g, "_")}.png` });
  console.log("SHOT", label);
}
await browser.close();
