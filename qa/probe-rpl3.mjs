// probe-rpl3.mjs — regionPlaceLab 유럽판(사회 Ⅲ) 실입력 프로브. probe-rpl.mjs의 유럽 크롭판.
// 합성 dispatchEvent는 히트테스트·오버레이 가림을 우회하므로, 실기기 "클릭이 안 된다"류
// 리포트는 이 프로브(Playwright 실 마우스)로 재현한다. PORT=<포트> node qa/probe-rpl3.mjs
// 검증: 드래그 배치(마우스 down→move→up) · 탭-탭 배치 · 특징 안경 · 오답 토스트.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.addInitScript(() =>
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10 }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("s1u3l1")) st.completeLesson("s1u3l1", 1, 0); // freeNav 해금
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u3l1").lesson, () => {}));
});
await page.waitForTimeout(900);
// 훅 → concept → 랩(3번째 스텝)까지 앞으로
for (let i = 0; i < 2; i += 1) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await page.waitForTimeout(520);
}
await page.waitForSelector(".screen.active .rpl-token", { timeout: 9000 });

// 지도 논리 좌표(lon/lat) → 화면 좌표 — 유럽 크롭(continentMap EUROPE)
const mapPt = (lon, lat) =>
  page.evaluate(({ LON, LAT }) => {
    const svg = document.querySelector(".screen.active .rpl-svg");
    const r = svg.getBoundingClientRect();
    const crop = { x: 430, y: 50, w: 244, h: 108 };
    const sx = ((LON + 180) / 360) * 1000;
    const sy = ((90 - LAT) / 180) * 500;
    return { x: r.left + ((sx - crop.x) / crop.w) * r.width, y: r.top + ((sy - crop.y) / crop.h) * r.height };
  }, { LON: lon, LAT: lat });
const tokPt = (id) =>
  page.evaluate((tid) => {
    const r = document.querySelector(`.screen.active .rpl-token[data-r="${tid}"]`).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, id);
const state = () =>
  page.evaluate(() => ({
    marks: document.querySelectorAll(".screen.active .rpl-mark").length,
    chips: document.querySelectorAll(".screen.active .pn-badge.on").length,
    toast: document.querySelector(".screen.active .rpl-toast")?.textContent?.slice(0, 30) ?? "",
  }));

// ① 특징 안경(실 클릭)
const lens = await page.evaluate(() => {
  const r = document.querySelector(".screen.active .rpl-lens").getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await page.mouse.click(lens.x, lens.y);
await page.waitForTimeout(350);
console.log("lens on:", await page.evaluate(() => document.querySelector(".screen.active .rpl-lens")?.classList.contains("on")));

// ② 실 드래그 배치 — 서부 유럽 이름표를 프랑스 중부(2E, 47N)로
let from = await tokPt("west");
let to = await mapPt(2, 47);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(450);
console.log("drag west →", await state());

// ③ 실 드래그 오답 — 남부 유럽 이름표를 러시아(동부 폴리곤, 38E 56N)로
from = await tokPt("south");
to = await mapPt(38, 56);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(450);
console.log("wrong drop →", await state());

// ④ 탭-탭 배치 — 남부 유럽: 이름표 실 클릭 → 에스파냐(-4E, 40N) 실 클릭
from = await tokPt("south");
await page.mouse.click(from.x, from.y);
await page.waitForTimeout(250);
console.log("armed:", await page.evaluate(() => !!document.querySelector('.screen.active .rpl-token[data-r="south"].armed')));
to = await mapPt(-4, 40);
await page.mouse.click(to.x, to.y);
await page.waitForTimeout(450);
console.log("tap-tap south →", await state());

// ⑤ 나머지 둘도 실 드래그로 완주(스웨덴 북부·벨라루스)
for (const [id, lon, lat] of [["north", 15, 63], ["east", 31, 52]]) {
  from = await tokPt(id);
  to = await mapPt(lon, lat);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(420);
}
const fin = await state();
console.log("final →", fin);
console.log(fin.marks === 4 && fin.chips === 3 ? "PROBE PASS (4 marks, 3 goals)" : "PROBE FAIL");
await browser.close();
process.exit(fin.marks === 4 && fin.chips === 3 ? 0 : 1);
