// g2u7 시험 그림 눈검수용 스크린샷 — 신규 examFigures g2u7 섹션 + 데뷔 electronFlowFig를 실제 문항 파라미터로 렌더.
// PORT=<포트> node qa/shot-exam-figs-g2u7.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 5600 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const ex = await import("/src/ui/examFigures.ts");
  const ef = await import("/src/ui/elecFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("elecRubExamFig moved=2 (e02·e16 — (가)→(나) 전자 2개)", ex.elecRubExamFig({ moved: 2 }))}
    ${box("elecCanExamFig (−)막대 (e20 — ㉠가까운쪽 (+), 끌려옴)", ex.elecCanExamFig({ pol: "-" }))}
    ${box("elecScopeFig (e26 — 금속박 벌어짐·금속판 (+))", ex.elecScopeFig())}
    ${box("데뷔 electronFlowFig (e38 — (가)(나)=전류 방향)", ef.electronFlowFig())}
    ${box("elecViExamFig 15Ω 점(6,400) (e57 — R=15Ω)", ex.elecViExamFig({ lines: [{ label: "", r: 15 }], vMax: 6, vStep: 1, iMax: 500, iStep: 100, dots: [[6, 400]] }))}
    ${box("elecViExamFig A(5Ω)·B(60Ω) (e58 — B가 A의 12배)", ex.elecViExamFig({ lines: [{ label: "A", r: 5 }, { label: "B", r: 60 }], vMax: 6, vStep: 1, iMax: 600, iStep: 100 }))}
    ${box("elecViChoicesFig (e59 — 정답 ② 원점 직선·①은 원점 함정)", ex.elecViChoicesFig())}
    ${box("elecTwoCircuitFig series (e76 — (나) 직렬 2구)", ex.elecTwoCircuitFig({ right: "series" }))}
    ${box("elecTwoCircuitFig parallel (e77 — (나) 병렬 2구)", ex.elecTwoCircuitFig({ right: "parallel" }))}
    ${box("elecPointsFig series (e78 — ㉠=㉡=㉢)", ex.elecPointsFig({ mode: "series" }))}
    ${box("elecPointsFig parallel (e79 — ㉠=㉡+㉢)", ex.elecPointsFig({ mode: "parallel" }))}
    ${box("elecLabelFig 220V-600W (e95)", ex.elecLabelFig({ volt: 220, watt: 600 }))}
    ${box("elecFlowFig 열→움직임 (e103 — A주전자·B세탁기·C전등)", ex.elecFlowFig({ q1: "주로 열을 만드는 기구인가?", q2: "주로 움직임을 만드는 기구인가?" }))}
    ${box("elecCoilCompassFig (e116 — ㉠ 나침반·열린 스위치)", ex.elecCoilCompassFig())}
    ${box("elecMotorExamFig 기본 (e132 — (가)아래·(나)위)", ex.elecMotorExamFig())}
    ${box("elecMotorExamFig reverse (e142 — (가)위·(나)아래)", ex.elecMotorExamFig({ reverse: true }))}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-g2u7-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-g2u7-figs.png");
await browser.close();
