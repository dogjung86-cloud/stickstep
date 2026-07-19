// h1u1 만화 말풍선 좌표 눈검수 — 말풍선 있는 전 컷(l1 c1~c6 + l5 m0~m5)을 컷 단위로 캡처.
// 좌표 튜닝 도구: PORT=<포트> node qa/shot-his1-bubbles.mjs → qa/shots/his1-bb-*.png (폰 폭 390)
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
  // 컷 프레임만 정확히 크롭 캡처 — 말풍선-머리 정렬 판정용
  await page.evaluate(() => document.querySelector(".screen.active .comic-art")?.scrollIntoView({ block: "center" }));
  await W(280);
  const el = await page.$(".screen.active .comic-art");
  await el.screenshot({ path: `qa/shots/his1-bb-${name}.png` });
  console.log("SHOT", name);
};

// 레슨 열기(플레이어 직진입) + 훅 통과
const openLesson = async (id, hookSel, svgTarget) => {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(700);
  if (svgTarget) await page.evaluate((s) => document.querySelector(`.screen.active ${s}`).dispatchEvent(new MouseEvent("click", { bubbles: true })), hookSel);
  else await page.evaluate((s) => document.querySelector(`.screen.active ${s}`).click(), hookSel);
  await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
  await W(400);
  await clickCTA(); // 만화 진입(컷 0)
  await page.waitForSelector(".screen.active .comic-art", { timeout: 9000 });
};

// L1: 컷0(말풍선 없음) → c1~c6
await openLesson("h1u1l1", ".hh1-save", false);
for (let i = 1; i <= 6; i += 1) {
  await clickCTA();
  await shotPanel(`l1-c${i}`);
}

// L5: m0~m5
await openLesson("h1u1l5", ".hh1-nd-frameg", true);
await shotPanel("l5-m0");
for (let i = 1; i <= 5; i += 1) {
  await clickCTA();
  await shotPanel(`l5-m${i}`);
}

console.log("DONE 12 panels");
await browser.close();
