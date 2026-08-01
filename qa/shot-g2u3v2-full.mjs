// g2u3 v2 확대 160문항 갤러리 카드 전수 캡처(신규 그림 눈검수 · 카드 단위 — 파일럿 shot 계승).
// PORT=6014 node qa/shot-g2u3v2-full.mjs → qa/shots/g2u3v2-full/eNNN.png (문항 id 파일명)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "6014";
mkdirSync("qa/shots/g2u3v2-full", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 560, height: 1100 }, deviceScaleFactor: 1.5 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const cards = await page.locator("article.q").all();
console.log(`카드 ${cards.length}장`);
let i = 0;
for (const card of cards) {
  const id = (await card.getAttribute("data-id")) || `x${String(i).padStart(3, "0")}`;
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: `qa/shots/g2u3v2-full/${id.replace("g2u3", "")}.png` });
  i += 1;
}
await browser.close();
console.log("완료: qa/shots/g2u3v2-full/");
