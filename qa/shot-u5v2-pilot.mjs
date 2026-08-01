// u5 v2 파일럿 갤러리 전 카드 캡처(그림 단독 렌더보다 문항 맥락 포함 캡처가 검수력 우위 — g2u2 v2 관행).
// PORT=6010 node qa/shot-u5v2-pilot.mjs → qa/shots/u5v2/pilot-*.png (세로 분할 스크롤 캡처)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "6010";
mkdirSync("qa/shots/u5v2", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1060, height: 1400 } });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
// 해설 접힘 상태로 문항·그림만(검수 1차는 그림·문두·보기)
const H = await page.evaluate(() => document.body.scrollHeight);
const shots = Math.ceil(H / 1400);
for (let i = 0; i < shots; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * 1400);
  await page.waitForTimeout(160);
  await page.screenshot({ path: `qa/shots/u5v2/pilot-${String(i).padStart(2, "0")}.png` });
}
console.log(`캡처 완료: ${shots}장 (문서 높이 ${H}px)`);
await browser.close();
