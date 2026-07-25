// L6 훅 biomedoor — 문 셋을 다 열어 열대/사막/극지 생물이 각각 알아볼 수 있게 그려졌는지 확인.
// PORT=5211 node qa/shot-u2hook6.mjs → qa/shots/u2h-biomedoor.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 3 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    onboarded: true, premium: true, reviewMode: true, lessons: {}, totalXp: 0,
  }));
});
await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("u2l6")) st.completeLesson("u2l6", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("u2l6").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(900);
// 문 3개를 차례로 연다
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) {
    const b = document.querySelector(".screen.active .swapbtn");
    if (b && !b.disabled) b.click();
    await sleep(1200);
  }
});
await page.waitForTimeout(700);
const art = await page.$(".screen.active .hb2-biomedoor");
if (art) await art.screenshot({ path: "qa/shots/u2h-biomedoor.png" });
else await page.screenshot({ path: "qa/shots/u2h-biomedoor.png" });
console.log("SHOT biomedoor");
await browser.close();
