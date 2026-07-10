// u4 시험 그림 눈검수용 스크린샷 — 신규 examFigures u4 섹션 전부를 한 페이지에 렌더.
// PORT=<포트> node qa/shot-exam-figs-u4.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 2600 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const m = await import("/src/ui/examFigures.ts");
  const box = (title, svg, dark = false) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:${dark ? "#0B1524" : "#fff"};border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:${dark ? "#9fb3d8" : "#333"};margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("phaseTriFig — A~F 방향 검수", m.phaseTriFig())}
    ${box("stateFlowFig — 분기 검수", m.stateFlowFig())}
    ${box("examCurveFig heat 물(-10→0→100) ㉠~㉤", m.examCurveFig({ mode: "heat", start: -10, p1: 0, p2: 100, end: 110, t: [2, 6, 10, 14], tMax: 18, yMin: -20, yMax: 120, yStep: 20, xStep: 2, secLabels: true }))}
    ${box("examCurveFig heat 수평1(p1=60, t 4~10)", m.examCurveFig({ mode: "heat", start: 20, p1: 60, end: 85, t: [4, 10], tMax: 14, yMax: 100, yStep: 20, xStep: 2 }))}
    ${box("examCurveFig cool(p1=50, yStep10, t 4~10)", m.examCurveFig({ mode: "cool", start: 75, p1: 50, end: 30, t: [4, 10], tMax: 14, yMax: 80, yStep: 10, xStep: 2 }))}
    ${box("examCurveFig cool 물(0℃, t 6~16)", m.examCurveFig({ mode: "cool", start: 25, p1: 0, end: -8, t: [6, 16], tMax: 20, yMin: -20, yMax: 40, yStep: 20, xStep: 2 }))}
    ${box("particlePairFig melt", m.particlePairFig("melt"), true)}
    ${box("particlePairFig freeze", m.particlePairFig("freeze"), true)}
    ${box("particlePairFig condense", m.particlePairFig("condense"), true)}
    ${box("particlePairFig sublime", m.particlePairFig("sublime"), true)}
    ${box("evapScaleFig", m.evapScaleFig())}
    ${box("sealedScaleFig", m.sealedScaleFig())}
    ${box("waterFreezeFig", m.waterFreezeFig())}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-u4-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-u4-figs.png");
await browser.close();
