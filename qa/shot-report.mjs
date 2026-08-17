// 버그·건의 접수 시트 눈검수 샷 — 마이 탭 행 → 시트 열림(샘플 입력 상태)을 촬영한다.
// PORT=<포트> node qa/shot-report.mjs → qa/shots/report-{my,sheet}.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5173";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
      version: 1,
      onboarded: true,
      grade: "g1",
      viewGrade: "g1",
      viewSubject: "sci",
      premium: false,
      reviewMode: false,
      goalMin: 10,
      streak: 3,
      lastStudyDay: null,
      totalXp: 120,
      lessons: {},
      minigame: {},
      lastUnits: { "sci:g1": "u3" },
      recentUnitId: "u3",
    }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.waitForSelector("#sc-splash", { timeout: 25000 });
await page.mouse.click(210, 300);
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
  { timeout: 15000 },
);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
});
await page.waitForSelector("#sc-home", { timeout: 15000 });
await page.waitForTimeout(600);

await page.evaluate(() => {
  [...document.querySelectorAll(".gnav-item")].find((b) => b.textContent.includes("마이")).click();
});
await page.waitForTimeout(900);
if (await page.evaluate(() => !!document.querySelector("#sc-login"))) {
  await page.evaluate(() => document.querySelector('#sc-login .backbtn[aria-label="닫기"]')?.click());
  await page.waitForTimeout(600);
}
await page.waitForSelector("#sc-my", { timeout: 8000 });
await page.evaluate(() => document.querySelector("#sc-my .scroll").scrollTo(0, 9999));
await page.waitForTimeout(300);
await page.screenshot({ path: "qa/shots/report-my.png" });

await page.evaluate(() => {
  [...document.querySelectorAll(".my-row")].find((r) => r.textContent.includes("버그·건의")).click();
});
await page.waitForTimeout(600);
await page.fill('.mysheet[aria-label="버그·건의 보내기"] .rep-text', "열 단원 레슨에서 그림이 안 보여요");
await page.waitForTimeout(300);
await page.screenshot({ path: "qa/shots/report-sheet.png" });
console.log("SAVED qa/shots/report-my.png · report-sheet.png");
await browser.close();
