// u1l1 개념 컷 말풍선 위치 확인용 단발 스크린샷. PORT=5173 node qa/shot-u1l1-bubble.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  const lessons = { m1u1l1: { done: true, acc: 95, bestXp: 120 } };
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 100, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("m1u1l1").lesson, () => {}));
});
await page.waitForTimeout(700);
for (let i = 0; i < 2; i++) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(450);
}
await page.waitForSelector(".screen.active .cut-bubble", { timeout: 8000 });
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/u1l1-bubble.png" });
console.log("SAVED qa/shots/u1l1-bubble.png");
await browser.close();
