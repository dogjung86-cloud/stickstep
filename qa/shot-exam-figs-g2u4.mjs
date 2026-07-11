// g2u4 시험 그림 눈검수용 스크린샷 — 신규 examFigures g2u4 섹션 + 재사용 atomFigures를 실제 문항 파라미터로 렌더.
// PORT=<포트> node qa/shot-exam-figs-g2u4.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 5200 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const ex = await import("/src/ui/examFigures.ts");
  const af = await import("/src/ui/atomFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("atomMolsFig O₂/H₂O/CO (e06 — 화합물 (나)(다))", ex.atomMolsFig([{ key: "O2", label: "(가)" }, { key: "H2O", label: "(나)" }, { key: "CO", label: "(다)" }]))}
    ${box("atomMolsFig CO vs CO₂ (e32 — ㄱㄷ)", ex.atomMolsFig([{ key: "CO", label: "(가)" }, { key: "CO2", label: "(나)" }]))}
    ${box("atomMolsFig H₂O 단독 (e36 — 화학식 H₂O)", ex.atomMolsFig([{ key: "H2O", label: "(가)" }]))}
    ${box("atomMolsFig O₂ vs O₃ (e113 — ㄴㄷ)", ex.atomMolsFig([{ key: "O2", label: "(가)" }, { key: "O3", label: "(나)" }]))}
    ${box("atomElectrolysisFig (e07·e08 참고 — (가) 기체가 (나)의 2배)", ex.atomElectrolysisFig())}
    ${box("atomStructQuizFig 3p4n3e (e57 — ㉠양성자·㉡중성자·㉢전자)", ex.atomStructQuizFig({ p: 3, n: 4, e: 3 }))}
    ${box("재사용 atomModelFig(7,7) (e54 — +7 중성)", af.atomModelFig(7, 7))}
    ${box("재사용 atomModelFig(2,2) (e65 — +2 중성)", af.atomModelFig(2, 2))}
    ${box("atomPeriodicExamFig 기호판 (e79·e80·e93·e94 — H·He·Li·F·Na·Cl)", ex.atomPeriodicExamFig({ cells: [{ g: 1, period: 1, t: "H" }, { g: 18, period: 1, t: "He" }, { g: 1, period: 2, t: "Li" }, { g: 17, period: 2, t: "F" }, { g: 1, period: 3, t: "Na" }, { g: 17, period: 3, t: "Cl" }] }))}
    ${box("atomPeriodicExamFig 위치판 A~E (e82·e83 — B·D 17족, C·E 18족)", ex.atomPeriodicExamFig({ cells: [{ g: 1, period: 2, t: "A", tone: "amber" }, { g: 17, period: 2, t: "B", tone: "amber" }, { g: 18, period: 2, t: "C", tone: "amber" }, { g: 17, period: 3, t: "D", tone: "amber" }, { g: 18, period: 3, t: "E", tone: "amber" }] }))}
    ${box("atomCellQuizFig (e86·e87 — ㉠번호·㉡기호·㉢이름)", ex.atomCellQuizFig())}
    ${box("재사용 fourModelFig (e104 — 분자 = 산소·물)", af.fourModelFig())}
    ${box("atomIonFormExamFig p8→10 (e109 — 전자 2개 얻음)", ex.atomIonFormExamFig({ p: 8, after: 10 }))}
    ${box("atomIonFormExamFig p3→2 (e110 — 전자 1개 잃음)", ex.atomIonFormExamFig({ p: 3, after: 2 }))}
    ${box("atomIonMoveExamFig 보라 →(+)극 (e128 — 음이온)", ex.atomIonMoveExamFig({ hex: "#8E44AD", dir: "right", leftSign: "−" }))}
    ${box("atomIonMoveExamFig 주황 →(−)극 (e129 — 양이온)", ex.atomIonMoveExamFig({ hex: "#E8752E", dir: "right", leftSign: "+" }))}
    ${box("재사용(데뷔) ionMoveFig (e138 — 좌(+) 우(−) 초기 상태)", af.ionMoveFig())}
    ${box("atomCondFig 3컵 (e133 — 소금물만 켜짐)", ex.atomCondFig({ cups: [{ label: "증류수", on: false }, { label: "설탕물", on: false }, { label: "염화 나트륨 수용액", on: true }] }))}
    ${box("atomPieFig 전부 표시 (e136·e145 — Na40·Cl30·K20·기타10)", ex.atomPieFig({ slices: [{ label: "나트륨 이온", pct: 40, hex: "#5AA2F8" }, { label: "염화 이온", pct: 30, hex: "#6CC080" }, { label: "칼륨 이온", pct: 20, hex: "#F0A422" }, { label: "기타", pct: 10, hex: "#C4CAD2" }] }))}
    ${box("atomPieFig ㉠ 숨김 (e144 — ㉠=10%)", ex.atomPieFig({ slices: [{ label: "나트륨 이온", pct: 40, hex: "#5AA2F8" }, { label: "염화 이온", pct: 30, hex: "#6CC080" }, { label: "칼륨 이온", pct: 20, hex: "#F0A422" }, { label: "기타", pct: 10, hex: "#C4CAD2", hide: true }] }))}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-g2u4-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-g2u4-figs.png");
await browser.close();
