// 2차-보완 검증 샷 — node qa/shot-round2b.mjs <outPrefix> (dev 5173 필요)
import { chromium } from "playwright-core";

const OUT = process.argv[2] ?? "qa/r2b";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.addInitScript(() => {
  const lessons = {};
  ["u3l1","u3l2","u3l3","u3l4","u3l5","u5l1","u5l2","u5l3","u7l1","u7l2","u7l3","u7l4","u7l5","u7l6"]
    .forEach((id) => (lessons[id] = { done: true, acc: 95, bestXp: 60 }));
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "중1", goalMin: 10, streak: 2,
    lastStudyDay: "2026-07-07", totalXp: 900, lessons, minigame: {},
  }));
});
const freeze = () => page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
const shot = async (name) => { await freeze(); await page.screenshot({ path: `${OUT}-${name}.png` }); console.log("SAVED", name); };
const clickText = (re) => page.evaluate((re) => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
    .find((x) => new RegExp(re).test(x.textContent || "") || new RegExp(re).test(x.getAttribute("aria-label") || ""));
  if (b) b.click();
  return !!b;
}, re);
const goHome = async () => { await page.goto("http://localhost:5173/", { waitUntil: "networkidle" }); await page.waitForTimeout(900); };
const pickUnit = async (roman) => {
  await page.evaluate((roman) => { [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.trim().startsWith(roman + "."))?.click(); }, roman);
  await page.waitForTimeout(700);
};
const openLesson = async (label) => {
  await page.evaluate((label) => { [...document.querySelectorAll(".screen.active .gm-node")].find((x) => (x.getAttribute("aria-label") || "").includes(label))?.click(); }, label);
  await page.waitForTimeout(800);
};
const fwd = async (n = 1) => {
  for (let i = 0; i < n; i++) { await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click()); await page.waitForTimeout(420); }
};

// 1) u3 지도(태양 장식 수정) + u5 지도
await goHome();
await pickUnit("III");
await shot("map-u3fix");
await pickUnit("V");
await shot("map-u5");

// 2) curio — u3l3 전도(스텝1)
await pickUnit("III");
await openLesson("열의 이동");
await fwd(1);
console.log("step:", await page.evaluate(() => document.querySelector(".h1")?.textContent?.slice(0, 20)));
await page.evaluate(() => {
  const sc = document.querySelector(".screen.active .scroll");
  sc.scrollTop = sc.scrollHeight;
  document.querySelector(".screen.active .curio-head")?.click();
  sc.scrollTop = sc.scrollHeight;
});
await page.waitForTimeout(500);
await page.evaluate(() => { const sc = document.querySelector(".screen.active .scroll"); sc.scrollTop = sc.scrollHeight; });
await shot("curio-blanket");

// 3) 일식 가로 — 더 좁힌 구도
await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click());
await page.waitForTimeout(600);
await pickUnit("VII");
await openLesson("일식과 월식");
await fwd(1);
await clickText("가로 화면으로");
await page.waitForTimeout(2400);
await shot("eclipse-near2");

await browser.close();
console.log("DONE");
