// g2u8 시험 그림 눈검수용 스크린샷 — 신규 examFigures g2u8 섹션을 실제 문항 파라미터로 렌더.
// 다크 그림(figureDark)은 시험 화면과 같은 짙은 패널 위에서 검수한다.
// PORT=<포트> node qa/shot-exam-figs-g2u8.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 4600 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const ex = await import("/src/ui/examFigures.ts");
  const dark = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#0B1524;border:1px solid #223">
      <div style="font:700 12px sans-serif;color:#9FB6CE;margin-bottom:6px">${title}</div>${svg}</div>`;
  const light = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${dark("starParallax3Fig 기본 0.4/0.2/0.1 (e04·e05 — (가) 가장 가까움·(다)=4배)", ex.starParallax3Fig())}
    ${dark("starShiftPairFig 1.0→0.4 (e11·e12 — 이동 0.6″, 연주 시차 0.3″)", ex.starShiftPairFig({ g1: "1.0″", g2: "0.4″" }))}
    ${dark("starBrightGridFig (e21 — 1·4·9칸, 3배 지점 1/9)", ex.starBrightGridFig())}
    ${dark("starMagScatterFig A청1·B황3·C주황5·D백2 (e72 — 정답 C)", ex.starMagScatterFig({ pts: [
      { label: "A", col: 0, mag: 1 }, { label: "B", col: 4, mag: 3 }, { label: "C", col: 5, mag: 5 }, { label: "D", col: 2, mag: 2 },
    ] }))}
    ${dark("colorTempTrioFig ㉠적·㉡백·㉢청 (e59 — 높은 순 ㉢㉡㉠, 정답 ④)", ex.colorTempTrioFig({ stars: [
      { label: "㉠", name: "적색", hex: "#FF9A66" }, { label: "㉡", name: "백색", hex: "#F0F4FA" }, { label: "㉢", name: "청색", hex: "#9CC4FF" },
    ] }))}
    ${dark("starGalaxyQuizFig (e78 태양계=㉡ · e79 ㉠=중심부)", ex.starGalaxyQuizFig())}
    ${dark("starClusterMapFig (e98 — ㉯=구상 성단 분포)", ex.starClusterMapFig())}
    ${dark("starExpandArrowFig (e119 — C 화살표가 B보다 길다)", ex.starExpandArrowFig())}
    ${light("svgTable 연주 시차 4별 (e13 — 최솟값 (라)=가장 멂)", ex.svgTable(["별", "연주 시차"], [["(가)", "0.8″"], ["(나)", "0.08″"], ["(다)", "0.4″"], ["(라)", "0.02″"]]))}
    ${light("svgTable 등급 표A (e46 — 맨눈 최밝 (나) −0.5)", ex.svgTable(["별", "겉보기 등급", "절대 등급"], [["(가)", "2.0", "0.0"], ["(나)", "−0.5", "1.5"], ["(다)", "3.0", "−1.0"]]))}
    ${light("svgTable 등급 표B (e47 — 실제 최밝 (다) −4.5)", ex.svgTable(["별", "겉보기 등급", "절대 등급"], [["(가)", "1.5", "3.5"], ["(나)", "0.0", "0.0"], ["(다)", "2.5", "−4.5"]]))}
    ${light("svgTable 등급 표C (e53 — 10pc보다 가까움 = (다)(라))", ex.svgTable(["별", "겉보기 등급", "절대 등급"], [["(가)", "3.0", "1.0"], ["(나)", "0.0", "0.0"], ["(다)", "1.0", "4.0"], ["(라)", "0.0", "2.0"]]))}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-g2u8-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-g2u8-figs.png");
await browser.close();
