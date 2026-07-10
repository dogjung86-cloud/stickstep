// u5 시험 그림 눈검수용 스크린샷 — 신규 examFigures u5 섹션 전부를 한 페이지에 렌더.
// PORT=<포트> node qa/shot-exam-figs-u5.mjs (dev 서버 필수)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 2400 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const m = await import("/src/ui/examFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("forcePairFig 같은 방향 3+5", m.forcePairFig({ a: 3, b: 5 }))}
    ${box("forcePairFig 반대 7 vs 4", m.forcePairFig({ a: 7, b: 4, opposite: true }))}
    ${box("pushStillFig(6)", m.pushStillFig(6))}
    ${box("springExamGraph slope .75 dots 4,8", m.springExamGraph({ slope: 0.75, xMax: 12, xStep: 4, yMax: 9, yStep: 3, dots: [4, 8] }))}
    ${box("buoyThreeFig", m.buoyThreeFig())}
    ${box("floatBallFig", m.floatBallFig())}
    ${box("gravityAroundFig", m.gravityAroundFig())}
    ${box("motionFlowFig", m.motionFlowFig())}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-u5-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-u5-figs.png");
await browser.close();
