// shot-soc1.mjs — 사회 Ⅰ 눈검수 샷. PORT=<포트> node qa/shot-soc1.mjs
// 산출: qa/shots/soc1-*.png (홈 지도 · 훅 · 기함 세로/가로 · 개념 컷 · recap 펼침 · 그림 문제)
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "2943";
const BASE = `http://localhost:${PORT}`;
mkdirSync("qa/shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", goalMin: 10 }),
  );
});
await page.goto(BASE);
await page.waitForTimeout(2200);
await page.screenshot({ path: "qa/shots/soc1-home.png" });

// ── L1 자유 탐색(freeNav) — 훅·개념 컷·recap 펼침·그림 문제 ──
await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("s1u1l1")) st.completeLesson("s1u1l1", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u1l1").lesson, () => {}));
});
await page.waitForTimeout(900);
await page.evaluate(() => document.querySelector(".screen.active .hs1-cities")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc1-hook.png" });
const fwd = async (n = 1) => {
  for (let i = 0; i < n; i += 1) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForTimeout(520);
  }
};
await fwd(3); // 훅 → latSun → hotspot → concept(지형 — 개념 컷)
await page.screenshot({ path: "qa/shots/soc1-concept-cut.png" });
await fwd(1); // recap
await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/soc1-recap-more.png", fullPage: false });
await fwd(2); // binSort → mcq(기후 지도 그림 문제)
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc1-figure-quiz.png" });

// 기함 레슨 마운트(세로) — L2 첫 스텝은 훅이라 freeNav로 랩(2번째 스텝)까지 전진
await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("s1u1l2")) st.completeLesson("s1u1l2", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u1l2").lesson, () => {}));
});
await page.waitForTimeout(800);
await fwd(1);
await page.screenshot({ path: "qa/shots/soc1-lab-vertical.png" });

// 가로 진입 + 안경 + 정착 2
await page.click(".screen.active .swapbtn");
await page.waitForTimeout(900);
await page.click(".wpl-lens");
await page.waitForTimeout(400);
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const stage = document.querySelector(".wpl-stage");
  const or = document.querySelector(".rot-overlay").getBoundingClientRect();
  const mapBox = document.querySelector(".wpl-map");
  const native = document.querySelector(".rot-inner").classList.contains("native");
  const L = parseFloat(mapBox.style.left), T = parseFloat(mapBox.style.top);
  const W = parseFloat(mapBox.style.width), H = parseFloat(mapBox.style.height);
  // 논리 좌표 → 화면 좌표(세로 회전 모드 역변환: mapPoint의 역함수)
  const scr = (lon, lat) => {
    const sx = ((lon + 180) / 360) * 1000, sy = ((90 - lat) / 180) * 500;
    const lx = L + (sx / 1000) * W, ly = T + ((sy - 14) / 400) * H;
    return native
      ? { x: or.left + lx, y: or.top + ly }
      : { x: or.right - ly, y: or.top + lx };
  };
  const pe = (type, x, y, target) =>
    target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: x, clientY: y, isPrimary: true }));
  const place = async (tokenId, lon, lat) => {
    const tok = document.querySelector(`.wpl-token[data-t="${tokenId}"]`);
    const tr = tok.getBoundingClientRect();
    pe("pointerdown", tr.left + tr.width / 2, tr.top + 10, tok);
    await sleep(60);
    const p = scr(lon, lat);
    pe("pointermove", p.x, p.y, stage);
    await sleep(60);
    pe("pointerup", p.x, p.y, stage);
    await sleep(240);
  };
  await place("oasis", 10, 23);
  await place("stilt", -62, -3);
});
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc1-lab-landscape.png" });

await browser.close();
console.log("wrote qa/shots/soc1-{home,lab-vertical,lab-landscape}.png");
