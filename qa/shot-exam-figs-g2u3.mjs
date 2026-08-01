// g2u3 v2 시험 그림 눈검수용 스크린샷 — examFigures "g2u3 v2" 섹션(파일럿 승격분)을 실제 문항
// 파라미터로 렌더. 이식(build-g2u3v2-lessons.mjs) 후에만 동작한다. 전수 눈검수는 스테이징 갤러리
// (shot-g2u3v2-full.mjs 180카드)가 정본 — 이 샷은 승격 후 회귀 가드.
// PORT=<포트> node qa/shot-exam-figs-g2u3.mjs (dev 서버 필수 — vite 모듈 URL로 임포트)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 6400 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

await page.evaluate(async () => {
  const ex = await import("/src/ui/examFigures.ts");
  const lf = await import("/src/ui/lightFigures.ts");
  const box = (title, svg) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${title}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">
    ${box("xLAE mirror 26° (e201 — 반사각 64°)", ex.xLAE({ mark: "mirror", deg: 26 }))}
    ${box("xLSR 난반사 (e207 — 법선 제각각)", ex.xLSR())}
    ${box("xLRP down (e221 — 정답 ③ 공간 정렬)", ex.xLRP("down"))}
    ${box("xLRP up (e224 — 정답 ② 공간 정렬)", ex.xLRP("up"))}
    ${box("xLRP vert (e223 — 수직 입사 직진 ④)", ex.xLRP("vert"))}
    ${box("xLSEE torch (e240 — 손전등→시계→눈)", ex.xLSEE("torch"))}
    ${box("xLSEE moon (e245 — 태양→달→눈)", ex.xLSEE("moon"))}
    ${box("xLSEE water (e248 — ㉡반사 ㉢굴절)", ex.xLSEE("water"))}
    ${box("xLMR dist 11cm (e260 — 물체~상 22cm)", ex.xLMR({ mode: "dist", d1: 11 }))}
    ${box("xLMR eye2 (e270 — 상 위치 불변)", ex.xLMR({ mode: "eye2" }))}
    ${box("xLMG cells5 (e259 — 물체~상 10칸)", ex.xLMG({ cells: 5, withImage: true }))}
    ${box("xLXS B배치 (e274 — 가까이 크게 = (가)(라))", ex.xLXS(["cvl", "cvm", "ccl", "ccm"]))}
    ${box("xLOB cvl (e286 — 가까이 크게·멀면 거꾸로)", ex.xLOB("cvl"))}
    ${box("xLSW freq (e329 — 빠르게 = 촘촘)", ex.xLSW("freq"))}
    ${box("xLFC 순서도 (e349 — 가로 화살촉·아니요 우측)", ex.xLFC())}
    ${box("xLCU 물컵 3개 (e346 — 물 많을수록 낮은 음)", ex.xLCU())}
    ${box("xLWG marks ㉠~㉤ (e323 — 마루 ㉡·골 ㉣)", ex.xLWG({ xMax: 8, xStep: 2, yMax: 20, yStep: 10, amp: 15, wavelength: 8, xLabel: "거리(m)", yLabel: "높이(cm)", phase: "sin", marks: [{ x: 0, y: 0, t: "㉠" }, { x: 2, y: 15, t: "㉡" }, { x: 4, y: 0, t: "㉢" }, { x: 6, y: -15, t: "㉣" }, { x: 8, y: 0, t: "㉤" }] }))}
    ${box("xLWG dim a (e331 — a = 진폭 2배)", ex.xLWG({ xMax: 8, xStep: 2, yMax: 20, yStep: 10, amp: 10, wavelength: 4, xLabel: "거리(m)", yLabel: "높이(cm)", phase: "sin", dim: "a" }))}
    ${box("xLWG 시간축 (e326 — 주기 2초)", ex.xLWG({ xMax: 4, xStep: 1, yMax: 20, yStep: 10, amp: 10, wavelength: 2, xLabel: "시간(초)", yLabel: "높이(cm)", phase: "cos" }))}
    ${box("xLW4 세팅 B (e343 — 정답 (다))", ex.xLW4({ cells: [{ label: "(가)", amp: 20, cyc: 3 }, { label: "(나)", amp: 28, cyc: 3 }, { label: "(다)", amp: 20, cyc: 6 }, { label: "(라)", amp: 12, cyc: 5 }] }))}
    ${box("xLW4 pair (e351 — 진동수 4배)", ex.xLW4({ pair: true, cells: [{ label: "(가)", amp: 22, cyc: 2 }, { label: "(나)", amp: 22, cyc: 8 }] }))}
    ${box("재사용 lightPipesFig marks[3,0,5] (e345 — 가장 낮은 ㉡=최장관)", ex.lightPipesFig({ marks: [3, 0, 5] }))}
    ${box("재사용 lightBalloonFig 빨/초/검 (e310 — 햇빛 노랑)", ex.lightBalloonFig({ seen: [{ fill: "#E5322E", name: "빨간색" }, { fill: "#12A84E", name: "초록색" }, { fill: "#23282F", name: "검은색" }] }))}
    ${box("재작도 twoMirrorsFig (e273 — (가)볼록 벨리 좌/(나)오목 벨리 우)", lf.twoMirrorsFig())}
    ${box("재사용 twoLensFig (e276)", lf.twoLensFig())}
  </div>`;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/exam-g2u3-figs.png", fullPage: true });
console.log("SAVED qa/shots/exam-g2u3-figs.png");
await browser.close();
