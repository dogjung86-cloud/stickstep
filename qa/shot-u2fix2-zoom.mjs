// 세포 그림·공장 소품을 확대해 눈검수하는 샷(qa/shots/u2z-*.png).
// PORT=5211 node qa/shot-u2fix2-zoom.mjs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 4 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    onboarded: true, premium: true, reviewMode: true, lessons: {}, totalXp: 0,
  }));
});
await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("u2l2")) st.completeLesson("u2l2", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("u2l2").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(900);
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(420);
}
await page.waitForTimeout(900);

const box = await page.locator(".screen.active .cfl-canvas").boundingBox();
const k = Math.min(box.width / 360, 348 / 334);
const ox = (box.width - 360 * k) / 2;
const clipOf = (x0, y0, x1, y1) => ({
  x: box.x + ox + x0 * k, y: box.y + y0 * k, width: (x1 - x0) * k, height: (y1 - y0) * k,
});
await page.screenshot({ path: "qa/shots/u2z-cell.png", clip: clipOf(10, 44, 350, 244) });
await page.screenshot({ path: "qa/shots/u2z-props.png", clip: clipOf(6, 238, 354, 332) });
console.log("SHOT cell/props");
await browser.close();
