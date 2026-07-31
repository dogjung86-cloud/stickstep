// u1 v2 파일럿 갤러리 카드 전수 캡처(그림·문항 눈검수). g2u2 v2 shot-*-pilot 계보.
// PORT=6007 node qa/shot-u1v2-pilot.mjs  → qa/shots/u1v2/*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const PORT = process.env.PORT || 6007;
const OUT = "qa/shots/u1v2";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
// 해설 펼치기(정답·해설도 함께 검수)
await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
await page.evaluate(() => { document.querySelector(".cols").style.columnCount = "1"; });
await page.waitForTimeout(600);
const cards = await page.$$(".q");
console.log(`카드 ${cards.length}장 캡처`);
for (let i = 0; i < cards.length; i++) {
  const id = String(i + 1).padStart(2, "0");
  await cards[i].scrollIntoViewIfNeeded();
  await page.waitForTimeout(90);
  await cards[i].screenshot({ path: `${OUT}/card-${id}.png` });
}
await browser.close();
console.log(`완료 → ${OUT}/`);
