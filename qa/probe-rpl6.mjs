// probe-rpl6.mjs — regionPlaceLab 오세아니아판(**세로 인라인 모드**) 실입력 프로브.
// probe-rpl5(아메리카 세로)의 Ⅵ판 — 인라인 svg의 실좌표로 page.mouse를 태워
// 히트테스트·window 리스너 경로를 검증한다. PORT=<포트> node qa/probe-rpl6.mjs
// 검증: 특징 안경 실클릭 · 실드래그 배치(호주) · 타 지역 바다 실드래그 = 코미디(대양 판정 순서) ·
// 탭-탭 배치(뉴질랜드) · **날짜변경선 건너 언랩 좌표 실드래그(폴리네시아 lon 186)** · 5/5 완주.
// freeNav 시딩은 localStorage lessons에 done 직접(eval completeLesson은 HMR 뒤 모듈이 갈라져 금지).
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const OC_CROP = { x: 805, y: 200, w: 229, h: 184 };
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() =>
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
      onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10,
      lessons: { s1u6l1: { done: true, acc: 1, bestXp: 0 } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u6l1").lesson, () => {}));
});
await page.waitForTimeout(1100);
// 훅 → concept → 랩(3번째 스텝)까지 앞으로
for (let i = 0; i < 2; i += 1) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await page.waitForTimeout(700);
}
await page.waitForSelector(".screen.active .rpl-svg", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .rpl-stage")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(500);

const rectOf = (sel) =>
  page.evaluate((s) => {
    const el2 = document.querySelector(s);
    if (!el2) return null;
    const r = el2.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }, sel);

// lon/lat → 화면 좌표(세로 인라인 — svg rect 직산, 언랩 경도 그대로)
const mapPt = (lon, lat) =>
  page.evaluate(({ LON, LAT, crop }) => {
    const r = document.querySelector(".screen.active .rpl-svg").getBoundingClientRect();
    const sx = ((LON + 180) / 360) * 1000;
    const sy = ((90 - LAT) / 180) * 500;
    return { x: r.left + ((sx - crop.x) / crop.w) * r.width, y: r.top + ((sy - crop.y) / crop.h) * r.height };
  }, { LON: lon, LAT: lat, crop: OC_CROP });
const state = () =>
  page.evaluate(() => ({
    marks: document.querySelectorAll(".screen.active .rpl-mark").length,
    chips: document.querySelectorAll(".screen.active .pn-badge.on").length,
    toast: document.querySelector(".screen.active .rpl-toast")?.textContent?.slice(0, 30) ?? "",
    done: document.querySelectorAll(".screen.active .rpl-token.done").length,
  }));

// ① 특징 안경(실클릭)
const lensR = await rectOf(".screen.active .rpl-lens");
await page.mouse.click(lensR.x, lensR.y);
await page.waitForTimeout(350);
console.log("lens on:", await page.evaluate(() => document.querySelector(".screen.active .rpl-lens")?.classList.contains("on")));

// ② 실드래그 배치 — 오스트레일리아 이름표를 내륙(134E, 25S)으로
let from = await rectOf('.screen.active .rpl-token[data-r="australia"]');
let to = await mapPt(134, -25);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.waitForTimeout(120);
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.waitForTimeout(120);
await page.mouse.up();
await page.waitForTimeout(450);
console.log("drag australia →", await state());

// ③ 실드래그 오답 — 폴리네시아 이름표를 미크로네시아 한가운데 바다(153E, 6N)로
//    (대양 판정 순서: 풍덩이 아니라 "여긴 미크로네시아" 코미디가 떠야 한다)
from = await rectOf('.screen.active .rpl-token[data-r="polynesia"]');
to = await mapPt(153, 6);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(450);
const wrongState = await state();
console.log("wrong drop(타 지역 바다) →", wrongState);
if (!wrongState.toast.includes("미크로네시아")) {
  console.log("PROBE RPL6: FAIL (코미디 토스트가 아님)");
  await browser.close();
  process.exit(1);
}

// ④ 탭-탭 배치 — 뉴질랜드 이름표 탭 → 남섬(171E, 43S) 탭
from = await rectOf('.screen.active .rpl-token[data-r="newzealand"]');
await page.mouse.click(from.x, from.y);
await page.waitForTimeout(300);
to = await mapPt(171, -43);
await page.mouse.click(to.x, to.y);
await page.waitForTimeout(450);
console.log("tap-tap newzealand →", await state());

// ⑤ 나머지 실드래그 — 멜라네시아(뉴기니 145E,6S) · 미크로네시아(153E,6N) ·
//    폴리네시아(**언랩 186E = 서경 174** — 날짜변경선 건너 실좌표)
for (const [id, lon, lat] of [["melanesia", 145, -6], ["micronesia", 153, 6], ["polynesia", 186, -12]]) {
  from = await rectOf(`.screen.active .rpl-token[data-r="${id}"]`);
  to = await mapPt(lon, lat);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(420);
}
const fin = await state();
console.log("final →", fin);
console.log(fin.marks === 5 && fin.chips === 3 ? "PROBE RPL6: ALL OK" : "PROBE RPL6: FAIL");
await browser.close();
process.exit(fin.marks === 5 && fin.chips === 3 ? 0 : 1);
