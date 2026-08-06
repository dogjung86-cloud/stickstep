// s1u2 갤러리 전수 눈검수 샷 — tmp/s1u2-full/index.html을 세로로 잘라 시트 저장.
// 실행: node qa/render-s1u2-full.mjs 후 node qa/shot-s1u2-gallery.mjs → qa/shots/s1u2-gallery-N.png
// (스크롤 방식 분할 — fullPage 캡처는 카드가 많으면 하단 페인트가 얼어붙는 사고 이력)
import { chromium } from "playwright-core";
import fs from "node:fs";

fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1240, height: 1500 }, deviceScaleFactor: 1.6 });
await page.goto(`file:///${process.cwd().replace(/\\/g, "/")}/tmp/s1u2-full/index.html`);
await page.waitForTimeout(700);
const total = await page.evaluate(() => document.body.scrollHeight);
const step = 1400;
let n = 0;
for (let y = 0; y < total; y += step) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(280);
  n++;
  await page.screenshot({ path: `qa/shots/s1u2-gallery-${n}.png` });
}
const broken = await page.evaluate(() => [...document.images].filter((im) => !im.complete || im.naturalWidth <= 0).map((im) => im.src));
await browser.close();
console.log(`시트 ${n}장 저장(qa/shots/s1u2-gallery-*.png) · 총 높이 ${total}px`);
if (broken.length) { console.log("BROKEN IMAGES:", broken); process.exit(1); }
console.log("이미지 로드 정상");
