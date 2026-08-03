// 역사 만화 확대(Ⅱ~Ⅳ) 말풍선 좌표 눈검수 — 컷 단위 캡처(shot-his1x-bubbles의 파라미터판).
// UNIT=h1u2|h1u3|h1u4 PORT=<포트> node qa/shot-hisx-bubbles.mjs → qa/shots/<unit>x-bb-*.png (폰 폭 390)
// 내비: completeLesson 시딩 → freeNav 앞으로 화살표(.xbtn.fwd)로 comic 스텝 직행.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const UNIT = process.env.UNIT || "h1u2";
// 레슨별 [id, comic까지 fwd 클릭 수, 컷 수]
const CONFIGS = {
  h1u2: [["h1u2l2", 1, 7], ["h1u2l4", 4, 7], ["h1u2l5", 1, 7], ["h1u2l7", 3, 7], ["h1u2l9", 2, 7]],
  h1u3: [["h1u3l1", 1, 7], ["h1u3l3", 2, 7], ["h1u3l5", 2, 7], ["h1u3l8", 3, 7], ["h1u3l10", 5, 7]],
  h1u4: [["h1u4l1", 1, 7], ["h1u4l2", 3, 7], ["h1u4l5", 3, 7], ["h1u4l6", 4, 7], ["h1u4l7", 2, 7], ["h1u4l10", 1, 7]],
};
const LESSONS = CONFIGS[UNIT];
if (!LESSONS) throw new Error(`unknown UNIT ${UNIT}`);

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
  await el.screenshot({ path: `qa/shots/${name}.png` });
  console.log("SHOT", name);
};
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

let total = 0;
for (const [id, fwd, cuts] of LESSONS) {
  await openComic(id, fwd);
  const short = id.replace(UNIT, "").replace("l", "l");
  await shotPanel(`${UNIT}x-bb-${short}-c0`);
  for (let i = 1; i < cuts; i += 1) {
    await clickCTA();
    await shotPanel(`${UNIT}x-bb-${short}-c${i}`);
  }
  total += cuts;
}
console.log(`DONE ${total} panels (${UNIT})`);
await browser.close();
