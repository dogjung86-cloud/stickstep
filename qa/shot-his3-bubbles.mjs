// h1u3 만화 말풍선 좌표 눈검수 — 4편 전 28컷을 컷 단위로 크롭 캡처(말풍선-머리 정렬 판정).
// 좌표 튜닝 도구: PORT=<포트> node qa/shot-his3-bubbles.mjs → qa/shots/his3-bb-*.png (폰 폭 390)
// l2는 훅(examnotice)+개념 2장 뒤, l4는 훅(hanjahw) 뒤, l7은 훅(arabnum) 뒤, l9는 만화 직행.
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
  await el.screenshot({ path: `qa/shots/his3-bb-${name}.png` });
  console.log("SHOT", name);
};

// 레슨 열기 — hookSel이 있으면 훅 통과, preCTAs만큼 CTA를 더 눌러 만화 진입
const openComic = async (id, hookSel, preCTAs) => {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(700);
  if (hookSel) {
    await page.evaluate((s) => {
      const t = document.querySelector(`.screen.active ${s}`);
      if (t instanceof HTMLElement) t.click();
      else t.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, hookSel);
    await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
    await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
    await W(400);
    await clickCTA(); // 훅 다음 스텝으로
  }
  for (let i = 0; i < preCTAs; i += 1) await clickCTA();
  await page.waitForSelector(".screen.active .comic-art", { timeout: 9000 });
};

const runComic = async (id, tag, panels, hookSel, preCTAs) => {
  await openComic(id, hookSel, preCTAs);
  await shotPanel(`${tag}-0`);
  for (let i = 1; i < panels; i += 1) {
    await clickCTA();
    await shotPanel(`${tag}-${i}`);
  }
};

await runComic("h1u3l2", "l2", 7, ".hh3-ex-note", 2); // 현장(훅+개념 2장 뒤)
await runComic("h1u3l4", "l4", 7, ".hh3-hj-note", 0); // 장안 24시(훅 바로 뒤)
await runComic("h1u3l7", "l7", 7, ".hh3-nm-book", 0); // 상인의 배낭(훅 바로 뒤)
await runComic("h1u3l9", "l9", 7, null, 0); // 카노사(만화 직행)

console.log("DONE 28 panels");
await browser.close();
