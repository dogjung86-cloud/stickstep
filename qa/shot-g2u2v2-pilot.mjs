// g2u2 v2 파일럿 갤러리 카드 전수 캡처(신작 헬퍼 데뷔 눈검수 — electronFlowFig 선례).
// PORT=6002 node qa/shot-g2u2v2-pilot.mjs → qa/shots/g2u2v2/<slot>.png (해설 접힌 상태 카드 단위)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "6002";
mkdirSync("qa/shots/g2u2v2", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
const cards = await page.locator("article.card").all();
console.log(`카드 ${cards.length}장`);
for (const card of cards) {
  const slot = await card.getAttribute("id");
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: `qa/shots/g2u2v2/${slot}.png` });
}
await browser.close();
console.log("완료: qa/shots/g2u2v2/");
