// probe-wpl-native.mjs — 데스크톱 가로(native) 실입력 프로브. PORT=<포트> node qa/probe-wpl-native.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 950, height: 560 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.addInitScript(() =>
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10 }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("s1u1l2")) st.completeLesson("s1u1l2", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u1l2").lesson, () => {}));
});
await page.waitForTimeout(800);
await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(500);
await page.click(".screen.active .swapbtn");
await page.waitForSelector(".rot-overlay .wpl-stage", { timeout: 9000 });
await page.waitForTimeout(700);
console.log("native:", await page.evaluate(() => document.querySelector(".rot-inner")?.classList.contains("native")));

const lens = await page.evaluate(() => {
  const r = document.querySelector(".wpl-lens").getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await page.mouse.click(lens.x, lens.y);
await page.waitForTimeout(300);
console.log("lens on:", await page.evaluate(() => document.querySelector(".wpl-lens")?.classList.contains("on")));

const tok = await page.evaluate(() => {
  const r = document.querySelector('.wpl-token[data-t="stilt"]').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
const tgt = await page.evaluate(() => {
  const ov = document.querySelector(".rot-overlay").getBoundingClientRect();
  const mb = document.querySelector(".wpl-map");
  const L = parseFloat(mb.style.left), T = parseFloat(mb.style.top);
  const MW = parseFloat(mb.style.width), MH = parseFloat(mb.style.height);
  const sx = ((-62 + 180) / 360) * 1000, sy = ((90 + 3) / 180) * 500;
  return { x: ov.left + L + (sx / 1000) * MW, y: ov.top + T + ((sy - 14) / 400) * MH };
});
await page.mouse.move(tok.x, tok.y);
await page.mouse.down();
await page.mouse.move(tgt.x, tgt.y, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(500);
console.log("after drag:", await page.evaluate(() => ({
  marks: document.querySelectorAll(".wpl-mark").length,
  toast: document.querySelector(".wpl-toast")?.textContent?.slice(0, 26),
})));
// 콜드 맵 탭(토큰 미선택) — 현재는 무반응인지 확인
await page.mouse.click(tgt.x - 60, tgt.y - 40);
await page.waitForTimeout(300);
console.log("cold map tap toast:", await page.evaluate(() => document.querySelector(".wpl-toast")?.classList.contains("show")));
await browser.close();
