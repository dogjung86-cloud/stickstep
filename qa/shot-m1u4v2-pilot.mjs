// 파일럿 시험지 스크린샷(스크롤 분할 — fullPage 프리즈 회피 관행).
// node qa/shot-m1u4v2-pilot.mjs → qa/shots/m1u4v2-pilot-N.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

const url = pathToFileURL("tmp/m1u4v2-pilot/index.html").href;
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 1000 } });
await page.goto(url, { waitUntil: "load" });
// 해설을 모두 펼쳐 검수 대상에 포함
await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
await page.waitForTimeout(300);
const total = await page.evaluate(() => document.body.scrollHeight);
let n = 0;
for (let y = 0; y < total; y += 940) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(120);
  n += 1;
  await page.screenshot({ path: `qa/shots/m1u4v2-pilot-${n}.png` });
}
console.log(`전체 높이 ${total}px → ${n}장 저장(qa/shots/m1u4v2-pilot-*.png)`);
await browser.close();
