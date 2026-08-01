// g2u8 v2 파일럿 갤러리 카드 전수 캡처(자체 눈검수 + 신작 헬퍼 데뷔 검수 · g2u2 v2 관행).
// PORT=6005 node qa/shot-g2u8v2-pilot.mjs → qa/shots/g2u8v2/<slot>.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "6005";
const OUT = "qa/shots/g2u8v2";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 760, height: 1400 } });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
const cards = await page.locator("article.q").all();
console.log(`카드 ${cards.length}장`);
for (const card of cards) {
  const tag = await card.locator(".q-tag").innerText();
  const slot = (tag.match(/슬롯 (\d+)/) ?? [])[1] ?? "unknown";
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: `${OUT}/${slot}.png` });
}
console.log(`캡처 완료 → ${OUT}`);
await browser.close();
