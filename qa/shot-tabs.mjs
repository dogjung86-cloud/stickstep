import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", headless: true });
const page = await b.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version:1, onboarded:true, grade:"중2", goalMin:10, streak:2, lastStudyDay:null, totalXp:900, lessons:{}, minigame:{} }));
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(1300);
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
