// 중2 수학 Ⅰ 증거 스크린샷 4종 + 스틱맨 컷 로드 검증 — PORT=<포트> node qa/shot-m2u1.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  const lessons = {};
  for (let i = 1; i <= 10; i++) lessons[`m2u1l${i}`] = { done: true, acc: 95, bestXp: 120 };
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 900, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
const W = (ms) => page.waitForTimeout(ms);
const shot = (n) => page.screenshot({ path: `qa/shots/${n}.png` });

// 스틱맨 컷 10장 로드 검증
const cutOk = await page.evaluate(async () => {
  const out = [];
  for (let i = 1; i <= 10; i++) {
    const ok = await new Promise((res) => {
      const im = new Image();
      im.onload = () => res(im.naturalWidth > 0);
      im.onerror = () => res(false);
      im.src = `./math2/cuts/u1l${i}.webp`;
    });
    out.push(`u1l${i}:${ok ? "OK" : "FAIL"}`);
  }
  return out.join(" ");
});
console.log("컷 로드:", cutOk);

const mount = async (id, steps = 0) => {
  await page.evaluate(async (id) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(id).lesson, () => {}));
  }, id);
  await W(800);
  for (let i = 0; i < steps; i++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await W(430);
  }
};

// ① 훅 장면(L4 0.999… — 조작 후)
await mount("m2u1l4");
await page.evaluate(() => [...document.querySelectorAll(".screen.active button")].find((b) => /양변에 ×3/.test(b.textContent))?.click());
await W(2400);
await shot("m2u1-ev1-hook");

// ② 랩 목표 완성(L4 shiftLab 판 1 완주)
await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
await W(700);
const btn = async (re, wait) => {
  await page.waitForFunction((re) => [...document.querySelectorAll(".screen.active button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)), re, { timeout: 15000 });
  await page.evaluate((re) => [...document.querySelectorAll(".screen.active button")].find((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent))?.click(), re);
  await W(wait);
};
await btn("×10", 2100);
await btn("빼기", 2600);
await btn("나누기", 2600);
await shot("m2u1-ev2-lab");

// ③ recap 자세히 펼침(L3)
await mount("m2u1l3", 3);
await page.evaluate(() => document.querySelector(".screen.active .rc-card, .screen.active [class*='rc-']")?.click());
await W(700);
await shot("m2u1-ev3-recap");

// ④ 그림 문제(L9 expandFig mcq)
await mount("m2u1l9", 4);
await W(500);
const figOk = await page.evaluate(() => !!document.querySelector(".screen.active .step svg"));
console.log("그림 문제 svg:", figOk);
await shot("m2u1-ev4-quizfig");

// 컷 임베드 확인(L5 concept의 발주 컷 img)
await mount("m2u1l5", 2);
await W(700);
const cutImg = await page.evaluate(() => {
  const im = document.querySelector(".screen.active .step img");
  return im ? `${im.getAttribute("src")} loaded=${im.complete && im.naturalWidth > 0}` : "no img";
});
console.log("concept 컷:", cutImg);
await shot("m2u1-ev5-concept");

console.log("=== 스크린샷 완료 ===");
await browser.close();
