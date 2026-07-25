// 실사용 피드백 검증 샷 — ① L5 blockflower 꽃/화분 위치 ② L6 diversityLab 게이지 고정.
// PORT=5211 node qa/shot-u2fix.mjs → qa/shots/u2f-*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    onboarded: true, premium: true, reviewMode: true, lessons: {}, totalXp: 0,
  }));
});
await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);

const mount = async (id) => {
  await page.evaluate(async (lid) => {
    const st = await import("/src/core/store.ts");
    if (!st.isDone(lid)) st.completeLesson(lid, 1, 0);
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lid).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await page.waitForTimeout(800);
};
const shot = async (n) => { await page.screenshot({ path: `qa/shots/u2f-${n}.png`, timeout: 15000 }); console.log("SHOT", n); };

// ① L5 훅 — 마지막 단계(화분 식물)까지 조립
await mount("u2l5");
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 4; i++) {
    const b = document.querySelector(".screen.active .swapbtn, .screen.active .hb2-act, .screen.active button.swapbtn");
    if (b && !b.disabled) b.click();
    await sleep(1100);
  }
});
await page.waitForTimeout(600);
await shot("l5-blockflower");

// ② L6 다양성 랩 — 조작부까지 스크롤한 상태에서 게이지가 보이는지
await mount("u2l6");
await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
await page.waitForTimeout(700);
// 세 변인을 올린다
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const k of ["eco", "species", "vary"]) {
    for (let i = 0; i < 4; i++) {
      const b = document.querySelector(`.screen.active [data-dvs-knob="${k}"][data-dvs-dir="1"]`);
      if (b && !b.disabled) b.click();
      await sleep(160);
    }
  }
});
await page.waitForTimeout(700);
// 스크롤하지 않은 상태에서 무대·게이지·손잡이 3개가 모두 보이는지가 진짜 기준이다.
await page.waitForTimeout(300);
const state = await page.evaluate(() => {
  const vis = (sel) => {
    const r = document.querySelector('.screen.active ' + sel)?.getBoundingClientRect();
    if (!r) return null;
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), onScreen: r.bottom > 0 && r.top < innerHeight };
  };
  return {
    stage: vis('.dvs-pane .stage'),
    gauge: vis('.dvs-gauge'),
    ctlFirst: vis('.dvs-ctl'),
    ctlLast: (() => {
      const all = [...document.querySelectorAll('.screen.active .dvs-ctl')];
      const r = all[all.length - 1]?.getBoundingClientRect();
      return r ? { top: Math.round(r.top), onScreen: r.bottom > 0 && r.top < innerHeight } : null;
    })(),
    stuck: document.querySelector('.screen.active .dvs-pane')?.classList.contains('stuck'),
    fill: document.querySelector('.screen.active .dvs-fill')?.style.width,
    level: document.querySelector('.screen.active .dvs-lv')?.textContent,
    viewportH: innerHeight,
    scrollNeeded: (() => {
      const c = document.querySelector('.screen.active .scroll');
      return c ? Math.max(0, c.scrollHeight - c.clientHeight) : -1;
    })(),
  };
});
console.log("GAUGE", JSON.stringify(state));
await shot("l6-gauge-sticky");
await browser.close();
console.log("DONE");
