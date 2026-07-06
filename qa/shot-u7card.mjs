// 투어 탭 → 정보 카드 검증 — node qa/shot-u7card.mjs (dev 5173 필요)
import { chromium } from "playwright-core";

const OUT = process.argv[2] ?? "qa/u7card";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.addInitScript(() => {
  const lessons = {};
  ["u7l1", "u7l2", "u7l3", "u7l4", "u7l5", "u7l6"].forEach((id) => (lessons[id] = { done: true, acc: 100, bestXp: 60 }));
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "중1", goalMin: 10, streak: 1,
    lastStudyDay: "2026-07-07", totalXp: 500, lessons, minigame: {},
  }));
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /VII\. 태양계/.test(b.textContent || ""))?.click());
await page.waitForTimeout(500);
await page.evaluate(() => {
  [...document.querySelectorAll(".screen.active .gm-node")].find((x) => (x.getAttribute("aria-label") || "").includes("태양계 식구들"))?.click();
});
await page.waitForTimeout(800);
await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
await page.waitForTimeout(500);
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /가로 화면으로/.test(b.textContent || ""))?.click());
await page.waitForTimeout(2600);

// 화면 정중앙 = 태양 → 탭
await page.evaluate(() => {
  const cv = document.querySelector(".sp3-canvas");
  const r = cv.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const fire = (type) => cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 21, isPrimary: true, clientX: cx, clientY: cy }));
  fire("pointerdown");
  fire("pointerup");
});
await page.waitForTimeout(1400);
const card = await page.evaluate(() => ({
  shown: document.querySelector(".sp3-card")?.classList.contains("show"),
  name: document.querySelector(".sp3-card b")?.textContent,
  stats: [...document.querySelectorAll(".sp3-stat")].map((s) => s.textContent.trim().replace(/\s+/g, " ")),
  pill: document.querySelector(".sp3-pill")?.textContent,
}));
console.log(JSON.stringify(card, null, 1));
await page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
await page.screenshot({ path: `${OUT}.png` });
console.log("SAVED card shot");
await browser.close();
