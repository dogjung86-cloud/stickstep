// shot-soc7-bubbles.mjs — 장영실 만화 4컷의 말풍선 정렬 눈검수(컷 프레임 크롭, his 표준).
// 합격 기준: 말풍선이 **화자 머리 바로 위**(꼬리 끝이 정수리를 향함), 다른 인물·핵심 소품 가림 0,
// 컷 프레임 밖 잘림 0, 2줄 이내 가독. PORT=<포트> node qa/shot-soc7-bubbles.mjs → qa/shots/soc7-bub-*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5217";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);
await page.addInitScript(() =>
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10, lessons: { s1u7l4: { done: true } } }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u7l4").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(1000);
for (let i = 0; i < 2; i += 1) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await page.waitForTimeout(650);
}
await page.waitForSelector(".screen.active .comic-art", { timeout: 9000 });
for (let i = 0; i < 4; i += 1) {
  await page.waitForTimeout(600);
  const el = await page.$(".screen.active .comic-art");
  await el.screenshot({ path: `qa/shots/soc7-bub-${i}.png` });
  console.log(`SHOT soc7-bub-${i}`);
  if (i < 3) {
    await page.evaluate(() => document.querySelector(".screen.active button.cta")?.click());
    await page.waitForTimeout(500);
  }
}
console.log("DONE");
await browser.close();
