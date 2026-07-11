// g2u1 시험 그림 눈검수용 스크린샷 — 신규 examFigures g2u1 섹션 전부를 실제 문항 파라미터로 한 페이지에 렌더.
// PORT=<포트> node qa/shot-exam-figs-g2u1.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 3400 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const m = await import("/src/ui/examFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  const CURVE_X = [[0, 10], [20, 20], [40, 40], [60, 80]];
  const CURVE_Y = [[0, 32], [20, 34], [40, 36], [60, 38]];
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("chemMassVolExamFig A2·B5·C0.5 (e04)", m.chemMassVolExamFig({ lines: [{ label: "A", density: 2 }, { label: "B", density: 5 }, { label: "C", density: 0.5 }], vMax: 40, mMax: 100, vStep: 10, mStep: 20 }))}
    ${box("chemMassVolExamFig (가)1.5·(나)0.75 + dot(20,30) (e11)", m.chemMassVolExamFig({ lines: [{ label: "(가)", density: 1.5 }, { label: "(나)", density: 0.75 }], vMax: 40, mMax: 60, vStep: 10, mStep: 15, dots: [[20, 30]] }))}
    ${box("chemColumnFig A·B·C + P@2 (e19 — B·C 경계)", m.chemColumnFig({ layers: ["A", "B", "C"], objLabel: "P", objAt: 2 }))}
    ${box("chemColumnFig A~D (e20)", m.chemColumnFig({ layers: ["A", "B", "C", "D"] }))}
    ${box("chemSolCurveExamFig X 단일 + P/Q dots (e38 — P 곡선 위·Q 아래)", m.chemSolCurveExamFig({ curves: [{ label: "X", pts: CURVE_X }], tMax: 60, sMax: 120, tStep: 20, sStep: 20, dots: [[40, 40, "P"], [40, 20, "Q"]] }))}
    ${box("chemSolCurveExamFig X·Y + guideT20 (e42/e122)", m.chemSolCurveExamFig({ curves: [{ label: "X", pts: CURVE_X }, { label: "Y", pts: CURVE_Y }], tMax: 60, sMax: 120, tStep: 20, sStep: 20, guideT: [20] }))}
    ${box("chemSolCurveExamFig X + guideT[20,60] + dots (e47 — 80→20 석출 60)", m.chemSolCurveExamFig({ curves: [{ label: "X", pts: CURVE_X }], tMax: 60, sMax: 120, tStep: 20, sStep: 20, guideT: [20, 60], dots: [[60, 80], [20, 20]] }))}
    ${box("chemBoilCurvesFig — (가)(다) 82 같음·(나) 58·(라) 상승 (e71)", m.chemBoilCurvesFig())}
    ${box("examCurveFig heat p1=60 (e81 녹는점 60)", m.examCurveFig({ mode: "heat", start: 20, p1: 60, end: 90, t: [4, 8], tMax: 12, yMax: 100, yStep: 20 }))}
    ${box("examCurveFig cool p1=50 yStep25 (e83 어는점 50)", m.examCurveFig({ mode: "cool", start: 90, p1: 50, end: 20, t: [4, 8], tMax: 12, yMax: 100, yStep: 25 }))}
    ${box("examCurveFig 2단 p1=78 p2=100 (e148 증류 곡선)", m.examCurveFig({ mode: "heat", start: 20, p1: 78, p2: 100, end: 104, t: [3, 5, 8, 10], tMax: 12, yMax: 120, yStep: 20 }))}
    ${box("chemFunnelABFig ㉠/㉡ (e104)", m.chemFunnelABFig())}
    ${box("chemDistillApparatusFig A~D (e136·e137)", m.chemDistillApparatusFig())}
    ${box("svgTable 밀도표 (e05)", m.svgTable(["물질", "질량(g)", "부피(cm³)"], [["(가)", "27", "10"], ["(나)", "54", "20"], ["(다)", "40", "10"], ["(라)", "108", "40"]], { firstColHead: true }))}
    ${box("svgTable 녹는점·끓는점 (e74·e75)", m.svgTable(["물질", "녹는점(℃)", "끓는점(℃)"], [["(가)", "-39", "357"], ["(나)", "0", "100"], ["(다)", "-114", "78"], ["(라)", "81", "218"]], { firstColHead: true }))}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-g2u1-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-g2u1-figs.png");
await browser.close();
