// 부모용 소개 페이지(public/about.html) 눈검수 샷 — 데스크톱·모바일 풀페이지.
// PORT=<dev포트> node qa/shot-about-page.mjs → qa/shots/aboutpage-{desktop,mobile}.png
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

for (const [name, vp] of [
  ["desktop", { width: 1280, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
  page.on("requestfailed", (r) => console.log("REQFAIL:", r.url()));
  await page.goto(`http://localhost:${PORT}/about.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `qa/shots/aboutpage-${name}.png`, fullPage: true });
  console.log(`saved aboutpage-${name}.png`);
  await page.close();
}
await browser.close();
