// u6 시험 그림 눈검수용 스크린샷 — 신규 examFigures u6 섹션 전부를 한 페이지에 렌더.
// PORT=<포트> node qa/shot-exam-figs-u6.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 2600 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const m = await import("/src/ui/examFigures.ts");
  const g = await import("/src/ui/gasFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("gasPvGraphFig k=60 (dots 1·2·4 → 60·30·15)", m.gasPvGraphFig({ k: 60, pMax: 5, vMax: 60, vStep: 15, dots: [1, 2, 4] }))}
    ${box("gasPvGraphFig k=40 (dots 1·2·4 → 40·20·10)", m.gasPvGraphFig({ k: 40, pMax: 5, vMax: 40, vStep: 10, dots: [1, 2, 4] }))}
    ${box("gasTvGraphFig 55+0.2 marks 가·나·다(10·40·70℃)", m.gasTvGraphFig({ v0: 55, slope: 0.2, tMax: 80, tStep: 25, vMin: 50, vMax: 75, vStep: 5, marks: [{ t: 10, label: "(가)" }, { t: 40, label: "(나)" }, { t: 70, label: "(다)" }] }))}
    ${box("gasTvGraphFig dots [50] → 65 눈금 위", m.gasTvGraphFig({ v0: 55, slope: 0.2, tMax: 80, tStep: 25, vMin: 50, vMax: 75, vStep: 5, dots: [50] }))}
    ${box("gasTvChoicesFig — ②가 정답(절편 직선), ①은 원점 함정", m.gasTvChoicesFig())}
    ${box("gasParticleTrioFig — (나) 절반 부피, (다) 긴 화살표", m.gasParticleTrioFig())}
    ${box("gasPistonDuoFig wa1 wb3 va.85 vb.32", m.gasPistonDuoFig({ wa: 1, wb: 3, va: 0.85, vb: 0.32 }))}
    ${box("gasBottleSpongeFig 기본(눌림 없음 — u6e04용, 정답 비노출)", m.gasBottleSpongeFig())}
    ${box("gasBottleSpongeFig dents(u6e05용 — 눌림 전제 문항)", m.gasBottleSpongeFig({ dents: true }))}
    ${box("gasSyringeDuoFig — (가) 당김 (나) 누름, 입자 6개씩", m.gasSyringeDuoFig())}
    ${box("svgTable 보일 48·24·㉠·12", m.svgTable(["압력(기압)", "1", "2", "3", "4"], [["부피(mL)", "48", "24", "㉠", "12"]], { firstColHead: true }))}
    ${box("svgTable 샤를 55·59·63·67", m.svgTable(["온도(℃)", "0", "20", "40", "60"], [["부피(mL)", "55", "59", "63", "67"]], { firstColHead: true }))}
    ${box("(재사용) balloonParticleFig", g.balloonParticleFig())}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-u6-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-u6-figs.png");
await browser.close();
