// 중2 Ⅴ v3 — 눈검수 스크린샷(주요 화면 12장 → qa/shots/g2u5v3-*.png).
// 헤드리스 실크로뮴이 확정 경로(프리뷰 하니스 캡처 프리즈 무관).
//   PORT=5433 node qa/shot-g2u5v3.mjs
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

// 1) L1 만화 첫 컷
await open(0); await W(900);
await shot("l1-comic");
// 2) L1 초록 추적(엽록체 층)
for (let i = 0; i < 7; i++) await cta();
await cta(); // concept①
await clickSel(".ghz-board"); await W(600);
await clickSel(".ghz-board"); await W(900);
await scrollTop(); await W(250);
await shot("l1-greenhunt");
// 3) L1 concept②(과정 도식+컷)
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .ghz-q .hook-choice")].find((b) => b.textContent.includes("엽록체"))?.click(); });
await W(500); await cta(); await scrollTop(); await W(300);
await shot("l1-concept-flow");
// 4) L1 recap 자세히 펼침
await cta();
await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card, .screen.active .recap-card")[0]?.click());
await W(450);
await shot("l1-recap-more");

// 5) L2 potatodrop 훅(반점까지)
await open(1); await W(800);
await clickSel(".hp3-pd"); await W(1300);
await scrollTop(); await W(200);
await shot("l2-hook-potato");
// 6) L2 기체 실험(그래프 갈라짐)
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("어떤 성분이"))?.click(); });
await W(450); await cta(); await cta();
await clickSel(".gxc-btn"); await W(4700);
await scrollTop(); await W(250);
await shot("l2-gascross");
// 7) L2 녹말 수사(검출 장면)
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .gxc-q .hook-choice")].find((b) => b.textContent.includes("이산화 탄소를 쓰고"))?.click(); });
await W(500); await clickSel(".gxc-btn"); await W(3600); await cta();
const tool = (i) => page.evaluate((k) => [...document.querySelectorAll(".screen.active .stq-tool")][k]?.click(), i);
await tool(0); await W(1100);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .stq-q .hook-choice")].find((b) => b.textContent.includes("원래 있던"))?.click(); });
await W(500); await tool(1); await W(2600); await tool(2); await W(1300);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .stq-q .hook-choice")].filter((b) => !b.disabled).find((b) => b.textContent.includes("햇빛을 받은 잎만"))?.click(); });
await W(2100);
await scrollTop(); await W(250);
await shot("l2-starchquest");

// 8) L3 곡선 랩(온도 곡선)
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
await shot("l3-factorcurve-temp");

// 9) L4 거꾸로 엔진(호흡 배열 + 밤)
await open(3); await W(800);
await clickSel(".hp3-vb"); await W(1100);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("숨을 쉬기 때문"))?.click(); });
await W(450); await cta(); await cta();
await clickSel(".fpe-btn"); await W(1200);
await clickSel(".fpe-bolt"); await W(700);
await page.evaluate(() => [...document.querySelectorAll(".screen.active .fpe-seg")][1]?.click()); await W(700);
await scrollTop(); await W(250);
await shot("l4-flipengine-night");

// 10) L5 해 게이지(한낮)
await open(4); await W(800);
await clickSel(".hp3-tn"); await W(1300);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("숨쉬기로 양분"))?.click(); });
await W(450); await cta(); await cta();
await page.evaluate(() => {
  const sl = document.querySelector(".screen.active .sgg-slider");
  sl.value = "12";
  sl.dispatchEvent(new Event("input", { bubbles: true }));
});
await W(500);
await scrollTop(); await W(250);
await shot("l5-sungauge-noon");
// 11) L5 한밤(화살표 역전)
await page.evaluate(() => {
  const sl = document.querySelector(".screen.active .sgg-slider");
  sl.value = "23";
  sl.dispatchEvent(new Event("input", { bubbles: true }));
});
await W(600);
await scrollTop(); await W(250);
await shot("l5-sungauge-night");

// 12) L6 배달로(배송 완료 태그)
await open(5); await W(800);
await clickSel(".hp3-sp"); await W(1400);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("차곡차곡"))?.click(); });
await W(450); await cta(); await cta();
await clickSel(".sfr-btn"); await W(1600);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .sfr-q .hook-choice")].find((b) => b.textContent.includes("위로도 아래로도"))?.click(); });
await W(600);
for (let i = 0; i < 3; i++) {
  await page.evaluate((k) => [...document.querySelectorAll(".screen.active .sfr-ship")][k]?.click(), i);
  await W(2500);
}
await scrollTop(); await W(250);
await shot("l6-sapflow-done");
// 13) L6 훅(고구마)
await open(5); await W(800);
await clickSel(".hp3-sp"); await W(1400);
await shot("l6-hook-sweetpotato");

console.log("DONE");
await browser.close();
