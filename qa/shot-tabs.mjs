import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173"; // 동시 세션이 5173을 잡을 수 있어 포트 주입 허용
const b = await chromium.launch({ channel: "chrome", headless: true });
const page = await b.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version:1, onboarded:true, grade:"중2", goalMin:10, streak:2, lastStudyDay:null, totalXp:900, lessons:{}, minigame:{} }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);
// 2026-07-21 공개 진입 플로우: 부팅은 항상 스플래시. "한번 둘러보기"를 눌러야 홈으로 간다
// (정본 = qa/e2e-soc7.mjs 부팅부). 고정 sleep 대신 조건 대기.
await page.waitForSelector("#sc-splash", { timeout: 25000 });
await page.mouse.click(210, 300); // 플립북 건너뛰기
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
  { timeout: 15000 },
);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
});
await page.waitForSelector("#sc-home", { timeout: 15000 });
await page.waitForTimeout(600);
// 전체 탭 텍스트 덤프
const tabs = await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].map(t => t.textContent));
console.log("TABS(" + tabs.length + "):", JSON.stringify(tabs, null, 0));
// 탭 줄이 다 보이게 스크롤 맨 오른쪽으로도 한 장
await page.screenshot({ path: "qa/shots/tabs-left.png", clip: { x:0, y:0, width:420, height:230 } });
await page.evaluate(() => { const t=document.querySelector(".unit-tabs"); if(t) t.scrollLeft = t.scrollWidth; });
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/tabs-right.png", clip: { x:0, y:0, width:420, height:230 } });
console.log("done");
await b.close();
