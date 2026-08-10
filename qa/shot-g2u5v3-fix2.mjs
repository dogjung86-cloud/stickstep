// 중2 Ⅴ v3 — 피드백 수리 2건 눈검수(온도 부드러운 곡선 + L6 실사 무대).
//   PORT=5433 node qa/shot-g2u5v3-fix2.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  sessionStorage.setItem("ss.g2u5v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
const still = () => page.evaluate(() => document.getAnimations().forEach((a) => { try { a.cancel(); } catch { /* */ } }));
const W = (ms) => page.waitForTimeout(ms);

const open = (i) =>
  page.evaluate(async (idx) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { G2_UNIT5_V3 } = await import("/src/content/g2/unit5v3.ts");
    nav.go(createLessonPlayer(G2_UNIT5_V3.lessons[idx], { onExit: () => {}, onComplete: () => {} }));
  }, i);
const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(460); };
const fwd = async () => { await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click()); await W(500); };
const clickSel = async (sel) => { await page.evaluate((s) => { document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const shot = async (name) => { await still(); await page.screenshot({ path: `qa/shots/g2u5v3-${name}.png`, fullPage: false }); console.log("SHOT", name); };
const scrollTop = () => page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));

// ── L3: 곡선 랩 — 세 곡선 완주 후 온도 곡선(부드러운 봉우리) ──
await open(2); await W(800);
await clickSel(".hp3-wb"); await W(1100);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("알맞게 맞춰"))?.click(); });
await W(450); await cta(); await cta();
const scrub = async () => {
  for (let v = 0; v <= 100; v += 10) {
    await page.evaluate((x) => {
      const sl = document.querySelector(".screen.active .fct-slider");
      if (!sl) return;
      sl.value = String(x);
      sl.dispatchEvent(new Event("input", { bubbles: true }));
    }, v);
    await W(40);
  }
};
await scrub(); await W(2700); await scrub(); await W(2700); await scrub(); await W(800);
await scrollTop(); await W(250);
await shot("fix2-l3-temp-smooth");

// L3 recap(curvePeak 미니아트) → 자유 모드 앞걸음으로 factorShapes 퀴즈 그림까지
await page.waitForSelector(".screen.active .fct-q .hook-choice", { timeout: 6000 });
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .fct-q .hook-choice")].find((b) => b.textContent.includes("온도"))?.click(); });
await W(700); await cta(); // recap
await scrollTop(); await W(300);
await shot("fix2-l3-recap-miniart");
await fwd(); // binSort
await fwd(); // 문제1 factorShapesFig mcq
await scrollTop(); await W(300);
await shot("fix2-l3-quiz-shapes");

// ── L6: 실사 무대 — 낮 / 밤 변신 / 배송 완료 ──
await open(5); await W(900);
await clickSel(".hp3-sp"); await W(1400);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("차곡차곡"))?.click(); });
await W(450); await cta(); await cta();
await scrollTop(); await W(400);
await shot("fix2-l6-stage-day");
await clickSel(".sfr-btn"); await W(1600);
await scrollTop(); await W(250);
await shot("fix2-l6-stage-night");
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .sfr-q .hook-choice")].find((b) => b.textContent.includes("위로도 아래로도"))?.click(); });
await W(600);
for (let i = 0; i < 3; i++) {
  await page.evaluate((k) => [...document.querySelectorAll(".screen.active .sfr-ship")][k]?.click(), i);
  await W(2500);
}
await scrollTop(); await W(250);
await shot("fix2-l6-stage-done");

console.log("DONE");
await browser.close();
