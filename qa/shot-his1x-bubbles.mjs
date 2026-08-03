// h1u1 만화 확대 3편(l2 실록 수호 · l3 카데시 · l4 서력 탄생) 말풍선 좌표 눈검수 —
// 말풍선 있는 전 컷을 컷 단위로 캡처. 좌표는 이미지 %(2026-08-03 원비율 추종 신표준 — 크롭 보정 없음).
// 좌표 튜닝 도구: PORT=<포트> node qa/shot-his1x-bubbles.mjs → qa/shots/his1x-bb-*.png (폰 폭 390)
// 내비: completeLesson 시딩 → freeNav 앞으로 화살표(.xbtn.fwd)로 comic 스텝 직행(binSort 실플레이 불요).
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
await page.waitForTimeout(1400);
const W = (ms) => page.waitForTimeout(ms);
const clickCTA = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(480);
};
const shotPanel = async (name) => {
  await page.evaluate(() => document.querySelector(".screen.active .comic-art")?.scrollIntoView({ block: "center" }));
  await W(300);
  const el = await page.$(".screen.active .comic-art");
  await el.screenshot({ path: `qa/shots/his1x-bb-${name}.png` });
  console.log("SHOT", name);
};

// 완료 시딩 + freeNav로 comic 스텝까지 fwd 화살표 직행
const openComic = async (id, fwdClicks) => {
  await page.evaluate(async (lessonId) => {
    const st = await import("/src/core/store.ts");
    if (!st.isDone(lessonId)) st.completeLesson(lessonId, 1, 0);
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(760);
  for (let k = 0; k < fwdClicks; k += 1) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd").click());
    await W(460);
  }
  await page.waitForSelector(".screen.active .comic-panel .comic-art", { timeout: 9000 });
  await W(400);
};

// l2: hook(0) → comic(1) — 컷 7장 전부 말풍선
await openComic("h1u1l2", 1);
await shotPanel("l2-c0");
for (let i = 1; i <= 6; i += 1) {
  await clickCTA();
  await shotPanel(`l2-c${i}`);
}

// l3: hook(0) → concept(1) → binSort(2) → comic(3)
await openComic("h1u1l3", 3);
await shotPanel("l3-c0");
for (let i = 1; i <= 6; i += 1) {
  await clickCTA();
  await shotPanel(`l3-c${i}`);
}

// l4: hook(0) → comic(1)
await openComic("h1u1l4", 1);
await shotPanel("l4-c0");
for (let i = 1; i <= 6; i += 1) {
  await clickCTA();
  await shotPanel(`l4-c${i}`);
}

console.log("DONE 21 panels");
await browser.close();
