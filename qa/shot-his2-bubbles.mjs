// h1u2 만화 말풍선 좌표 눈검수 — 4편 전 컷을 컷 단위로 크롭 캡처(말풍선-머리 정렬 판정).
// 좌표 튜닝 도구: PORT=<포트> node qa/shot-his2-bubbles.mjs → qa/shots/his2-bb-*.png (폰 폭 390)
// l1·l8은 만화가 첫 스텝(훅 없음), l3은 receipt 훅, l6은 olympic 훅을 지나 진입한다.
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
  await W(280);
  const el = await page.$(".screen.active .comic-art");
  await el.screenshot({ path: `qa/shots/his2-bb-${name}.png` });
  console.log("SHOT", name);
};

// 레슨 열기 — hookSel이 있으면 훅 통과 후 만화 진입, 없으면 만화가 첫 스텝
const openLesson = async (id, hookSel) => {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(700);
  if (hookSel) {
    await page.evaluate((s) => document.querySelector(`.screen.active ${s}`).dispatchEvent(new MouseEvent("click", { bubbles: true })), hookSel);
    await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
    await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
    await W(400);
    await clickCTA(); // 만화 진입(컷 0)
  }
  await page.waitForSelector(".screen.active .comic-art", { timeout: 9000 });
};

const runComic = async (id, tag, panels, hookSel) => {
  await openLesson(id, hookSel);
  await shotPanel(`${tag}-0`);
  for (let i = 1; i < panels; i += 1) {
    await clickCTA();
    await shotPanel(`${tag}-${i}`);
  }
};

await runComic("h1u2l1", "l1", 7, null); // 진화 릴레이(만화 직행)
await runComic("h1u2l3", "l3", 7, ".hh2-rc-folded"); // 최초의 영수증(receipt 훅)
await runComic("h1u2l6", "l6", 7, ".hh2-tv-scrg"); // 도자기 조각 투표(olympic 훅)
await runComic("h1u2l8", "l8", 7, null); // 통일 3종 세트(만화 직행)

console.log("DONE 28 panels");
await browser.close();
