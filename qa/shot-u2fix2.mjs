// 실사용 피드백 2차 검증 — ① classifyLab 무대·기준 버튼 동시 표시 실측 ② cellFactoryLab 그림 품질.
// PORT=5211 node qa/shot-u2fix2.mjs → qa/shots/u2g-*.png + 실측 로그
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
const fwd = async (n) => {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForTimeout(420);
  }
  await page.waitForTimeout(500);
};
const shot = async (n) => {
  await page.screenshot({ path: `qa/shots/u2g-${n}.png`, timeout: 20000 });
  console.log("SHOT", n);
};
const sleep = (ms) => page.waitForTimeout(ms);

/** 스크롤 없이(초기 상태) 무대와 조작부가 뷰포트 안에 다 들어오는지 */
const fitReport = async (label, sels) => {
  const r = await page.evaluate((ss) => {
    const out = { viewportH: innerHeight, scrollTop: 0, scrollNeeded: 0 };
    const c = document.querySelector(".screen.active .scroll");
    if (c) { out.scrollTop = Math.round(c.scrollTop); out.scrollNeeded = Math.max(0, c.scrollHeight - c.clientHeight); }
    for (const [k, sel] of Object.entries(ss)) {
      const list = [...document.querySelectorAll(".screen.active " + sel)];
      const e = list[list.length - 1];
      if (!e) { out[k] = null; continue; }
      const b = e.getBoundingClientRect();
      out[k] = {
        top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height),
        inView: b.top >= 0 && b.bottom <= innerHeight,
      };
    }
    return out;
  }, sels);
  console.log("FIT", label, JSON.stringify(r));
  return r;
};

// ────────────────────────────── ① classifyLab (u2l8 · step 1)
await mount("u2l8");
await fwd(1);
await fitReport("classify:init", { stage: ".b3-stage", crits: ".cls-crits", firstCrit: ".cls-crits .b3-chip", friend: '[data-cls-act="friend"]' });
await shot("l8-classify-init");

// 느낌 기준 하나 고르고 친구 분류까지
await page.evaluate(() => document.querySelector('.screen.active [data-cls-crit="cute"]')?.click());
await sleep(500);
await fitReport("classify:picked", { stage: ".b3-stage", crits: ".cls-crits", friend: '[data-cls-act="friend"]' });
await shot("l8-classify-picked");
await page.evaluate(() => document.querySelector('.screen.active [data-cls-act="friend"]')?.click());
await sleep(1900);
await shot("l8-classify-friend");

// 고유한 특징 국면
await page.evaluate(() => document.querySelector('.screen.active [data-cls-crit="wing"]')?.click());
await sleep(500);
await fitReport("classify:unique", { stage: ".b3-stage", crits: ".cls-crits", friend: '[data-cls-act="friend"]' });
await shot("l8-classify-unique");
await page.evaluate(() => document.querySelector('.screen.active [data-cls-act="friend"]')?.click());
await sleep(1900);

// 박쥐 국면
await page.evaluate(() => document.querySelector('.screen.active [data-cls-act="bat"]')?.click());
await sleep(900);
await fitReport("classify:bat0", { stage: ".b3-stage", ctl: ".cls-controls" });
await shot("l8-classify-bat0");
await page.evaluate(() => document.querySelector('.screen.active [data-cls-act="bat2"]')?.click());
await sleep(1400);
await fitReport("classify:bat1", { stage: ".b3-stage", ctl: ".cls-controls" });
await shot("l8-classify-bat1");
await page.evaluate(() => document.querySelector('.screen.active [data-cls-pick="true"]')?.click());
await sleep(1200);
await shot("l8-classify-done");
console.log("CTA", await page.evaluate(() => {
  const b = document.querySelector(".screen.active .btn.cta");
  return b ? { text: b.textContent, enabled: !b.disabled } : null;
}));

// ────────────────────────────── ② cellFactoryLab (u2l2 · step 3)
await mount("u2l2");
await fwd(3);
await sleep(600);
await shot("l2-cell-init");
await fitReport("cell:init", { stage: ".b3-stage" });

// 소품 3개를 실제 드래그해 목표를 모두 켠다(논리 좌표 360×334 → 화면 좌표는 letterbox 배율)
const dragTo = async (from, to, midShot) => {
  const box = await page.locator(".screen.active .cfl-canvas").boundingBox();
  const k = Math.min(box.width / 360, 348 / 334);
  const ox = (box.width - 360 * k) / 2;
  const px = (p) => ({ x: box.x + ox + p.x * k, y: box.y + p.y * k });
  const a = px(from);
  const b = px(to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / 8, a.y + ((b.y - a.y) * i) / 8);
    await sleep(40);
    if (midShot && i === 4) { await sleep(220); await shot(midShot); }
  }
  await page.mouse.up();
  await sleep(700);
};
const TRAY = { gate: { x: 62, y: 276 }, control: { x: 180, y: 276 }, power: { x: 298, y: 276 } };
const DROP = { wall: { x: 180, y: 54 }, nucleus: { x: 200, y: 120 }, mito: { x: 86, y: 178 } };
await dragTo(TRAY.gate, DROP.wall, "l2-cell-dragging");
await shot("l2-cell-wall");
await dragTo(TRAY.control, DROP.nucleus);
await shot("l2-cell-nucleus");
await dragTo(TRAY.power, DROP.mito);
await sleep(900);
await shot("l2-cell-all");
// 오답 경로도 한 번 — 되돌아오고 교정 문구가 뜨는지
await fitReport("cell:done", { stage: ".b3-stage" });
console.log("GOALS", await page.evaluate(() => [...document.querySelectorAll(".screen.active .pn-badge.bio")].map((e) => e.className)));
console.log("CTA2", await page.evaluate(() => {
  const b = document.querySelector(".screen.active .btn.cta");
  return b ? { text: b.textContent, enabled: !b.disabled } : null;
}));

await browser.close();
console.log("DONE");
