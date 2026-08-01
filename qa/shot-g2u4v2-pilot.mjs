// g2u4 v2 파일럿 갤러리 카드 전수 캡처(신작·재사용 헬퍼 데뷔 눈검수 · g2u1 v2 선례).
// PORT=6017 node qa/shot-g2u4v2-pilot.mjs → qa/shots/g2u4v2/<slot>.png
// PORT가 없으면 tmp/g2u4v2-full/index.html을 file:// 로 연다(dev 서버 상한 회피 모드).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

mkdirSync("qa/shots/g2u4v2", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 480, height: 980 } });
const url = process.env.PORT
  ? `http://localhost:${process.env.PORT}/`
  : `file:///${resolve("tmp/g2u4v2-full/index.html").replace(/\\/g, "/")}`;
if (!process.env.PORT) {
  // file:// 모드에선 절대 경로 사진("/exam/g2u4/…")이 루트로 풀린다 → 로컬 파일로 라우팅.
  await page.route("**/exam/g2u4/*", (route) => {
    const name = route.request().url().split("/").pop();
    route.fulfill({ path: resolve(`public/exam/g2u4/${name}`) });
  });
}
await page.goto(url, { waitUntil: "networkidle" });
const cards = await page.locator("article.q").all();
console.log(`카드 ${cards.length}장`);
for (const card of cards) {
  const tag = await card.locator(".q-tag").textContent();
  const slot = (tag.match(/슬롯 (\d+)/) ?? [])[1] ?? "unknown";
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: `qa/shots/g2u4v2/${slot}.png` });
}
await browser.close();
console.log("완료: qa/shots/g2u4v2/");
