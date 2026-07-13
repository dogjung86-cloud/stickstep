// m1u4 시험 figure 전 문항을 실제 저작 파라미터로 한 페이지에 모아 눈검수한다.
// PORT=5204 node qa/shot-exam-figs-m1u4.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5204";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 440, height: 2600 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

const result = await page.evaluate(async () => {
  const mods = await Promise.all(
    Array.from({ length: 13 }, (_, i) => import(`/src/content/exams/m1u4l${i + 1}.ts`)),
  );
  const pool = mods.flatMap((m) => Object.values(m).find(Array.isArray) ?? []);
  const figs = pool.filter((it) => it.figure);
  const cards = figs.map((it) => `<article style="margin:10px;padding:12px;border-radius:14px;background:#fff;border:1px solid #dfe4ec">
    <div style="font:800 12px sans-serif;color:#334155;margin-bottom:8px">${it.id} · ${it.lessonId} · ${it.type}</div>
    <div style="font:700 13px/1.45 sans-serif;color:#475569;margin-bottom:8px">${it.prompt}</div>
    <div style="max-width:360px;margin:auto">${it.figure}</div>
  </article>`).join("");
  document.body.innerHTML = `<main style="margin:0 auto;max-width:420px;padding:8px;background:#f2f4f7">${cards}</main>`;
  return { count: figs.length, ids: figs.map((it) => it.id) };
});
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/exam-m1u4-figs.png", fullPage: true });
const height = await page.evaluate(() => document.documentElement.scrollHeight);
const sliceH = Math.min(5000, Math.ceil(height / 3));
await page.setViewportSize({ width: 440, height: sliceH });
for (let i = 0; i < 3; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * sliceH);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `qa/shots/exam-m1u4-figs-${i + 1}.png` });
}
console.log(`SAVED qa/shots/exam-m1u4-figs.png (+분할 3장) · figure ${result.count}개 · ${result.ids.join(", ")}`);
await browser.close();
