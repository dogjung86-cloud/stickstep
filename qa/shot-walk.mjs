// 걷기 연출 프레임 캡처(임시) — PORT=<포트> node qa/shot-walk.mjs <출력접두>
// u1l2 첫 완료 귀환 시나리오: 시작(+500ms)·중간(+1500ms)·도착(+3200ms) 3프레임.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "3000";
const prefix = process.argv[2] || "walk";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 820 } });

await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 155, lifeXp: 155, avatarId: 0,
  lessons: { u1l1: { done: true, acc: 92, bestXp: 30 }, u1l2: { done: true, acc: 85, bestXp: 26 } },
  exams: {}, wrongNotes: {},
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForSelector(".gamemap .gm-node", { timeout: 12000 });
await page.evaluate(() => {
  document.querySelector(".gm-node.now")?.scrollIntoView({ block: "center" });
  window.__walkHome("u1l2");
});
await page.waitForSelector(".gamemap .gm-node", { timeout: 12000 });
const t0 = Date.now();
const shotAt = async (ms, file) => {
  const wait = ms - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: file });
  console.log("saved", file, "+" + (Date.now() - t0) + "ms");
};
await shotAt(500, `${prefix}-1-start.png`);
await shotAt(1500, `${prefix}-2-mid.png`);
await shotAt(3300, `${prefix}-3-land.png`);
await browser.close();
