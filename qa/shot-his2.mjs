// h1u2 주요 화면 눈검수 샷 — 홈 Ⅱ 지도·훅 2종·문명 지도 hotspot·연표 랩·recap·실사 퀴즈.
// PORT=<포트> node qa/shot-his2.mjs → qa/shots/his2-*.png (폰 폭 390)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5173";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "his", premium: true, reviewMode: false, goalMin: 10, streak: 1, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {} }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const W = (ms) => page.waitForTimeout(ms);
const shot = async (name, full = false) => {
  await W(300);
  await page.screenshot({ path: `qa/shots/his2-${name}.png`, fullPage: full });
  console.log("SHOT", name);
};
const clickCTA = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(480);
};
const openLesson = async (id) => {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(760);
};
const svgTap = (sel) => page.evaluate((s) => document.querySelector(`.screen.active ${s}`).dispatchEvent(new MouseEvent("click", { bubbles: true })), sel);

// 1) 홈 — Ⅱ 밴드·데코(문명 순례)·프리미엄 크라운
await page.evaluate(() => document.querySelectorAll(".unit-band")[1]?.scrollIntoView({ block: "start" }));
await shot("home-band2");

// 2) 훅 sprout(텃밭) — 물 준 뒤
await openLesson("h1u2l2");
await shot("hook-sprout");
await page.evaluate(() => document.querySelector(".screen.active .hh2-gd-can").click());
await W(1300);
await shot("hook-sprout-watered");

// 3) 훅 romanclock — 확대 뒤
await openLesson("h1u2l7");
await svgTap(".hh2-ck-body");
await W(1300);
await shot("hook-clock-zoom");

// 4) L4 hotspot 문명 지도 — 스팟 하나 연 상태
await openLesson("h1u2l4");
await svgTap(".hh2-ap-board");
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // 훅 → concept 이집트 진입
await clickCTA(); // → concept 인도·중국
await clickCTA(); // → hotspot
await page.waitForSelector(".screen.active .hs-dot", { timeout: 9000 });
await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot")[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await W(900);
await page.evaluate(() => document.querySelector(".screen.active .hs-photo")?.scrollIntoView({ block: "center" }));
await shot("hotspot-civ");

// 5) L9 timelineLab — 첫 임무 카드 상태
await openLesson("h1u2l9");
await svgTap(".hh2-sc-tagg");
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // 훅 → concept 불교 진입
await clickCTA(); // → concept 비단길
await clickCTA(); // → timelineLab
await page.waitForSelector(".screen.active .htl-cell", { timeout: 9000 });
await shot("timeline-start");

// 6) L3 recap 자세히 + millenniumFig concept
await openLesson("h1u2l3");
await svgTap(".hh2-rc-folded");
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // comic 진입
for (let i = 0; i < 7; i += 1) await clickCTA(); // 만화 7컷 통과 → concept(문명 레시피)
await page.evaluate(() => document.querySelectorAll(".screen.active .cblock svg, .screen.active svg")[0]?.scrollIntoView({ block: "center" }));
await shot("concept-millennium", true);

console.log("DONE");
await browser.close();
