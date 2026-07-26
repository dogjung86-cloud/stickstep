// g2u2 시험 그림 눈검수 — v2(2026-07 재출제)부터는 갤러리 카드 전수 캡처가 정본 경로다:
//   node qa/render-g2u2v2-full.mjs && PORT=6002 node qa/shot-g2u2v2-pilot.mjs → qa/shots/g2u2v2/<slot>.png
// (문항 맥락(문두·보기)과 그림을 함께 캡처 — 그림 단독 렌더보다 검수력이 높다.)
// 아래 v1 스크립트는 구 150제 그림 전용으로 보존(v2 풀에는 그대로 쓸 수 없음).
// g2u2 시험 그림 눈검수용 스크린샷 — 신규 examFigures g2u2 섹션 + 재사용 geoFigures를 실제 문항 파라미터로 렌더.
// PORT=<포트> node qa/shot-exam-figs-g2u2.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 3600 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const ex = await import("/src/ui/examFigures.ts");
  const geo = await import("/src/ui/geoFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("geoQuakeBeltFig — 지진 점 띠 지도 (e137)", ex.geoQuakeBeltFig())}
    ${box("geoRockFlowFig 역암·대리암·현무암 (e78 — (가)역암/(나)대리암/(다)현무암)", ex.geoRockFlowFig({ start: "역암 · 대리암 · 현무암", q1: "퇴적물이 다져져 만들어졌는가?", q2: "묽은 염산에 거품이 나는가?" }))}
    ${box("geoDriftRateFig slope3 dot(20,60) (e132 — 20년→60cm)", ex.geoDriftRateFig({ xMax: 40, xStep: 10, yMax: 120, yStep: 30, slope: 3, dots: [[20, 60]] }))}
    ${box("geoDriftRateFig slope2 dot(40,80) (e147 — 80cm→40년)", ex.geoDriftRateFig({ xMax: 50, xStep: 10, yMax: 100, yStep: 20, slope: 2, dots: [[40, 80]] }))}
    ${box("geoCoastFitFig — 해안선 맞물림+화석 띠 (e120)", ex.geoCoastFitFig())}
    ${box("svgTable 광물 특성 표 (e28 — (가)자철석/(나)방해석/(다)적철석)", ex.svgTable(["광물", "묽은 염산", "클립", "조흔색"], [["(가)", "거품 없음", "달라붙음", "검은색"], ["(나)", "거품 발생", "반응 없음", "흰색"], ["(다)", "거품 없음", "반응 없음", "적갈색"]], { firstColHead: true }))}
    ${box("earthLayersFig (e06 (다)외핵·e09)", geo.earthLayersFig())}
    ${box("igneousGridFig (e39 — (다)현무암)", geo.igneousGridFig())}
    ${box("mineralFlowFig (e26 — (가)염산 관문)", geo.mineralFlowFig())}
    ${box("soilLayersFig (e110 — 막내 (나))", geo.soilLayersFig())}
    ${box("geoCycleQuizFig ㉠~㉤ (e86 ㉡ 부서짐·e87 ㉤ 녹음 — 과정명 숨김)", ex.geoCycleQuizFig())}
    ${box("plateSectionFig (e136 — 대륙 쪽 두꺼움)", geo.plateSectionFig())}
    ${box("driftStagesFig (e122 — (나)→(라)→(가)→(다))", geo.driftStagesFig())}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-g2u2-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-g2u2-figs.png");
await browser.close();
