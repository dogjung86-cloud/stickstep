// 홈 학년 세그 검증 — 중1/중2 트랙 스크린샷 + 탭 목록 덤프. node qa/shot-home-grades.mjs (PORT 기본 5173)
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: null, premium: false, reviewMode: false,
    goalMin: 10, streak: 0, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);

const dumpTabs = async (label) => {
  const info = await page.evaluate(() => ({
    seg: [...document.querySelectorAll(".gseg")].map((b) => `${b.textContent.trim()}${b.className.includes("on") ? "*" : ""}`),
    tabs: [...document.querySelectorAll(".unit-tab")].map((t) => t.textContent.trim() + (t.className.includes("soon") ? " (soon)" : "")),
  }));
  console.log(`[${label}] seg: ${info.seg.join(" | ")}`);
  info.tabs.forEach((t) => console.log(`  · ${t}`));
};

await dumpTabs("중1 기본");
await page.screenshot({ path: "qa/shots/home-g1.png" });

// 중2 세그 클릭
await page.evaluate(() => [...document.querySelectorAll(".gseg")].find((b) => b.textContent.includes("중2"))?.click());
await page.waitForTimeout(900);
await dumpTabs("중2 전환");
await page.screenshot({ path: "qa/shots/home-g2.png" });

// 중2 III·IV 탭 지도 확인
for (const [name, file] of [["빛과 파동", "home-g2u3.png"], ["물질의 구성", "home-g2u4.png"], ["지권의 변화", "home-g2u2.png"]]) {
  await page.evaluate((name) => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes(name))?.click(), name);
  await page.waitForTimeout(800);
  const nodes = await page.evaluate(() => document.querySelectorAll(".gm-node").length);
  console.log(`[${name}] 지도 노드 ${nodes}개`);
  await page.screenshot({ path: `qa/shots/${file}` });
}

await browser.close();
console.log("완료");
