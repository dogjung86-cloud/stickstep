// u2l7 '변이' 개념 스텝 눈검수 — 실사 그림(조개껍데기·무궁화·고양이)이 제대로 뜨는지,
// 캡션이 "같은 종류인데 개체마다 다르다"로 읽히는지 확인한다.
// 사용: PORT=<포트> node qa/shot-u2l7-variation.mjs → qa/shots/u2l7-vary-*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {} }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("u2l7").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(900);
// 자유 모드 앞으로 가기 — 훅(0) → 개념(1)
await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd").click());
await page.waitForTimeout(900);

const info = await page.evaluate(() => {
  const step = document.querySelector(".screen.active .step");
  const imgs = [...step.querySelectorAll("img")].map((i) => ({
    src: i.getAttribute("src"),
    ok: i.naturalWidth > 0,
    w: Math.round(i.getBoundingClientRect().width),
    h: Math.round(i.getBoundingClientRect().height),
    lazy: i.getAttribute("loading"),
  }));
  const caps = [...step.querySelectorAll(".fig-cap, figcaption")].map((c) => c.textContent.trim());
  return { imgs, caps, title: step.querySelector(".h1")?.textContent };
});
console.log(JSON.stringify(info, null, 2));

// 전체 스텝 세로 캡처 + 그림 블록 개별 캡처
const scroll = await page.$(".screen.active .scroll");
await scroll.screenshot({ path: "qa/shots/u2l7-vary-top.png" });
await page.evaluate(() => {
  const s = document.querySelector(".screen.active .scroll");
  s.scrollTop = s.scrollHeight;
});
await page.waitForTimeout(400);
await scroll.screenshot({ path: "qa/shots/u2l7-vary-bottom.png" });
await page.evaluate(() => {
  const s = document.querySelector(".screen.active .scroll");
  s.scrollTop = Math.round(s.scrollHeight * 0.45);
});
await page.waitForTimeout(400);
await scroll.screenshot({ path: "qa/shots/u2l7-vary-mid.png" });
console.log("DONE → qa/shots/u2l7-vary-{top,mid,bottom}.png");
await browser.close();
