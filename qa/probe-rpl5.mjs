// probe-rpl5.mjs — regionPlaceLab 아메리카판(**세로 인라인 모드**) 실입력 프로브.
// probe-rpl4(아프리카 세로)의 Ⅴ판 — 인라인 svg의 실좌표로 page.mouse를 태워
// 히트테스트·window 리스너 경로를 검증한다. PORT=<포트> node qa/probe-rpl5.mjs
// 검증: 특징 안경 실클릭 · 실드래그 배치 · 실드래그 오답 토스트 · 탭-탭 배치 · 3/3 완주 · 목표 3/3.
// 주의: 실 마우스는 화면 밖 좌표를 못 누른다 — 드래그 전 스테이지를 scrollIntoView하고 rect를 새로 잰다.
// freeNav 시딩은 localStorage lessons에 done 직접(eval completeLesson은 HMR 뒤 모듈이 갈라져 금지).
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const AM_CROP = { x: 28, y: 47, w: 392, h: 361 };
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() =>
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
      onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10,
      lessons: { s1u5l1: { done: true, acc: 1, bestXp: 0 } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u5l1").lesson, () => {}));
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

// lon/lat → 화면 좌표(세로 인라인 — svg rect 직산)
const mapPt = (lon, lat) =>
  page.evaluate(({ LON, LAT, crop }) => {
    const r = document.querySelector(".screen.active .rpl-svg").getBoundingClientRect();
    const sx = ((LON + 180) / 360) * 1000;
    const sy = ((90 - LAT) / 180) * 500;
    return { x: r.left + ((sx - crop.x) / crop.w) * r.width, y: r.top + ((sy - crop.y) / crop.h) * r.height };
  }, { LON: lon, LAT: lat, crop: AM_CROP });
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

// ② 실드래그 배치 — 앵글로 이름표를 미국 평원(100W, 45N)으로
let from = await rectOf('.screen.active .rpl-token[data-r="anglo"]');
let to = await mapPt(-100, 45);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.waitForTimeout(120);
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.waitForTimeout(120);
await page.mouse.up();
await page.waitForTimeout(450);
console.log("drag anglo →", await state());

// ③ 실드래그 오답 — 중앙 이름표를 브라질 내륙(56W, 11S — 남미 폴리곤)으로
from = await rectOf('.screen.active .rpl-token[data-r="central"]');
to = await mapPt(-56, -11);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(450);
console.log("wrong drop →", await state());

// ④ 탭-탭 배치 — 중앙 이름표 탭 → 멕시코 북부(102W, 24N) 탭
from = await rectOf('.screen.active .rpl-token[data-r="central"]');
await page.mouse.click(from.x, from.y);
await page.waitForTimeout(300);
to = await mapPt(-102, 24);
await page.mouse.click(to.x, to.y);
await page.waitForTimeout(450);
console.log("tap-tap central →", await state());

// ⑤ 남미 실드래그 — 브라질 내륙으로
from = await rectOf('.screen.active .rpl-token[data-r="south"]');
to = await mapPt(-56, -11);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(420);
const fin = await state();
console.log("final →", fin);
console.log(fin.marks === 3 && fin.chips === 3 ? "PROBE RPL5: ALL OK" : "PROBE RPL5: FAIL");
await browser.close();
process.exit(fin.marks === 3 && fin.chips === 3 ? 0 : 1);
