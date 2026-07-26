// 물 비유 3D 랩(g2u7l3 waterCircuit3d) 시각 검증. PORT=5273 node qa/shot-elecwater3d.mjs → qa/shots/ew3d-*.png
// 가로 뷰포트(=rotateStage native 모드)라 회전 없이 그대로 찍힌다.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5273";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 460 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("console", (m) => m.type() === "error" && console.log("CONSOLE:", m.text()));

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  ["g2u7l1", "g2u7l2", "g2u7l3"].forEach((id) => (lessons[id] = { done: true, acc: 95, bestXp: 120 }));
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", premium: true, reviewMode: false,
    goalMin: 10, streak: 2, lastStudyDay: null, totalXp: 1600, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const W = (ms) => page.waitForTimeout(ms);
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/ew3d-${name}.png` });
  console.log("SHOT", name);
};

await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("g2u7l3").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await W(900);
// 훅 → 랩
await page.evaluate(() => document.querySelector(".screen.lesson-screen:last-of-type .xbtn.fwd")?.click());
await W(700);
await shot("00-portrait");

await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => /가로 화면/.test(x.textContent));
  b?.click();
});
await page.waitForSelector(".rot-overlay.in canvas", { timeout: 9000 });
await W(2200);
await shot("01-stage-mid"); // 열자마자 = 안내 카드 + 물 회로 쪽 점선 링 깜빡임

const dev = async (fn, ...args) => page.evaluate(([f, a]) => window.__ewx[f](...a), [fn, args]);

await dev("setStep", 2);
await W(1600);
await shot("02-step-strong");
await dev("setStep", 0);
await W(1800);
await shot("03-step-weak");
await dev("setStep", 2);
await W(1600);

// 요소 탭 — 펌프(역할 카드) → 전지(비유 카드)
await dev("tap", "pump");
await W(600);
await shot("04-card-pump"); // 물 요소 선택 → 전기 회로 쪽이 깜빡여야 한다
await dev("tap", "battery");
await W(700);
await shot("05-card-pair");

// 나머지 4쌍
for (const [w, e] of [["flow", "current"], ["wheel", "bulb"], ["pipe", "wire"], ["valve", "switch"]]) {
  await dev("tap", w);
  await W(260);
  await dev("tap", e);
  await W(320);
}
await W(600);
await shot("06-all-matched");

// 밸브 잠금
await dev("toggleValve");
await W(2600);
await shot("07-valve-closed");
await dev("toggleValve");
await W(1600);
await shot("08-reopened");

console.log("STATE", JSON.stringify(await page.evaluate(() => window.__ewx.state())));
await browser.close();
console.log("DONE");
