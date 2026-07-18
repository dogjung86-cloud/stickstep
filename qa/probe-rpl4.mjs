// probe-rpl4.mjs — regionPlaceLab 아프리카판(**세로 인라인 모드**) 실입력 프로브.
// probe-rpl3(가로)의 세로판 — rotateStage 없이 인라인 svg의 실좌표로 page.mouse를 태워
// 히트테스트·window 리스너 경로를 검증한다. PORT=<포트> node qa/probe-rpl4.mjs
// 검증: 특징 안경 실클릭 · 실드래그 배치 · 실드래그 오답 토스트 · 탭-탭 배치 · 5/5 완주 · 목표 3/3.
// 주의: 실 마우스는 화면 밖 좌표를 못 누른다 — 드래그 전 스테이지를 scrollIntoView하고 rect를 새로 잰다.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const AF_CROP = { x: 444, y: 144, w: 209, h: 206 };
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

// freeNav 해금은 localStorage 시드로(모듈 인스턴스 갈라짐 함정 회피 — eval completeLesson은
// dev 서버가 HMR을 거친 뒤엔 앱 그래프의 store와 다른 인스턴스를 만질 수 있다, 플레이북 §7).
await page.addInitScript(() =>
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
      onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10,
      lessons: { s1u4l1: { done: true, acc: 1, bestXp: 0 } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u4l1").lesson, () => {}));
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
  }, { LON: lon, LAT: lat, crop: AF_CROP });
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

// ② 실드래그 배치 — 북부 이름표를 사하라(10E, 24N)로
let from = await rectOf('.screen.active .rpl-token[data-r="north"]');
let to = await mapPt(10, 24);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.waitForTimeout(120);
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.waitForTimeout(120);
await page.mouse.up();
await page.waitForTimeout(450);
console.log("drag north →", await state());

// ③ 실드래그 오답 — 서부 이름표를 보츠와나(23E, 22S — 남부 폴리곤)로
from = await rectOf('.screen.active .rpl-token[data-r="west"]');
to = await mapPt(23, -22);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(450);
console.log("wrong drop →", await state());

// ④ 탭-탭 배치 — 서부 이름표 탭 → 말리(2W, 13N) 탭
from = await rectOf('.screen.active .rpl-token[data-r="west"]');
await page.mouse.click(from.x, from.y);
await page.waitForTimeout(300);
to = await mapPt(-2, 13);
await page.mouse.click(to.x, to.y);
await page.waitForTimeout(450);
console.log("tap-tap west →", await state());

// ⑤ 나머지 실드래그 — 중앙·동부·남부
for (const [id, lon, lat] of [["central", 21, 1], ["east", 38, 6], ["south", 23, -22]]) {
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
console.log(fin.marks === 5 && fin.chips === 3 ? "PROBE RPL4: ALL OK" : "PROBE RPL4: FAIL");
await browser.close();
process.exit(fin.marks === 5 && fin.chips === 3 ? 0 : 1);
