// g2u3 v2 파일럿 갤러리 카드 전수 캡처(신작 헬퍼 데뷔 눈검수 · 문항 맥락 포함 — g2u2 v2 관행).
// PORT=6014 node qa/shot-g2u3v2-pilot.mjs → qa/shots/g2u3v2/NN.png (카드 단위 · 부록 포함)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "6014";
mkdirSync("qa/shots/g2u3v2", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 560, height: 1100 }, deviceScaleFactor: 1.5 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const cards = await page.locator("article.q").all();
console.log(`카드 ${cards.length}장`);
let i = 0;
for (const card of cards) {
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: `qa/shots/g2u3v2/${String(i).padStart(2, "0")}.png` });
  i += 1;
}
await browser.close();
console.log("완료: qa/shots/g2u3v2/");
