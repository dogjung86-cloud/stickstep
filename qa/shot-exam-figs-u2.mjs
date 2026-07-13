// u2 시험 풀에서 figure 문항을 자동 수집해 한 페이지 렌더링·눈검수한다.
// PORT=<포트> node qa/shot-exam-figs-u2.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

const count = await page.evaluate(async () => {
  const { U2_EXAM } = await import("/src/content/exams/u2.ts");
  const seen = new Set();
  const cards = [];
  for (const it of U2_EXAM.pool) {
    if (!it.figure) continue;
    const key = `${it.figureDark ? "dark" : "light"}:${it.figure}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push(`<section style="margin:10px;padding:12px;border-radius:14px;background:${it.figureDark ? "#0B1524" : "#fff"};border:1px solid #DDE3EA;break-inside:avoid">
      <div style="font:800 12px Pretendard,sans-serif;color:${it.figureDark ? "#DCE8FF" : "#333"};margin-bottom:8px">${it.id} · ${it.lessonId}</div>
      <div>${it.figure}</div>
    </section>`);
  }
  document.body.innerHTML = `<main style="width:410px;margin:0 auto;padding:8px;background:#F2F4F6">${cards.join("")}</main>`;
  return cards.length;
});

await page.waitForFunction(() => [...document.images].every((img) => img.complete));
await page.waitForTimeout(700);
const broken = await page.evaluate(() => [...document.images].filter((img) => img.naturalWidth <= 0).map((img) => img.getAttribute("src")));
if (broken.length) throw new Error(`BROKEN IMAGES: ${broken.join(", ")}`);
await page.screenshot({ path: "qa/shots/exam-u2-figs.png", fullPage: true });
const height = await page.evaluate(() => document.documentElement.scrollHeight);
await page.setViewportSize({ width: 430, height: 2400 });
let parts = 0;
for (let y = 0; y < height; y += 2400) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(80);
  await page.screenshot({ path: `qa/shots/exam-u2-figs-${String(parts + 1).padStart(2, "0")}.png` });
  parts++;
}
console.log(`SAVED qa/shots/exam-u2-figs.png cards=${count} images=${await page.locator("img").count()} parts=${parts}`);
await browser.close();
