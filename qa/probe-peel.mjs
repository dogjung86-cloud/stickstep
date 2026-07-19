// peelLab 구도 ② e2e 실패(pel-s2) 원인 프로브: 장면별 스크린샷 + 상태 덤프.
// PORT=<포트> node qa/probe-peel.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 160)); });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const done = { done: true, acc: 100, bestXp: 10 };
  const lessons = {};
  for (let u = 1; u <= 4; u++) for (let l = 1; l <= 10; l++) lessons[`m2u${u}l${l}`] = done;
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 0,
    lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("m2u5l5").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(900);

const W = (ms) => page.waitForTimeout(ms);
const shot = (n) => page.screenshot({ path: `qa/shots/probe-peel-${n}.png` });
const dump = async (tag) => {
  const st = await page.evaluate(() => ({
    h1: document.querySelector(".screen.active .step .h1")?.textContent?.slice(0, 20) ?? null,
    src: !!document.querySelector(".screen.active .pel-src"),
    srcGone: document.querySelector(".screen.active .pel-src")?.classList?.contains("gone") ?? null,
    choices: [...document.querySelectorAll(".screen.active .mq6-choice")].map((b) => b.textContent),
    chips: [...document.querySelectorAll(".screen.active .pn-badge")].map((b) => `${b.getAttribute("data-g")}:${b.classList.contains("on") ? 1 : 0}`),
    btns: [...document.querySelectorAll(".screen.active .lk-actions button")].map((b) => b.textContent.trim()),
    helper: document.querySelector(".screen.active .helper")?.textContent?.slice(0, 50),
  }));
  console.log(tag, JSON.stringify(st));
};

// 훅 통과
for (let i = 0; i < 7; i++) {
  if (await page.$(".screen.active .hook-choices .hook-choice")) break;
  const t = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".screen.active .swapbtn")].find((x) => x.offsetParent && !x.disabled);
    if (b) { b.click(); return true; }
    return false;
  });
  await W(t ? 2600 : 900);
}
await page.waitForSelector(".screen.active .hook-choices .hook-choice", { timeout: 20000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices .hook-choice").click());
await W(500);
await page.waitForFunction(() => { const b = document.querySelector(".screen.active button.cta"); return b && !b.disabled; }, { timeout: 26000 });
await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
await W(900);
await dump("랩 진입");

const srcCenter = () => page.evaluate(() => {
  const c = document.querySelector(".screen.active .pel-src");
  if (!c) return null;
  const b = c.getBBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
});
const labDrag = async (pts, wait = 700) => {
  await page.evaluate(async (pts) => {
    const svg = document.querySelector(".screen.active .mcl-plane svg");
    if (!svg) return;
    const vb = svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    const cx = (x) => r.left + ((x - vb.x) / vb.width) * r.width;
    const cy = (y) => r.top + ((y - vb.y) / vb.height) * r.height;
    const fire = (t, x, y) =>
      svg.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 44, isPrimary: true, clientX: cx(x), clientY: cy(y) }));
    fire("pointerdown", pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      for (let k = 1; k <= 5; k++) {
        fire("pointermove", x0 + ((x1 - x0) * k) / 5, y0 + ((y1 - y0) * k) / 5);
        await new Promise((res) => setTimeout(res, 30));
      }
    }
    fire("pointerup", pts[pts.length - 1][0], pts[pts.length - 1][1]);
  }, pts);
  await W(wait);
};

// ── 구도 ① ──
let p = await srcCenter();
console.log("구도① src 중심:", p);
await labDrag([p, [p[0] + 60, p[1] - 16], [p[0] + 120, p[1] - 26]], 3600);
await dump("구도① 드래그 후");
await shot("s1-after-drag");
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".screen.active .mq6-choice")].find((x) => /^AA/.test(x.textContent));
  b?.click();
});
await W(2400);
await dump("구도① AA 후");
// 다음 구도 버튼 대기(최대 32초)
await page.waitForFunction(
  () => [...document.querySelectorAll(".screen.active button")].some((b) => b.offsetParent && !b.disabled && /다음 구도/.test(b.textContent)),
  { timeout: 32000 },
);
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".screen.active button")].find((x) => x.offsetParent && !x.disabled && /다음 구도/.test(x.textContent));
  b?.click();
});
await W(1800);
await dump("구도② 진입");
await shot("s2-enter");

// ── 구도 ② ──
p = await srcCenter();
console.log("구도② src 중심:", p);
if (p) {
  await labDrag([p, [p[0] + 60, p[1] - 16], [p[0] + 120, p[1] - 26]], 3600);
  await dump("구도② 드래그 후");
  await shot("s2-after-drag");
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".screen.active .mq6-choice")].find((x) => /^AA/.test(x.textContent));
    b?.click();
  });
  await W(2400);
  await dump("구도② AA 후");
  await shot("s2-final");
}
await browser.close();
console.log("DONE");
