// 검산 반영 수리 문항 집중 눈검수 샷 — 갤러리 index.html에서 해당 카드만 남겨 캡처.
// 실행: node qa/render-s1u1-full.mjs && node qa/shot-s1u1-fixes.mjs
import { chromium } from "playwright-core";

const IDS = [
  "s1u1e024", "s1u1e039", "s1u1e148", "s1u1e062", "s1u1e067",
  "s1u1e121", "s1u1e126", "s1u1e133", "s1u1e151", "s1u1e153",
  "s1u1e158", "s1u1e036", "s1u1e012", "s1u1e086", "s1u1e108",
];
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`file:///${process.cwd().replaceAll("\\", "/")}/tmp/s1u1-full/index.html`);
await page.waitForTimeout(600);
await page.evaluate((ids) => {
  document.querySelectorAll("details").forEach((d) => (d.open = true));
  const keep = new Set(ids);
  document.querySelectorAll(".card[data-id]").forEach((el) => { if (!keep.has(el.dataset.id)) el.remove(); });
}, IDS);
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/s1u1-fixes.png", fullPage: true });
console.log("saved qa/shots/s1u1-fixes.png");
await browser.close();
