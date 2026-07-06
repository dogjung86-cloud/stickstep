// 2단원 마이그레이션 검증 샷 — node qa/shot-u2.mjs <outPrefix> (dev 5173 필요)
import { chromium } from "playwright-core";

const OUT = process.argv[2] ?? "qa/u2";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.addInitScript(() => {
  const lessons = {};
  ["u2l1","u2l2","u2l3","u2l4","u2l5","u2l6"].forEach((id) => (lessons[id] = { done: true, acc: 95, bestXp: 60 }));
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "중1", goalMin: 10, streak: 2,
    lastStudyDay: "2026-07-07", totalXp: 400, lessons, minigame: {},
  }));
});
const freeze = () => page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
const shot = async (name) => { await freeze(); await page.screenshot({ path: `${OUT}-${name}.png` }); console.log("SAVED", name); };
const clickText = (re) => page.evaluate((re) => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
    .find((x) => new RegExp(re).test(x.textContent || ""));
  if (b) b.click();
  return !!b;
}, re);
const pickUnit2 = async () => {
  await page.evaluate(() => { [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.trim().startsWith("II."))?.click(); });
  await page.waitForTimeout(700);
};
const openLesson = async (label) => {
  await pickUnit2();
  await page.evaluate((label) => { [...document.querySelectorAll(".screen.active .gm-node")].find((x) => (x.getAttribute("aria-label") || "").includes(label))?.click(); }, label);
  await page.waitForTimeout(800);
};
const fwd = async (n = 1) => { for (let i = 0; i < n; i++) { await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click()); await page.waitForTimeout(420); } };
const exit = async () => { await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click()); await page.waitForTimeout(600); };
const h1 = () => page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().slice(0, 26));

await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(3200); // 스플래시 통과
await pickUnit2();
await shot("map-u2");

// L1 hook (cellzoom)
await openLesson("세포");
console.log("L1:", await h1());
await clickText("확대경으로");
await page.waitForTimeout(1700);
await shot("l1-cellzoom");
await fwd(3); // → recap
await shot("l1-recap");
await exit();

// L2 hook (stain)
await openLesson("세포 관찰");
await clickText("염색액 한 방울");
await page.waitForTimeout(1300);
await clickText("특정 부분");
await page.waitForTimeout(400);
await shot("l2-stain");
await exit();

// L3 hook (bodycount) + curio in orgLevels
await openLesson("생물의 구성 단계");
await clickText("약 37조 개");
await page.waitForTimeout(900);
await shot("l3-bodycount");
await fwd(1); // orgLevels(동물) — curio
await page.evaluate(() => { const c = document.querySelector(".screen.active .curio-head"); c?.click(); const sc = document.querySelector(".screen.active .scroll"); if (sc) sc.scrollTop = sc.scrollHeight; });
await page.waitForTimeout(500);
await shot("l3-curio");
await exit();

// L4 hook (ladybugs)
await openLesson("생물다양성");
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .lb-bug")].slice(0, 3).forEach((b) => b.dispatchEvent(new MouseEvent("click", { bubbles: true }))); });
await page.waitForTimeout(700);
await shot("l4-ladybugs");
await exit();

// L5 hook (batbird) + curio(바이러스) in dichotomKey
await openLesson("생물의 분류");
await shot("l5-batbird");
await exit();

// L6 hook (foodweb)
await openLesson("생물다양성 보전");
await clickText("메뚜기를 사라지게");
await page.waitForTimeout(1400);
await shot("l6-foodweb");
await exit();

await browser.close();
console.log("DONE");
