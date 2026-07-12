// m1u2 시험 그림 눈검수용 스크린샷.
// PORT=5202 node qa/shot-exam-figs-m1u2.mjs (전용 Vite 서버 필요)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5202";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 2400 }, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });

const count = await page.evaluate(async () => {
  const modules = await Promise.all(
    Array.from({ length: 9 }, (_, index) => import(`/src/content/exams/m1u2l${index + 1}.ts`)),
  );
  const pools = modules.flatMap((mod) => Object.values(mod).find(Array.isArray) ?? []);
  const figures = pools.filter((item) => item.figure);
  const card = (item) => `
    <article style="margin:12px;padding:14px;border-radius:14px;background:#fff;border:1px solid #ddd">
      <div style="font:800 12px sans-serif;color:#334155;margin-bottom:8px">${item.id} · ${item.type} · diff${item.diff}</div>
      <div style="font:700 14px/1.55 sans-serif;color:#25324a;margin-bottom:10px">${item.prompt}</div>
      ${item.figure}
    </article>`;
  document.body.innerHTML = `<main style="margin:0;padding:8px;background:#f2f1f8">${figures.map(card).join("")}</main>`;
  document.documentElement.style.overflow = "auto";
  document.body.style.overflow = "auto";
  return figures.length;
});

await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-m1u2-figs.png", fullPage: true });
console.log(`SAVED qa/shots/exam-m1u2-figs.png, figure 문항 ${count}개`);
await browser.close();
