// 2차 수정 검증 샷 — node qa/shot-round2.mjs <outPrefix> (dev 5173 필요)
import { chromium } from "playwright-core";

const OUT = process.argv[2] ?? "qa/r2";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  const lessons = {};
  ["u1l1","u1l2","u1l3","u1l4","u1l5","u1l6","u2l1","u2l2","u2l3","u2l4","u2l5","u2l6",
   "u3l1","u3l2","u3l3","u3l4","u3l5","u4l1","u4l2","u4l3","u4l4","u4l5","u4l6",
   "u5l1","u5l2","u5l3","u5l4","u5l5","u5l6","u6l1","u6l2","u6l3","u6l4",
   "u7l1","u7l2","u7l3","u7l4","u7l5","u7l6"].forEach((id) => (lessons[id] = { done: true, acc: 95, bestXp: 60 }));
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "중1", goalMin: 10, streak: 2,
    lastStudyDay: "2026-07-07", totalXp: 900, lessons, minigame: {},
  }));
});

const freeze = () => page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
const shot = async (name, opts = {}) => {
  await freeze();
  await page.screenshot({ path: `${OUT}-${name}.png`, ...opts });
  console.log("SAVED", name);
};
const clickText = (re) => page.evaluate((re) => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
    .find((x) => new RegExp(re).test(x.textContent || "") || new RegExp(re).test(x.getAttribute("aria-label") || ""));
  if (b) b.click();
  return !!b;
}, re);
const goHome = async () => {
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
};
const pickUnit = async (roman) => {
  await page.evaluate((roman) => {
    [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.trim().startsWith(roman + "."))?.click();
  }, roman);
  await page.waitForTimeout(700);
};
const openLesson = async (label) => {
  await page.evaluate((label) => {
    [...document.querySelectorAll(".screen.active .gm-node")].find((x) => (x.getAttribute("aria-label") || "").includes(label))?.click();
  }, label);
  await page.waitForTimeout(800);
};
const fwd = async (n = 1) => {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForTimeout(420);
  }
};

// 1) 지도 4종 — 단원 특색 장식
await goHome();
for (const [roman, name] of [["I", "map-u1"], ["III", "map-u3"], ["IV", "map-u4"], ["V", "map-u5"], ["VI", "map-u6"], ["VII", "map-u7"]]) {
  await pickUnit(roman);
  await shot(name);
}

// 2) 황도 12궁 — 별자리 스틱 그림
await pickUnit("VII");
await openLesson("돌고 도는 하늘");
await fwd(3);
await page.waitForTimeout(1500);
await shot("zodiac-figures");

// 3) 태양 지도 핫스팟 — 홍염 탭 → 사진 카드
await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click());
await page.waitForTimeout(600);
await openLesson("태양의 활동");
await fwd(2);
await page.waitForTimeout(600);
await page.evaluate(() => {
  const dots = [...document.querySelectorAll(".screen.active .hs-dot")];
  dots[4]?.click(); // 홍염
});
await page.waitForTimeout(900);
await page.evaluate(() => { const sc = document.querySelector(".screen.active .scroll"); sc.scrollTop = sc.scrollHeight; });
await page.waitForTimeout(300);
await shot("hotspot-photo");

// 4) curio — u3 전도 랩의 이불 카드
await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click());
await page.waitForTimeout(600);
await pickUnit("III");
await openLesson("열의 이동");
await fwd(8); // 만화(7컷은 CTA지만 fwd로 스텝 단위 이동: comic=step0 → conduction=step1)
await page.waitForTimeout(400);
const h1 = await page.evaluate(() => document.querySelector(".h1")?.textContent?.slice(0, 22));
console.log("u3l3 step:", h1);
await page.evaluate(() => {
  document.querySelector(".screen.active .curio-head")?.click();
  const sc = document.querySelector(".screen.active .scroll");
  sc.scrollTop = sc.scrollHeight;
});
await page.waitForTimeout(500);
await shot("curio-conduction");

// 5) moonPhase — seg 없음 + 화살표 1개
await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click());
await page.waitForTimeout(600);
await pickUnit("VII");
await openLesson("달의 위상");
await fwd(1);
await page.waitForTimeout(2200);
await shot("moon-simple");

// 6) 일식 가로 — 좁혀진 거리
await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click());
await page.waitForTimeout(600);
await openLesson("일식과 월식");
await fwd(1);
await clickText("가로 화면으로");
await page.waitForTimeout(2400);
await shot("eclipse-near");
await page.evaluate(() => document.querySelector(".rot-exit")?.click());
await page.waitForTimeout(800);

// 7) 월식 문제 그림(문제 3)
await fwd(4);
await page.waitForTimeout(500);
console.log("quiz step:", await page.evaluate(() => document.querySelector(".step")?.textContent?.slice(0, 30)));
await shot("quiz-lunarpath");

await browser.close();
console.log("DONE");
