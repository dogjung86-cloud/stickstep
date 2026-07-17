// m2u4 시험 그림 헬퍼 13종 "저작 전" 샘플 렌더 눈검수(브리프 시그니처 고정용).
// 풀 파일이 아직 없으므로 인라인 샘플 파라미터로 전 헬퍼를 렌더한다. m2u3 샷 문법 계승.
// PORT=<포트> node qa/shot-exam-figs-m2u4-sample.mjs (dev 서버 필수)
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
  // 1. m2ExamIsoFig
  add("iso 기본(꼭지각 34 · 밑각 x)", m.m2ExamIsoFig({ apexDeg: 34, apex: "34°", baseR: "x°" }));
  add("iso 외각(꼭지각 x · 외각 122)", m.m2ExamIsoFig({ apexDeg: 64, apex: "x°", ext: "122°" }));
  add("iso 수선의 발(틱·직각·변 라벨)", m.m2ExamIsoFig({ apexDeg: 48, foot: true, tickBase: true, base: "18 cm", sideL: "13 cm" }));
  // 2. m2ExamIsoChainFig
  add("isoChain(th 76 → ∠D=38)", m.m2ExamIsoChainFig({ th: 76, thLabel: "76°", ask: "x°", askAt: "D" }));
  // 3. m2ExamExtIsoFig
  add("extIso(∠B 74 · ∠D 32 · ∠CAD x)", m.m2ExamExtIsoFig({ th: 74, phi: 32, labelB: "74°", labelD: "32°", labelCAD: "x°" }));
  // 4. m2ExamRhPairsFig
  add("rhPairs 4장", m.m2ExamRhPairsFig([
    { acute: 36, name: "(가)", hyp: "11", ang: "36°" },
    { acute: 54, name: "(나)", hyp: "11", vleg: "6", flip: true },
    { acute: 36, name: "(다)", hyp: "11", ang: "54°", angAt: "A" },
    { acute: 36, name: "(라)", leg: "6", ang: "36°" },
  ]));
  // 5. m2ExamTriCevFig
  add("triCev 이등분선(∠B 직각)", m.m2ExamTriCevFig({ B: 90, C: 28, cev: "bisect", rightAt: "B", sides: { BC: "21 cm" }, marks: [{ at: "ADC", label: "x°" }] }));
  add("triCev 수직이등분(이등변)", m.m2ExamTriCevFig({ B: 54, C: 54, cev: "perp", tickAB_AC: true, tickBD_DC: true, marks: [{ at: "BAD", label: "x°" }] }));
  // 6. m2ExamCenterFig
  add("center O(각 3라벨+틱)", m.m2ExamCenterFig({ kind: "O", B: 46, C: 62, segs: ["A", "B", "C"], tickR: true, marks: [{ at: "OBA", label: "22°" }, { at: "OCA", label: "38°" }, { at: "BAC", label: "x°" }] }));
  add("center O 수직이등분 발 D·E·F", m.m2ExamCenterFig({ kind: "O", B: 52, C: 58, feet: true, tickFeet: true, segs: ["A", "B", "C"] }));
  add("center I(반각 2+BIC x)", m.m2ExamCenterFig({ kind: "I", B: 58, C: 46, segs: ["A", "B", "C"], marks: [{ at: "IBC", label: "29°" }, { at: "ICB", label: "23°" }, { at: "BIC", label: "x°" }] }));
  add("center I 내접원+r+세 변", m.m2ExamCenterFig({ kind: "I", B: 50, C: 42, circle: true, rLabel: "r cm", sideLabels: { AB: "13 cm", BC: "20 cm", CA: "15 cm" } }));
  // 7. m2ExamCircumRightFig
  add("circumRight(빗변 26·외접원)", m.m2ExamCircumRightFig({ hyp: "26 cm", circle: true }));
  // 8. m2ExamParaFig
  add("para 기본(각·변·대변 틱)", m.m2ExamParaFig({ angleB: 57, angles: { B: "57°", C: "x°" }, sides: { AB: "8 cm", BC: "13 cm" }, ticksOpp: true }));
  add("para 대각선 O(조각 라벨)", m.m2ExamParaFig({ diag: "both", ticksDiag: true, oLabels: { OA: "7 cm", OB: "5 cm" } }));
  // 9. m2ExamParaBisectFig
  add("paraBisect A→E(BC 위)", m.m2ExamParaBisectFig({ mode: "A", labels: [{ on: "AD", label: "14 cm" }, { on: "AB", label: "9 cm" }] }));
  add("paraBisect AD 동시(E·F)", m.m2ExamParaBisectFig({ mode: "AD", ratio: 1.8, labels: [{ on: "AD", label: "16 cm" }] }));
  add("paraBisect B→CD 연장 E", m.m2ExamParaBisectFig({ mode: "Bext", labels: [{ on: "AB", label: "6 cm" }, { on: "BC", label: "10 cm" }] }));
  // 10. m2ExamQuadDiagFig
  add("quadDiag rect(틱+각 x)", m.m2ExamQuadDiagFig({ kind: "rect", tickDiag: "all", oSegs: { OA: "6 cm" }, marks: [{ at: "OAD", label: "34°" }, { at: "ODA", label: "x°" }] }));
  add("quadDiag rhom(변 틱+각)", m.m2ExamQuadDiagFig({ kind: "rhom", tickSides: true, marks: [{ at: "OBC", label: "27°" }, { at: "BCO", label: "x°" }] }));
  add("quadDiag sq+대각선 위 P", m.m2ExamQuadDiagFig({ kind: "sq", diag: "AC", pt: { on: "AC", t: 0.66, name: "P", segTo: ["D"] }, marks: [{ at: "DAP", label: "45°" }, { at: "ADP", label: "x°" }] }));
  // 11. m2ExamFamilyFig
  add("family(㉠㉡ 가림)", m.m2ExamFamilyFig({ hide: ["p2r", "m2s"] }));
  add("family diag판(노드 ㉮)", m.m2ExamFamilyFig({ variant: "diag", hideNode: ["rhom"] }));
  // 12. m2ExamQuadRowFig
  add("quadRow 5종+대각선", m.m2ExamQuadRowFig({ kinds: ["trap", "para", "rect", "rhom", "sq"], diag: true }));
  // 13. m2ExamEqAreaFig
  add("eqArea twin(음영 DBC·넓이 라벨)", m.m2ExamEqAreaFig({ mode: "twin", shade: "DBC", areaLabel: { in: "ABC", label: "26 cm²" } }));
  add("eqArea trap(음영 DOC)", m.m2ExamEqAreaFig({ mode: "trap", shade: "DOC" }));
  add("eqArea para(대각선 절반)", m.m2ExamEqAreaFig({ mode: "para", diag: "AC", shade: "ABC" }));
  add("eqArea bent(경계 펴기 D→E)", m.m2ExamEqAreaFig({ mode: "bent" }));

  const box = ([t, svg]) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${t}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">${S.map(box).join("")}</div>`;
  return S.length;
});
await page.waitForTimeout(400);
const total = await page.evaluate(() => document.body.scrollHeight);
const slices = Math.ceil(total / 2400);
await page.setViewportSize({ width: 420, height: 2400 });
for (let i = 0; i < slices; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * 2400);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `qa/shots/exam-m2u4-samples-${i + 1}.png` });
}
console.log(`SAVED qa/shots/exam-m2u4-samples-{1..${slices}}.png — 샘플 ${count}개, 총 높이 ${total}`);
await browser.close();
