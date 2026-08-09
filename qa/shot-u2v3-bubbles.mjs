// 중1 Ⅱ v3 만화 말풍선 정렬 눈검수 — 말풍선 있는 컷만 캡처(qa/shots/u2v3-bub-*.png).
// 좌표 보정 루프: 실행 → 샷 눈검수(꼬리가 화자를 향하나·그림 핵심을 가리나) → unit2v3.ts 좌표 수정 → 재실행.
//   PORT=5411 node qa/shot-u2v3-bubbles.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
const W = (ms) => page.waitForTimeout(ms);

const open = (i) =>
  page.evaluate(async (idx) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { UNIT2_V3 } = await import("/src/content/unit2v3.ts");
    nav.go(createLessonPlayer(UNIT2_V3.lessons[idx], { onExit: () => {}, onComplete: () => {} }));
  }, i);
const nextCut = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(450); };
const shotPanel = async (name) => {
  // 컷 프레임만 잘라 캡처(말풍선 정렬 판단에 충분)
  const el = await page.$(".screen.active .comic-art");
  await el.screenshot({ path: `qa/shots/u2v3-bub-${name}.png` });
  console.log("SHOT", name);
};

// L1: p0·p1·p2·p3·p6에 말풍선
await open(0); await W(800);
await shotPanel("l1p0");
await nextCut(); await shotPanel("l1p1");
await nextCut(); await shotPanel("l1p2");
await nextCut(); await shotPanel("l1p3");
await nextCut(); await nextCut(); await nextCut(); await shotPanel("l1p6");

// L7: p0·p1·p2·p3·p6에 말풍선
await open(6); await W(800);
await shotPanel("l7p0");
await nextCut(); await shotPanel("l7p1");
await nextCut(); await shotPanel("l7p2");
await nextCut(); await shotPanel("l7p3");
await nextCut(); await nextCut(); await nextCut(); await shotPanel("l7p6");

console.log("DONE 10 bubble shots");
await browser.close();
