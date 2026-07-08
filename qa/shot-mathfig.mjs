// 신규 정석 그림(alignedFactorFig·ladderFig) 렌더 검수 — L3·L4·L5 concept 스텝 스크린샷.
// 자유 모드(완료 레슨 재입장)의 헤더 앞으로 가기(›)로 concept까지 점프한다. node qa/shot-mathfig.mjs (PORT env)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5211";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  for (let i = 1; i <= 12; i++) lessons[`m1u1l${i}`] = { done: true, acc: 95, bestXp: 120 };
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 900, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const gotoUnit1 = async () => {
  // Ⅰ이 전부 완료 상태면 홈이 Ⅱ 탭을 자동 선택하므로 명시적으로 Ⅰ 탭 클릭
  await page.waitForSelector(".unit-tab", { timeout: 9000 });
  await page.evaluate(() => {
    const t = [...document.querySelectorAll(".unit-tab")].find((x) => /수와 연산/.test(x.textContent));
    t?.click();
  });
  await W(800);
};
const openLesson = async (re) => {
  await gotoUnit1();
  await page.waitForSelector(".gm-node", { timeout: 9000 });
  const ok = await page.evaluate((re) => {
    const n = [...document.querySelectorAll(".gm-node")].find((x) => new RegExp(re).test(x.getAttribute("aria-label") ?? ""));
    if (!n) return false;
    n.click();
    return true;
  }, re);
  if (!ok) throw new Error(`레슨 노드 없음: ${re}`);
  await W(1000);
};
const fwd = async (n) => {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await W(650);
  }
};
const backHome = async () => {
  await page.evaluate(() => document.querySelector('.screen.active .xbtn[aria-label="닫기"]')?.click());
  await W(1100);
};

// L3 concept(사다리 factor) — 스텝: hook, factorTree, concept
await openLesson("소인수분해");
await fwd(2);
await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 400));
await W(300);
await page.screenshot({ path: "qa/shots/mathfig-l3-ladder.png" });
await backHome();

// L4 concept(정렬 비교 + 사다리 gcd) — 스텝: hook, venn, star, concept
await openLesson("최대공약수");
await fwd(3);
await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 420));
await W(300);
await page.screenshot({ path: "qa/shots/mathfig-l4-aligned.png" });
await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 1100));
await W(300);
await page.screenshot({ path: "qa/shots/mathfig-l4-ladder.png" });
await backHome();

// L5 concept(정렬 비교 lcm) — 스텝: hook, venn, concept
await openLesson("최소공배수");
await fwd(2);
await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 500));
await W(300);
await page.screenshot({ path: "qa/shots/mathfig-l5-lcm.png" });

// 홈 지도 장식(수학 기호 세트) 확인
await backHome();
await page.screenshot({ path: "qa/shots/mathfig-home-decor.png" });
await browser.close();
console.log("SHOTS DONE");
