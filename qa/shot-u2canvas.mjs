// 캔버스 랩 직접 캡처 — 헤드리스 합성이 프리즈해도(사고 17) canvas.toDataURL은 실제 픽셀을 준다.
// PORT=5211 node qa/shot-u2canvas.mjs → qa/shots/u2c-*.png
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const PORT = process.env.PORT || "5211";
mkdirSync("qa/shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("bs.state", JSON.stringify({ onboarded: true, premium: true, reviewMode: true, lessons: {}, totalXp: 0 }));
});
await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);

const save = (name, dataUrl) => {
  if (!dataUrl) { console.log("MISS", name); return; }
  writeFileSync(`qa/shots/u2c-${name}.png`, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log("SHOT", name);
};

await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("u2l7")) st.completeLesson("u2l7", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("u2l7").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(700);
for (let i = 0; i < 2; i++) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(450);
}

const grab = () => page.evaluate(() => {
  const cv = document.querySelector(".screen.active .fil-canvas");
  return cv ? cv.toDataURL("image/png") : null;
});

// 국면 1: 변이 재기 전
await page.waitForTimeout(600);
save("l7-phase1", await grab());

// 부리 재기 → 이주 → 예측 → 6세대
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const cv = document.querySelector(".screen.active .fil-canvas");
  const rect = cv.getBoundingClientRect();
  const k = rect.width / 360;
  const tap = (lx, ly) => {
    const x = rect.left + lx * k, y = rect.top + ly * k;
    for (const t of ["pointerdown", "pointerup"])
      cv.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 1, clientX: x, clientY: y, isPrimary: true }));
  };
  for (let row = 0; row < 2; row++) for (let col = 0; col < 6; col++)
    tap(34 + ((col + 0.5) / 6) * 292, 74 + ((row + 0.6) / 2) * 96);
  await sleep(350);
  document.querySelector('.screen.active [data-fil-act="split"]')?.click();
  await sleep(1300);
  document.querySelector(".screen.active .hook-choices .hook-choice")?.click();
  await sleep(1000);
});
await page.waitForTimeout(500);
save("l7-phase2-split", await grab());

await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { document.querySelector('.screen.active [data-fil-act="gen"]')?.click(); await sleep(340); }
});
await page.waitForTimeout(700);
save("l7-phase3-gen3", await grab());
console.log("PILL", await page.evaluate(() => document.querySelector(".screen.active .stage-hud .pill span:last-child")?.textContent));

await page.evaluate(() => document.querySelector('.screen.active [data-fil-act="meet"]')?.click());
await page.waitForTimeout(2000);
save("l7-phase4-species", await grab());

await browser.close();
console.log("DONE");
