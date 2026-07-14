// 페이월 v3 눈검수 샷 — 복습 탭 취약 드릴 게이트로 진입해 히어로(발자국 마크)·과목 다중 선택·
// 가격 카드(4과목 45,200원)를 캡처한다. PORT=<포트> node qa/shot-paywall-v3.mjs (dev 서버 필수).
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
};
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.evaluate((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), BASE);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// 복습 탭 → 취약 드릴(프리미엄 게이트) → 페이월
await page.evaluate(() => [...document.querySelectorAll(".screen.active .gnav-item")].find((b) => b.textContent.includes("복습"))?.click());
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelector(".screen.active .prep-card.accent")?.click());
await page.waitForSelector(".screen.active .pwx-mark", { timeout: 8000 });
await page.waitForTimeout(1200); // 등장 연출 완료 대기
console.log("pw-title:", await page.evaluate(() => document.querySelector(".screen.active .pw-title")?.textContent));
await page.screenshot({ path: "qa/shots/paywall-v3-hero.png" });

// 4과목 전부 담기 → 가격 카드로 스크롤
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const b of [...document.querySelectorAll(".screen.active .pwx-sub")].slice(1)) { b.click(); await sleep(90); }
});
await page.waitForTimeout(400);
console.log("amount:", await page.evaluate(() => document.querySelector(".screen.active .pwx-amount")?.textContent));
await page.evaluate(() => document.querySelector(".screen.active .pwx-subjects")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(350);
await page.screenshot({ path: "qa/shots/paywall-v3-price.png" });

console.log(`done · pageErrors ${pageErrors}`);
await browser.close();
process.exit(pageErrors > 0 ? 1 : 0);
