// 1단원 개편 + 스플래시 검증 샷 — node qa/shot-u1.mjs <outPrefix> (dev 5173 필요)
import { chromium } from "playwright-core";

const OUT = process.argv[2] ?? "qa/u1";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

const freeze = () => page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
const shot = async (name) => { await freeze(); await page.screenshot({ path: `${OUT}-${name}.png` }); console.log("SAVED", name); };

// 0) 스플래시 플립북 — 온보딩 전 상태로 접속
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(700); // 플립북 재생 중간
await page.screenshot({ path: `${OUT}-splash-flip.png` });
console.log("SAVED splash-flip");
await page.waitForTimeout(2200); // 정착(공부 포즈 + 워드마크)
await shot("splash-settled");

// 1) u1 완료 상태로 재접속
await page.evaluate(() => {
  const lessons = {};
  ["u1l1", "u1l2", "u1l3", "u1l4", "u1l5"].forEach((id) => (lessons[id] = { done: true, acc: 95, bestXp: 60 }));
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "중1", goalMin: 10, streak: 2,
    lastStudyDay: "2026-07-07", totalXp: 300, lessons, minigame: {},
  }));
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const pickUnit1 = async () => {
  await page.evaluate(() => {
    [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.trim().startsWith("I."))?.click();
  });
  await page.waitForTimeout(600);
};
const openLesson = async (label) => {
  await pickUnit1();
  await page.evaluate((label) => {
    [...document.querySelectorAll(".screen.active .gm-node")].find((x) => (x.getAttribute("aria-label") || "").includes(label))?.click();
  }, label);
  await page.waitForTimeout(800);
};
const fwd = async (n = 1) => {
  for (let i = 0; i < n; i++) { await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click()); await page.waitForTimeout(400); }
};
const exit = async () => { await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click()); await page.waitForTimeout(600); };
const clickText = (re) => page.evaluate((re) => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
    .find((x) => new RegExp(re).test(x.textContent || ""));
  if (b) b.click();
  return !!b;
}, re);

// 2) L2 훅 — 색컵 예측 → 온도계 레이스
await openLesson("직접 탐구하기");
await clickText("검은색 컵");
await page.waitForTimeout(2000);
await shot("hook-colorcups");
// L2 recap
await fwd(3);
await shot("recap-l2");
await exit();

// 3) L3 만화 + 타임라인 + recap
await openLesson("과학과 인류 문명");
await shot("comic-l3");
await fwd(2);
await shot("recap-l3");
await exit();

// 4) L4 훅 — 스피커
await openLesson("첨단 과학기술");
await clickText("말 걸기");
await page.waitForTimeout(1300);
await clickText("컴퓨터가 말을 학습");
await page.waitForTimeout(500);
await shot("hook-speaker");
await exit();

// 5) L5 훅 — 공장 연기 3번
await openLesson("지속가능한 삶");
for (let i = 0; i < 3; i++) { await clickText("공장 연기 뿜기"); await page.waitForTimeout(650); }
await page.waitForTimeout(400);
await shot("hook-smokestack");
// 지도(u1) 전체
await exit();
await pickUnit1();
await shot("map-u1-final");

await browser.close();
console.log("DONE");
