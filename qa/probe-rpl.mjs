// probe-rpl.mjs — regionPlaceLab 아시아판(가로 모드) 실입력 프로브. probe-wpl.mjs 문법 계승.
// 합성 dispatchEvent는 히트테스트·오버레이 가림을 우회하므로, 실기기 "클릭이 안 된다"류
// 리포트는 이 프로브(Playwright 실 마우스/터치)로 재현한다. PORT=<포트> node qa/probe-rpl.mjs
// 검증: 가로 진입 실클릭 · 특징 안경 실클릭 · 실드래그 배치 · 오답 토스트 · 탭-탭 배치 · 5/5 완주.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const AS_CROP = { x: 569, y: 94, w: 348, h: 190 };
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
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
  if (!st.isDone("s1u2l1")) st.completeLesson("s1u2l1", 1, 0); // freeNav 해금
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u2l1").lesson, () => {}));
});
await page.waitForTimeout(900);
// 훅 → concept → 랩(3번째 스텝)까지 앞으로
for (let i = 0; i < 2; i += 1) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await page.waitForTimeout(520);
}
// 실클릭으로 가로 진입
await page.click(".screen.active .swapbtn");
await page.waitForSelector(".rot-overlay .rpl-stage-wide", { timeout: 9000 });
await page.waitForTimeout(800);
console.log("native:", await page.evaluate(() => document.querySelector(".rot-inner")?.classList.contains("native")));

const rectOf = (sel) =>
  page.evaluate((s) => {
    const el2 = document.querySelector(s);
    if (!el2) return null;
    const r = el2.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }, sel);

// 논리 지도 좌표(lon/lat) → 화면 좌표(mapPoint 역변환)
const mapPt = (lon, lat) =>
  page.evaluate(({ LON, LAT, crop }) => {
    const ov = document.querySelector(".rot-overlay").getBoundingClientRect();
    const native = document.querySelector(".rot-inner").classList.contains("native");
    const mapBox = document.querySelector(".rot-overlay .rpl-map");
    const L = parseFloat(mapBox.style.left);
    const T = parseFloat(mapBox.style.top);
    const MW = parseFloat(mapBox.style.width);
    const MH = parseFloat(mapBox.style.height);
    const sx = ((LON + 180) / 360) * 1000;
    const sy = ((90 - LAT) / 180) * 500;
    const lx = L + ((sx - crop.x) / crop.w) * MW;
    const ly = T + ((sy - crop.y) / crop.h) * MH;
    return native ? { x: ov.left + lx, y: ov.top + ly } : { x: ov.right - ly, y: ov.top + lx };
  }, { LON: lon, LAT: lat, crop: AS_CROP });
const state = () =>
  page.evaluate(() => ({
    marks: document.querySelectorAll(".rot-overlay .rpl-mark").length,
    chips: document.querySelectorAll(".pn-badge.on").length,
    toast: document.querySelector(".rot-overlay .wpl-toast")?.textContent?.slice(0, 30) ?? "",
    done: document.querySelectorAll(".rot-overlay .rpl-token.done").length,
  }));

// ① 특징 안경(실클릭)
const lensR = await rectOf(".rot-overlay .rpl-lens");
await page.mouse.click(lensR.x, lensR.y);
await page.waitForTimeout(350);
console.log("lens on:", await page.evaluate(() => document.querySelector(".rot-overlay .rpl-lens")?.classList.contains("on")));

// ② 실드래그 배치 — 동아시아 이름표를 중국 중원(107E, 36N)으로
let from = await rectOf('.rot-overlay .rpl-token[data-r="east"]');
let to = await mapPt(107, 36);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.waitForTimeout(120);
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.waitForTimeout(120);
await page.mouse.up();
await page.waitForTimeout(450);
console.log("drag east →", await state());

// ③ 실드래그 오답 — 남부 아시아 이름표를 몽골(동아시아 폴리곤)로
from = await rectOf('.rot-overlay .rpl-token[data-r="south"]');
to = await mapPt(103, 46);
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.mouse.move(to.x, to.y, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(450);
console.log("wrong drop →", await state());

// ④ 탭-탭 배치(터치) — 남부 아시아: 이름표 탭 → 인도(78E, 22N) 탭
from = await rectOf('.rot-overlay .rpl-token[data-r="south"]');
await page.touchscreen.tap(from.x, from.y);
await page.waitForTimeout(300);
console.log("armed:", await page.evaluate(() => !!document.querySelector('.rot-overlay .rpl-token[data-r="south"].armed')));
to = await mapPt(78, 22);
await page.touchscreen.tap(to.x, to.y);
await page.waitForTimeout(450);
console.log("tap-tap south →", await state());

// ⑤ 나머지 셋도 실드래그로 완주
for (const [id, lon, lat] of [["southeast", 102, 15], ["southwest", 45, 24], ["central", 67, 45]]) {
  from = await rectOf(`.rot-overlay .rpl-token[data-r="${id}"]`);
  to = await mapPt(lon, lat);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(420);
}
const fin = await state();
console.log("final →", fin);
// ⑥ 나가기 실클릭 — 오버레이가 닫히고 세로 CTA가 열려 있는가
const exitR = await rectOf(".rot-exit");
await page.mouse.click(exitR.x, exitR.y);
await page.waitForTimeout(700);
const after = await page.evaluate(() => ({
  overlay: !!document.querySelector(".rot-overlay"),
  cta: !document.querySelector(".screen.active button.cta")?.disabled,
}));
console.log("after exit →", after);
const pass = fin.marks === 5 && fin.chips === 3 && !after.overlay && after.cta;
console.log(pass ? "PROBE PASS (5 marks, 3 goals, exit ok)" : "PROBE FAIL");
await browser.close();
process.exit(pass ? 0 : 1);
