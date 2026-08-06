// s1u1 갤러리 스크린샷(눈검수용) — tmp/s1u1-full/index.html을 file://로 열어 분할 캡처.
// 사용: node qa/shot-s1u1-gallery.mjs [프리픽스] — 기본 s1u1-gallery
import { chromium } from "playwright-core";

const prefix = process.argv[2] ?? "s1u1-gallery";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 1400 }, deviceScaleFactor: 1.6 });
await page.goto(`file:///${process.cwd().replace(/\\/g, "/")}/tmp/s1u1-full/index.html`);
await page.waitForTimeout(700);
const H = await page.evaluate(() => document.body.scrollHeight);
const shots = Math.ceil(H / 1400);
for (let i = 0; i < shots; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * 1400);
  await page.waitForTimeout(220);
  await page.screenshot({ path: `qa/shots/${prefix}-${i + 1}.png` });
}
console.log(`saved ${shots} shots (height ${H}) → qa/shots/${prefix}-N.png`);
const broken = await page.evaluate(() => [...document.images].filter((im) => !im.complete || im.naturalWidth <= 0).map((im) => im.src));
if (broken.length) { console.log("BROKEN IMAGES:", broken); process.exit(1); }
await browser.close();
