// u7 v2 파일럿 갤러리 카드 전수 캡처(눈검수용 — g2u2 v2 계보: 그림 단독 렌더보다 문항 맥락 포함).
// PORT=6004 node qa/shot-u7v2-pilot.mjs → qa/shots/u7v2/<슬롯>.png (+preview-*.png)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "6004";
mkdirSync("qa/shots/u7v2", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 860, height: 1400 } });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
// 해설은 접힌 채 캡처(검수는 문항면 우선 — 해설은 텍스트 검산 몫).
const cards = page.locator("article.q");
const n = await cards.count();
for (let i = 0; i < n; i++) {
  const card = cards.nth(i);
  const tag = await card.locator(".q-tag").innerText();
  const slot = (tag.match(/슬롯 (\d+)/) ?? [])[1];
  const name = slot ? `${slot}` : `preview-${i}`;
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: `qa/shots/u7v2/${name}.png` });
  console.log("SHOT", name, "|", tag.slice(0, 60));
}
await browser.close();
console.log(`DONE ${n}장`);
