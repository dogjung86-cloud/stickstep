// 발주 아트 눈검수 샷 — 만화 컷·개념 컷·발주 일러스트가 실제 화면에 어떻게 앉는지 캡처한다.
// PORT=5199 node qa/shot-g2u5v2-art.mjs  → qa/shots/g2u5v2-art-*.png
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.route("**/@vite/client", (route) =>
  route.fulfill({ status: 200, contentType: "application/javascript", body: `const s=new Map();
export function createHotContext(){return {on(){},send(){},accept(){},dispose(){},prune(){},invalidate(){},decline(){}}}
export function updateStyle(i,c){let e=s.get(i);if(!e){e=document.createElement("style");document.head.appendChild(e);s.set(i,e);}e.textContent=c;}
export function removeStyle(i){const e=s.get(i);if(e)e.remove();s.delete(i);}
export const injectQuery=(u)=>u; export default {};` }));
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, totalXp: 900, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const open = async (id) => page.evaluate(async (lessonId) => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  const f = findLesson(lessonId);
  nav.go(createLessonPlayer(f.lesson, { onExit: () => {}, onComplete: () => {} }));
}, id);
const cta = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout: 15000 });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await page.waitForTimeout(420);
};
const shot = (n) => page.screenshot({ path: `qa/shots/g2u5v2-art-${n}.png`, fullPage: true });

// L1: 훅 통과 → 만화 7컷을 한 장씩 캡처
await open("g2u5l1");
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelector(".screen.active .swapbtn").click());
await page.waitForTimeout(1900);
await page.evaluate(() => document.querySelector(".screen.active .hook-choices .hook-choice").click());
await page.waitForTimeout(700);
await cta();
for (let i = 0; i < 7; i++) { await shot(`comic${i}`); await cta(); }
for (const [id, name] of [["g2u5l2", "l2"], ["g2u5l3", "l3"], ["g2u5l5", "l5"], ["g2u5l6", "l6"]]) {
  await open(id);
  await page.waitForTimeout(700);
  // 훅 → concept 로 한 스텝 전진
  await page.evaluate(() => document.querySelector(".screen.active .swapbtn")?.click());
  await page.waitForTimeout(1900);
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices .hook-choice")?.click());
  await page.waitForTimeout(700);
  await cta();
  await shot(`${name}-step2`);
}
console.log("SHOTS DONE");
await browser.close();
