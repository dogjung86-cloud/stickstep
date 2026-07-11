// g2u3 시험 그림 눈검수용 스크린샷 — 신규 examFigures g2u3 섹션 + 재사용 lightFigures를 실제 문항 파라미터로 렌더.
// PORT=<포트> node qa/shot-exam-figs-g2u3.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 4400 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const ex = await import("/src/ui/examFigures.ts");
  const lf = await import("/src/ui/lightFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("lightAngleExamFig mirror 25° (e03 — 입사각 65°)", ex.lightAngleExamFig({ mark: "mirror", deg: 25 }))}
    ${box("lightAngleExamFig normal 40° (e04 — 사이 각 80°)", ex.lightAngleExamFig({ mark: "normal", deg: 40 }))}
    ${box("lightAngleExamFig mirror 28° (e17 — 입사각 62°)", ex.lightAngleExamFig({ mark: "mirror", deg: 28 }))}
    ${box("lightProtractorFig 40° (e16 — 반사각 눈금 40)", ex.lightProtractorFig({ inc: 40 }))}
    ${box("lightRefractUpFig (e21 — 물→공기 정답 ③)", ex.lightRefractUpFig())}
    ${box("lightSeePathFig (e41 — ㉠ 광원→물체 · ㉡ 물체→눈)", ex.lightSeePathFig())}
    ${box("lightMirrorGridFig (e58 — 물체 3칸 → 정답 ③)", ex.lightMirrorGridFig())}
    ${box("lightPixelExamFig G+B (e97 — 청록)", ex.lightPixelExamFig({ on: [false, true, true] }))}
    ${box("lightBalloonFig 검/초/파 (e98 — 햇빛 아래 청록)", ex.lightBalloonFig({ seen: [{ fill: "#20262E", name: "검은색" }, { fill: "#18A34A", name: "초록색" }, { fill: "#2E5BE0", name: "파란색" }] }))}
    ${box("lightWaveGraphFig 거리축 λ4 amp30 (e124 — 파장 4m, 마루 1·5)", ex.lightWaveGraphFig({ xMax: 8, xStep: 1, yMax: 30, yStep: 15, amp: 30, wavelength: 4, xLabel: "거리(m)", yLabel: "변위(cm)" }))}
    ${box("lightWaveGraphFig 거리축 amp15 (e125 — 진폭 15cm)", ex.lightWaveGraphFig({ xMax: 8, xStep: 2, yMax: 15, yStep: 5, amp: 15, wavelength: 4, xLabel: "거리(m)", yLabel: "변위(cm)" }))}
    ${box("lightWaveGraphFig 시간축 T0.4 (e127 — 주기 0.4초, 마루 0.1·0.5)", ex.lightWaveGraphFig({ xMax: 0.8, xStep: 0.1, yMax: 10, yStep: 5, amp: 10, wavelength: 0.4, xLabel: "시간(초)", yLabel: "변위(cm)" }))}
    ${box("lightWave4Fig (e134 — (가)기준·정답 (다))", ex.lightWave4Fig({ cells: [{ label: "(가)", amp: 19, cyc: 3 }, { label: "(나)", amp: 30, cyc: 3 }, { label: "(다)", amp: 19, cyc: 6 }, { label: "(라)", amp: 10, cyc: 1.5 }] }))}
    ${box("lightWave4Fig (e135 — 가장 작은 (다)·가장 낮은 (라))", ex.lightWave4Fig({ cells: [{ label: "(가)", amp: 12, cyc: 4 }, { label: "(나)", amp: 26, cyc: 2 }, { label: "(다)", amp: 8, cyc: 5 }, { label: "(라)", amp: 18, cyc: 1.5 }] }))}
    ${box("lightPipesFig marks[2,5,0] (e137 — 가장 높은 ㉡=최단관)", ex.lightPipesFig({ marks: [2, 5, 0] }))}
    ${box("재사용 coinCupFig (e27)", lf.coinCupFig())}
    ${box("재사용 twoMirrorsFig (e77 — (가)볼록/(나)오목)", lf.twoMirrorsFig())}
    ${box("재사용 twoLensFig (e78 — (가)볼록 확대/(나)오목 축소)", lf.twoLensFig())}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-g2u3-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-g2u3-figs.png");
await browser.close();
