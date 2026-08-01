// g2u1 시험 그림 눈검수용 스크린샷 v2 — examFigures "g2u1 v2" 섹션(신작 6종+파라미터판)과 재사용
// 헬퍼를 실제 v2 문항 파라미터로 한 페이지에 렌더(구 v1 세팅 격자를 재출제 11호 세팅으로 교체).
// PORT=<포트> node qa/shot-exam-figs-g2u1.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 5200 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const m = await import("/src/ui/examFigures.ts");
  const c = await import("/src/ui/chemFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("신작 SC2 chemScatterExamFig (e206 — (라)(마) 동일 직선)", m.chemScatterExamFig({ pts: [["(가)", 20, 90], ["(나)", 10, 30], ["(다)", 30, 90], ["(라)", 10, 60], ["(마)", 20, 120]], vMax: 40, mMax: 150, vStep: 10, mStep: 30 }))}
    ${box("신작 GT chemGasTubesFig (e257 — 얼음물/따뜻한 물 × 마개)", m.chemGasTubesFig({ tubes: [{ label: "(가)", warm: false, capped: false }, { label: "(나)", warm: false, capped: true }, { label: "(다)", warm: true, capped: false }, { label: "(라)", warm: true, capped: true }] }))}
    ${box("신작 SF chemSepFlowFig (e313 — ㉮㉯㉰ 가림 칸)", m.chemSepFlowFig({ start: "톱밥 + 자갈 + 설탕 + 물", q1: "물 위에 뜨는가?", q2: "물에 녹아 있는가?" }))}
    ${box("신작 PM chemPureMixFig (e295 — (가)(다) 순물질)", m.chemPureMixFig({ boxes: [{ label: "(가)", comp: [9] }, { label: "(나)", comp: [5, 4] }, { label: "(다)", comp: [0, 9] }, { label: "(라)", comp: [6, 3] }] }))}
    ${box("신작 FT chemFilterFig (e330 — ㉠ 종이 위·㉡ 거른 용액)", m.chemFilterFig())}
    ${box("신작 MB chemMixBoilFig (e302 — plat100·mixStart105)", m.chemMixBoilFig({ plat: 100, mixStart: 105, yMin: 20, yMax: 120, yStep: 20 }))}
    ${box("신작 MB 값 읽기 세팅 (e307 — 110 눈금 위·60~120/10)", m.chemMixBoilFig({ plat: 100, mixStart: 110, yMin: 60, yMax: 120, yStep: 10 }))}
    ${box("chemBoilCurvesParamFig (e274 — 64·88)", m.chemBoilCurvesParamFig({ t1: 64, t2: 88 }))}
    ${box("chemBoilCurvesParamFig 변형 (e285 — 48·76)", m.chemBoilCurvesParamFig({ t1: 48, t2: 76 }))}
    ${box("chemMassVolExamFig 3선 (e204 — A6·B3·C1)", m.chemMassVolExamFig({ lines: [{ label: "A", density: 6 }, { label: "B", density: 3 }, { label: "C", density: 1 }], vMax: 40, mMax: 120, vStep: 10, mStep: 20 }))}
    ${box("chemMassVolExamFig 2선+dots (e205 — P8·Q2 4배)", m.chemMassVolExamFig({ lines: [{ label: "P", density: 8 }, { label: "Q", density: 2 }], vMax: 15, mMax: 120, vStep: 5, mStep: 20, dots: [[10, 80], [10, 20]] }))}
    ${box("chemMassVolExamFig 값 읽기 (e216 — dot(40,72)=1.8)", m.chemMassVolExamFig({ lines: [{ label: "A", density: 1.8 }], vMax: 40, mMax: 90, vStep: 10, mStep: 18, dots: [[40, 72]] }))}
    ${box("chemColumnFig 3층+P 경계 (e220)", m.chemColumnFig({ layers: ["㉠", "㉡", "㉢"], objLabel: "P", objAt: 1 }))}
    ${box("chemColumnFig 4층 (e221)", m.chemColumnFig({ layers: ["(가)", "(나)", "(다)", "(라)"] }))}
    ${box("chemSolCurveExamFig 포화 판정 (e240 — X'+Q(40,40))", m.chemSolCurveExamFig({ curves: [{ label: "X", pts: [[0, 25], [20, 40], [40, 60], [60, 95]] }], tMax: 60, sMax: 100, tStep: 20, sStep: 20, dots: [[40, 40, "Q"]] }))}
    ${box("chemSolCurveExamFig 환산 판정 (e248 — W 40℃=64·sStep16)", m.chemSolCurveExamFig({ curves: [{ label: "W", pts: [[0, 16], [20, 32], [40, 64], [60, 96]] }], tMax: 60, sMax: 96, tStep: 20, sStep: 16, guideT: [40] }))}
    ${box("chemSolCurveExamFig 석출 num (e333 — R 100→25 = 75)", m.chemSolCurveExamFig({ curves: [{ label: "R", pts: [[0, 10], [20, 25], [40, 55], [60, 100]] }], tMax: 60, sMax: 125, tStep: 20, sStep: 25, guideT: [20, 60], dots: [[60, 100], [20, 25]] }))}
    ${box("chemSolCurveExamFig 석출 시작 (e338 — guideS50·guideT20)", m.chemSolCurveExamFig({ curves: [{ label: "D", pts: [[0, 22], [20, 50], [40, 82], [60, 108]] }], tMax: 60, sMax: 125, tStep: 20, sStep: 25, guideS: [50], guideT: [20] }))}
    ${box("chemSolCurveExamFig 기체 하강 (e267 — aria 기체 치환)", m.chemSolCurveExamFig({ curves: [{ label: "X", pts: [[0, 8], [20, 6], [40, 4], [60, 3]] }], tMax: 60, sMax: 10, tStep: 20, sStep: 2 }))}
    ${box("examCurveFig heat 녹는점 (e286 — 45)", m.examCurveFig({ mode: "heat", start: 15, p1: 45, end: 75, t: [4, 8], tMax: 12, yMax: 90, yStep: 15 }))}
    ${box("examCurveFig cool 어는점 (e287 — 60)", m.examCurveFig({ mode: "cool", start: 90, p1: 60, end: 35, t: [4, 8], tMax: 12, yMax: 105, yStep: 15 }))}
    ${box("examCurveFig heat 끓는점 (e288 — 75·yStep25)", m.examCurveFig({ mode: "heat", start: 20, p1: 75, end: 75, t: [5, 10], tMax: 14, yMax: 100, yStep: 25 }))}
    ${box("examCurveFig 2단+구간 라벨 (e356 — ㉠~㉤)", m.examCurveFig({ mode: "heat", start: 20, p1: 78, p2: 100, end: 102, t: [3, 6, 9, 12], tMax: 14, yMax: 120, yStep: 20, secLabels: true }))}
    ${box("examCurveFig 2단 첫 수평 읽기 (e357 — 78 눈금 위·yMin30/12)", m.examCurveFig({ mode: "heat", start: 30, p1: 78, p2: 100, end: 104, t: [3, 6, 10, 13], tMax: 15, yMin: 30, yMax: 114, yStep: 12, xStep: 3 }))}
    ${box("examCurveFig 2단 둘째 수평 읽기 (e358 — 100 눈금 위)", m.examCurveFig({ mode: "heat", start: 20, p1: 78, p2: 100, end: 103, t: [4, 7, 10, 13], tMax: 15, yMax: 120, yStep: 20, xStep: 3 }))}
    ${box("chemFunnelABFig ㉠/㉡ (e309)", m.chemFunnelABFig())}
    ${box("chemDistillApparatusFig A~D (e344~e346)", m.chemDistillApparatusFig())}
    ${box("svgTable 관찰 기록 (e202)", m.svgTable(["항목", "고체 A", "고체 B"], [["색깔", "은백색", "은백색"], ["질량", "71 g", "142 g"], ["부피", "20 cm³", "40 cm³"], ["녹는점", "74 ℃", "118 ℃"]], { firstColHead: true }))}
    ${box("svgTable 녹는점·끓는점 B벌 (e276 — 음수 렌더)", m.svgTable(["물질", "녹는점(℃)", "끓는점(℃)"], [["㉠", "-120", "-25"], ["㉡", "-32", "79"], ["㉢", "5", "102"], ["㉣", "63", "305"]], { firstColHead: true }))}
    ${box("chemFigures solCurves3Fig (e241 — aria 중립화 소급본)", c.solCurves3Fig())}
    ${box("chemFigures waterSaltBoilFig (e296 — aria 중립화 소급본)", c.waterSaltBoilFig())}
    ${box("chemFigures crudeTowerFig (e348)", c.crudeTowerFig())}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-g2u1-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-g2u1-figs.png");
await browser.close();
