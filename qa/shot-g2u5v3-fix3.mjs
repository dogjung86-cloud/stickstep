// 중2 Ⅴ v3 — 피드백 수리 눈검수 3차(상추 로제트 3무대 + 수박 줄무늬).
//   PORT=5433 node qa/shot-g2u5v3-fix3.mjs
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
const clickSel = async (sel) => { await page.evaluate((s) => { document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const shot = async (name) => { await still(); await page.screenshot({ path: `qa/shots/g2u5v3-${name}.png`, fullPage: false }); console.log("SHOT", name); };
const scrollTop = () => page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));

// ── L2: 기체 교차 무대(용기 속 상추) ──
await open(1); await W(900);
await clickSel(".hp3-pd"); await W(1300);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("어떤 성분이"))?.click(); });
await W(500); await cta(); await cta();
await scrollTop(); await W(300);
await shot("fix3-l2-jar-lettuce");

// ── L2: 녹말 수사 장면 0(창가의 두 모종) ──
await clickSel(".gxc-btn"); await W(4700);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .gxc-q .hook-choice")].find((b) => b.textContent.includes("이산화 탄소를 쓰고"))?.click(); });
await W(500); await clickSel(".gxc-btn"); await W(3600); await cta();
await scrollTop(); await W(400);
await shot("fix3-l2-seedlings");

// ── L4: 상추 봉지 훅 ──
await open(3); await W(900);
await scrollTop(); await W(300);
await shot("fix3-l4-veggiebag");

// ── L5: 열대야 수박 훅 ──
await open(4); await W(900);
await scrollTop(); await W(300);
await shot("fix3-l5-watermelon");

console.log("DONE");
await browser.close();
