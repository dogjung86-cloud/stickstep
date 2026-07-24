// codex 검산 반영 문항 카드만 캡처(눈검수용) — tmp/m2u4v2-full/index.html에서 슬롯 태그로 탐색.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SLOTS = [25, 44, 47, 64, 68, 85, 87, 88, 93, 100, 114, 116, 120, 136, 139, 140, 150, 152, 184, 188, 189, 196];
const url = pathToFileURL("tmp/m2u4v2-full/index.html").href;
mkdirSync("qa/shots/m2u4v2-fixed", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 1400 } });
await page.goto(url, { waitUntil: "load" });
await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
await page.waitForTimeout(250);
for (const s of SLOTS) {
  const card = page.locator("article.q", { has: page.locator(".q-tag", { hasText: `슬롯 ${String(s).padStart(3, "0")} ·` }) });
  const n = await card.count();
  if (n !== 1) { console.log(`슬롯 ${s}: 카드 ${n}개 — 스킵`); continue; }
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);
  await card.screenshot({ path: `qa/shots/m2u4v2-fixed/slot-${String(s).padStart(3, "0")}.png` });
  console.log(`슬롯 ${s} 저장`);
}
await browser.close();
console.log("done");
