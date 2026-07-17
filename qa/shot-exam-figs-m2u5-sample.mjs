// m2u5 시험 그림 헬퍼 17종 "저작 전" 샘플 렌더 눈검수(브리프 시그니처 고정용).
// 풀 파일이 아직 없으므로 인라인 샘플 파라미터로 전 헬퍼를 렌더한다. m2u4 샷 문법 계승.
// PORT=<포트> node qa/shot-exam-figs-m2u5-sample.mjs (dev 서버 필수)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 3000 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

const count = await page.evaluate(async () => {
  const m = await import("/src/ui/examFiguresMath.ts");
  const S = [];
  const add = (t, svg) => S.push([t, svg]);
  // 1. m2ExamSimQuadPairFig — 사각형 닮음 쌍(걷기 각 95·70·110·85, ratio 2/3)
  add("simQuadPair 기본(각·변 라벨)", m.m2ExamSimQuadPairFig({
    angles: [95, 70, 110, 85], sides: [1, 1.25], ratio: 2 / 3,
    labelsL: [null, "70°", null, "85°"], labelsR: ["95°", null, "x°", null],
    sidesL: ["9 cm", null, null, null], sidesR: ["6 cm", null, null, "y cm"],
  }));
  add("simQuadPair rect 반례(닮음 아님)", m.m2ExamSimQuadPairFig({
    rect: [30, 20, 24, 15],
    sidesL: [null, "30", "20", null], sidesR: [null, "24", "15", null],
  }));
  // 2. m2ExamTriPairFig
  add("triPair SAS(끼인각 55° 공유·비 2:3)", m.m2ExamTriPairFig({
    B1: 55, C1: 48, ratio: 2 / 3,
    labels1: { B: "55°" }, labels2: { B: "55°" },
    sides1: { AB: "12 cm", BC: "9 cm" }, sides2: { AB: "8 cm", BC: "6 cm" },
  }));
  add("triPair AA 회전+반전(대응 찾기)", m.m2ExamTriPairFig({
    B1: 72, C1: 41, ratio: 0.6, flip2: true, rot2: 28,
    labels1: { B: "72°", C: "41°" }, labels2: { A: "67°", B: "72°" },
  }));
  // 3. m2ExamTriSplitFig
  add("triSplit para(AD:DB=2:1)", m.m2ExamTriSplitFig({
    B: 64, C: 52, t: 2 / 3, mode: "para",
    labels: { AD: "8 cm", DB: "4 cm", AE: "6 cm", EC: "x cm", DE: "7 cm", BC: "y cm" },
  }));
  add("triSplit swapped(∠ADE=∠C 뒤집힘)", m.m2ExamTriSplitFig({
    B: 58, C: 46, t: 0.42, mode: "swapped",
    labels: { AD: "4 cm", AB: "12 cm", AC: "8 cm" },
    marks: [{ at: "ADE", label: "●" }, { at: "C", label: "●" }],
  }));
  add("triSplit free(평행 아님 반례)", m.m2ExamTriSplitFig({
    B: 60, C: 50, t: 0.5, s: 0.62, mode: "free",
    labels: { AD: "5 cm", DB: "5 cm", AE: "6 cm", EC: "4 cm" },
  }));
  // 4. m2ExamXCrossFig
  add("xCross 평행(AB∥DC 2:3)", m.m2ExamXCrossFig({
    rTop: [2, 3], rSide: [2, 3], paraMarks: true,
    labels: { OA: "6 cm", OC: "9 cm", AB: "8 cm", DC: "x cm" },
  }));
  add("xCross 맞꼭지각만(비 다름)", m.m2ExamXCrossFig({
    rTop: [3, 4], rSide: [2, 5],
    labels: { OA: "9", OC: "12", OB: "6", OD: "15" },
    marks: [{ at: "AOB", label: "●" }],
  }));
  // 5. m2ExamRightAltFig
  add("rightAlt(BD 4·DC 9 → AD 실좌표 6)", m.m2ExamRightAltFig({
    bd: 4, dc: 9, rightAtA: true,
    labels: { BD: "4 cm", DC: "9 cm", AD: "x cm" },
  }));
  // 6. m2ExamParaLinesFig
  add("paraLines 3선 1사선(6:9)", m.m2ExamParaLinesFig({
    gaps: [6, 9], names: ["l", "m", "n"],
    cuts: [{ x0: 96, x1 : 176, labels: ["6 cm", "9 cm"] }, { x0: 250, x1: 190, labels: ["4 cm", "x cm"] }],
  }));
  add("paraLines 4선 등간격+교차 사선", m.m2ExamParaLinesFig({
    gaps: [5, 5, 5], names: ["l", "m", "n", "p"],
    cuts: [{ x0: 110, x1: 210, labels: [null, "x cm", null] }, { x0: 240, x1: 120, color: "#E8547E", labels: ["9 cm", null, null] }],
  }));
  // 7. m2ExamTrapCutFig
  add("trapCut(위 6·아래 14·t=0.5 중점)", m.m2ExamTrapCutFig({
    top: 6, bot: 14, t: 0.5, midTicks: true, paraMarks: true,
    labels: { AD: "6 cm", BC: "14 cm", EF: "x cm" },
  }));
  add("trapCut 대각선 보조(t=1/3)", m.m2ExamTrapCutFig({
    top: 9, bot: 15, t: 1 / 3, diag: true, paraMarks: true,
    labels: { AD: "9 cm", BC: "15 cm", AE: "4 cm", EB: "8 cm", EF: "x cm" },
  }));
  add("trapCut perp(피타 사다리꼴 — t=1·수선 H)", m.m2ExamTrapCutFig({
    top: 8, bot: 14, t: 1, perp: true, paraMarks: true,
    labels: { AD: "8 cm", BC: "14 cm", DC: "10 cm", DH: "x cm", HC: "6 cm" },
  }));
  // 8. m2ExamMidsegFig
  add("midseg MN(BC 22 → MN 실절반)", m.m2ExamMidsegFig({
    B: 62, C: 48, labels: { BC: "22 cm", MN: "x cm" }, paraMarks: true,
    marks: [{ at: "B", label: "62°" }, { at: "AMN", label: "y°" }],
  }));
  add("midseg three(세 중점 삼각형)", m.m2ExamMidsegFig({
    B: 58, C: 50, mode: "three",
    labels: { AB: "12 cm", BC: "16 cm", AC: "14 cm" },
  }));
  // 9. m2ExamMidQuadFig
  add("midQuad(대각선 both·PQRS 채움)", m.m2ExamMidQuadFig({
    preset: 0, diag: "both", shade: true,
    labels: { AC: "16 cm", BD: "12 cm" },
  }));
  add("midQuad preset 2(치우친 사각형)", m.m2ExamMidQuadFig({
    preset: 2, labels: { PQ: "x cm", QR: "y cm" },
  }));
  // 10. m2ExamCentroidFig
  add("centroid 중선 1(AD 라벨 분리)", m.m2ExamCentroidFig({
    B: 58, C: 44, medians: ["AD"], ticks: ["BD"],
    segLabels: [{ on: "AG", label: "x cm" }, { on: "GD", label: "5 cm" }],
  }));
  add("centroid 중선 3+6조각 음영", m.m2ExamCentroidFig({
    B: 56, C: 47, medians: ["AD", "BE", "CF"], shade: ["GBD", "GDC"],
  }));
  add("centroid ef(EF∥BC, G 통과)", m.m2ExamCentroidFig({
    B: 60, C: 42, medians: ["AD"], ef: true,
    segLabels: [{ on: "BC", label: "18 cm" }],
  }));
  add("centroid g2(이중 무게중심)", m.m2ExamCentroidFig({
    B: 57, C: 46, medians: ["AD"], g2: true,
    segLabels: [{ on: "AD", label: "27 cm" }],
  }));
  // 11. m2ExamPythaSquaresFig
  add("pythaSquares(9·16·㉠)", m.m2ExamPythaSquaresFig({
    a: 4, b: 3, areas: ["16 cm²", "9 cm²", "㉠"],
  }));
  add("pythaSquares(넓이 2개→다리 역산)", m.m2ExamPythaSquaresFig({
    a: 12, b: 5, areas: ["144 cm²", "㉠", "169 cm²"],
  }));
  // 12. m2ExamRightTriFig
  add("rightTri 기본(15·8·x)", m.m2ExamRightTriFig({
    a: 15, b: 8, labels: { a: "15 cm", b: "8 cm", c: "x cm" },
  }));
  add("rightTri dual(연쇄 2·3·6)", m.m2ExamRightTriFig({
    a: 3, b: 2, dual: { d: 6, dLabel: "6 cm", hypLabel: "x cm" },
    labels: { a: "3 cm", b: "2 cm" },
  }));
  // 13. m2ExamGridRightFig
  add("gridRight(8×8 모눈·3-4 삼각형+빗변 정사각형 격자 안)", m.m2ExamGridRightFig({
    cols: 8, rows: 8, tri: [[4, 1], [7, 1], [7, 5]], hypSquare: true, areaLabel: "㉠",
    legLabels: ["3 cm", "4 cm"], unitNote: "모눈 한 칸: 1 cm",
  }));
  // 14. m2ExamConeCutFig
  add("coneCut 3등분(부피 라벨)", m.m2ExamConeCutFig({
    cuts: 3, names: ["A", "B", "C"], volLabels: ["4 cm³", null, null],
  }));
  add("coneCut 2등분", m.m2ExamConeCutFig({ cuts: 2, names: ["㉠", "㉡"] }));
  // 15. m2ExamSolidPairFig
  add("solidPair cyl 닮음(2:3)", m.m2ExamSolidPairFig({
    kind: "cyl", dims1: [2, 3], dims2: [3, 4.5],
    labels1: ["4 cm", "6 cm"], labels2: ["6 cm", "9 cm"],
  }));
  add("solidPair cyl 반례(비 다름)", m.m2ExamSolidPairFig({
    kind: "cyl", dims1: [2, 3], dims2: [4, 5],
    labels1: ["2 cm", "3 cm"], labels2: ["4 cm", "5 cm"],
  }));
  add("solidPair box 닮음(1:2)", m.m2ExamSolidPairFig({
    kind: "box", dims1: [3, 2, 2], dims2: [6, 4, 4],
    labels1: ["3", "2", "2"], labels2: ["6", "4", "4"],
  }));
  add("solidPair sphere(반지름 라벨)", m.m2ExamSolidPairFig({
    kind: "sphere", dims1: [2.2], dims2: [3.3], labels1: ["6 cm"], labels2: ["9 cm"],
  }));
  add("solidPair cone(2:1)", m.m2ExamSolidPairFig({
    kind: "cone", dims1: [3, 4], dims2: [1.5, 2], labels1: ["r 6", "h 8"], labels2: ["3", "4"],
  }));
  // 16. m2ExamFrameFig
  add("frame 액자(안팎 비 판정)", m.m2ExamFrameFig({
    outW: 40, outH: 30, pad: 5,
    labels: { outW: "40 cm", outH: "30 cm", pad: "5 cm" },
  }));
  // 17. m2ExamSectorPairFig
  add("sectorPair 같은 중심각(항상 닮음)", m.m2ExamSectorPairFig({
    deg1: 70, deg2: 70, r1: 3, r2: 4.5,
    labels1: { deg: "70°", r: "6 cm" }, labels2: { deg: "70°", r: "9 cm" },
  }));
  add("sectorPair 다른 중심각(반례)", m.m2ExamSectorPairFig({
    deg1: 55, deg2: 95, r1: 3.4, r2: 3.4,
    labels1: { deg: "55°" }, labels2: { deg: "95°" },
  }));

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;overflow:auto;background:#F6F8FC;z-index:99999;padding:10px";
  host.id = "figHost";
  for (const [t, svgStr] of S) {
    const card = document.createElement("div");
    card.style.cssText = "background:#fff;border:1px solid #E2E8F2;border-radius:12px;margin:0 0 12px;padding:8px";
    card.innerHTML = `<div style="font:700 12px/1.4 sans-serif;color:#475569;margin:2px 0 6px">${t}</div>${svgStr}`;
    host.appendChild(card);
  }
  document.body.appendChild(host);
  return S.length;
});
console.log("rendered:", count);
await page.waitForTimeout(600);

const total = await page.evaluate(() => document.getElementById("figHost").scrollHeight);
const VIEW = 3000;
let shot = 0;
for (let y = 0; y < total; y += VIEW) {
  await page.evaluate((yy) => document.getElementById("figHost").scrollTo(0, yy), y);
  await page.waitForTimeout(180);
  await page.screenshot({ path: `qa/shots/exam-figs-m2u5-sample-${++shot}.png` });
}
console.log(`shots: ${shot} (total height ${total}px)`);
await browser.close();
