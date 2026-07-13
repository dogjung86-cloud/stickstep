// m1u5 시험 figure 전 문항 자동 수집 눈검수 페이지.
// PORT=<포트> node qa/shot-exam-figs-m1u5.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 3000 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

const count = await page.evaluate(async () => {
  const mods = await Promise.all(
    Array.from({ length: 14 }, (_, i) => import(`/src/content/exams/m1u5l${i + 1}.ts`)),
  );
  const pools = mods.flatMap((mod) => Object.values(mod).find(Array.isArray) ?? []);
  const figures = pools.filter((item) => item.figure);
  const card = (item) => `
    <article style="margin:10px;padding:12px;border-radius:12px;background:#fff;border:1px solid #d7dce3">
      <div style="font:700 12px sans-serif;color:#344054;margin-bottom:7px">${item.id} · ${item.lessonId} · ${item.type}</div>
      <div style="font:600 13px/1.45 sans-serif;color:#101828;margin-bottom:8px">${item.prompt}</div>
      <div class="figure">${item.figure}</div>
    </article>`;
  document.body.innerHTML = `<main style="background:#f2f4f7;padding:1px">${figures.map(card).join("")}</main>`;
  for (const svg of document.querySelectorAll("svg")) {
    svg.style.display = "block";
    svg.style.width = "100%";
    svg.style.maxHeight = "260px";
    svg.style.height = "auto";
  }
  return figures.length;
});

await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-m1u5-figs.png", fullPage: true });
const total = await page.evaluate(() => document.body.scrollHeight);
const slices = Math.max(1, Math.min(5, Math.ceil(total / 5000)));
const sliceHeight = Math.ceil(total / slices);
await page.setViewportSize({ width: 420, height: Math.min(sliceHeight, 6000) });
for (let i = 0; i < slices; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * sliceHeight);
  await page.waitForTimeout(120);
  await page.screenshot({ path: `qa/shots/exam-m1u5-figs-${i + 1}.png` });
}
console.log(`SAVED qa/shots/exam-m1u5-figs.png (+분할 ${slices}장), figure 문항 ${count}개`);
await browser.close();
