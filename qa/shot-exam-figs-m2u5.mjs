// m2u5 시험 그림 눈검수용 스크린샷 — 풀 파일 11개에서 figure가 있는 전 문항을 자동 수집해
// 실제 저작 파라미터 그대로 한 페이지에 렌더(문항 id·유형 라벨 포함). m2u4 자동화판 계승.
// PORT=<포트> node qa/shot-exam-figs-m2u5.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 3000 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

const count = await page.evaluate(async () => {
  const mods = await Promise.all(
    ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11"].map((s) => import(`/src/content/exams/m2u5${s}.ts`)),
  );
  const pools = mods.flatMap((m) => Object.values(m).find(Array.isArray) ?? []);
  const figs = pools.filter((it) => it.figure);
  const box = (it) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${it.id} · ${it.type} · diff${it.diff ?? "?"}</div>${it.figure}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">${figs.map(box).join("")}</div>`;
  return figs.length;
});
await page.waitForTimeout(400);
// 그림이 많아 세로가 길다 — fullPage 한 장 + 스크롤 분할 5장(m1u6 계보, 클립은 뷰포트 밖이라 스크롤로)
await page.screenshot({ path: "qa/shots/exam-m2u5-figs.png", fullPage: true });
const total = await page.evaluate(() => document.body.scrollHeight);
const SLICES = 5;
const sliceH = Math.ceil(total / SLICES);
await page.setViewportSize({ width: 420, height: Math.min(sliceH, 6000) });
for (let i = 0; i < SLICES; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * sliceH);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `qa/shots/exam-m2u5-figs-${i + 1}.png` });
}
console.log(`SAVED qa/shots/exam-m2u5-figs.png (+분할 ${SLICES}장) — figure 문항 ${count}개`);
await browser.close();
