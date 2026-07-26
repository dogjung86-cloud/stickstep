// g2u7 v2 파일럿 갤러리 눈검수 샷 — 신작 헬퍼 7종 데뷔 카드 + 대표 재사용·사진 카드를 슬롯별 캡처.
// 갤러리 정적 서버(launch.json "g2u7v2-full" · 6003) 가동 후: PORT=6003 node qa/shot-g2u7v2-pilot.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "6003";
const SLOTS = process.argv[2]
  ? process.argv[2].split(",")
  : ["205", "213", "224", "243", "248", "254", "277", "285", "297", "303", "321", "336", "342", "344", "261", "341", "304", "225"];
fs.mkdirSync("qa/shots/g2u7v2", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 760, height: 1400 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
for (const s of SLOTS) {
  const card = page.locator(".q", { has: page.locator(`.q-tag:text-matches("슬롯 ${s} ")`) });
  if ((await card.count()) === 0) {
    console.log(`SKIP 슬롯 ${s}(카드 없음)`);
    continue;
  }
  await card.first().evaluate((el) => el.querySelector("details")?.setAttribute("open", ""));
  await card.first().screenshot({ path: `qa/shots/g2u7v2/slot-${s}.png` });
  console.log(`SAVED qa/shots/g2u7v2/slot-${s}.png`);
}
await browser.close();
