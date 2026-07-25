// 세포 3종 그림 교체 눈검수 — L4 concept(3연 카드)와 L4 그림 문제, L3 그림 문제를 실제 카드 크기로 캡처.
// PORT=5211 node qa/shot-u2cells.mjs → qa/shots/u2x-*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
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
    await page.waitForTimeout(430);
  }
};
const shot = async (n) => { await page.screenshot({ path: `qa/shots/u2x-${n}.png`, fullPage: true, timeout: 15000 }); console.log("SHOT", n); };

// L4 concept — 세포 3종 카드
await mount("u2l4");
await fwd(2);
await shot("l4-concept");
// L4 그림 문제 (가)(나)(다)
await fwd(4);
await shot("l4-figure-quiz");
// L3 그림 문제 — 입안 세포 vs 검정말잎 세포
await mount("u2l3");
await fwd(5);
await shot("l3-figure-quiz");

// 임베드 이미지 전수 로드 검사
const broken = await page.evaluate(async () => {
  const mod = await import("/src/content/unit2.ts");
  const json = JSON.stringify(mod.UNIT2);
  const srcs = [...new Set([...json.matchAll(/src=\\?"([^"\\]+\.webp)/g)].map((m) => m[1]))];
  const imgs = [...new Set([...json.matchAll(/"img":"([^"]+)"/g)].map((m) => "/" + m[1]))];
  const all = [...srcs, ...imgs];
  const res = await Promise.all(all.map((u) => new Promise((r) => {
    const im = new Image(); im.onload = () => r([u, im.naturalWidth]); im.onerror = () => r([u, 0]); im.src = u;
  })));
  return { total: res.length, broken: res.filter(([, w]) => !w).map((b) => b[0]) };
});
console.log("IMAGES", JSON.stringify(broken));
await browser.close();
console.log("DONE");
