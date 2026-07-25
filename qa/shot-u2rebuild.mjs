// 중1 Ⅱ 재제작(10레슨) 눈검수 샷 — 플레이북 §7 증거 + 핫스팟 정렬 확인.
// 구작용 qa/shot-u2.mjs는 6레슨 구조 기준이라 그대로 두고 별도 파일로 둔다.
// PORT=5211 node qa/shot-u2rebuild.mjs  → qa/shots/u2r-*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
const BASE = `http://localhost:${PORT}`;
mkdirSync("qa/shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });

// 주의: @vite/client를 스텁으로 막으면 updateStyle이 죽어 dev CSS가 통째로 사라진다
// (플레이북 사고 ③의 변형 — 실제로 무스타일 샷이 나왔다). 동시 편집이 없을 때는 스텁하지 않는다.

await page.addInitScript(() => {
  localStorage.setItem("bs.state", JSON.stringify({
    onboarded: true, premium: true, reviewMode: true, lessons: {}, totalXp: 0,
  }));
});
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);

const mount = async (id) => {
  await page.evaluate(async (lid) => {
    const st = await import("/src/core/store.ts");
    if (!st.isDone(lid)) st.completeLesson(lid, 1, 0);
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const f = findLesson(lid);
    nav.go(createLessonPlayer(f.lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await page.waitForTimeout(750);
};
const fwd = async (n) => {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForTimeout(430);
  }
};
// rAF가 도는 캔버스 랩에서는 fullPage 캡처가 안정화를 기다리다 타임아웃 난다 → 뷰포트 샷 + 명시 타임아웃.
const shot = async (name, full = false) => {
  await page.screenshot({ path: `qa/shots/u2r-${name}.png`, fullPage: full, timeout: 15000, animations: "disabled" });
  console.log("SHOT", name);
};

// ① L1 만화 도입
await mount("u2l1");
await shot("l1-comic", true);

// ② L2 비교 랩 — 동물·식물 두 세포의 점이 각 구조 위에 정확히 앉았는지(사고 15) + 분류 국면.
await mount("u2l2");
await fwd(2);
await page.waitForTimeout(400);
await shot("l2-compare-explore", true);
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const d of [...document.querySelectorAll(".screen.active .cmp-dot")]) { d.click(); await sleep(90); }
  await sleep(400);
  const q = (s) => document.querySelector(".screen.active " + s);
  const map = { membrane: "both", nucleus: "both", mito: "both", chloro: "plantOnly", wall: "plantOnly" };
  for (const [k, bin] of Object.entries(map)) {
    q(`[data-cmp-chip="${k}"]`)?.click(); await sleep(120);
    q(`[data-cmp-bin="${bin}"]`)?.click(); await sleep(220);
  }
});
await page.waitForTimeout(600);
await shot("l2-compare-sorted", true);

// ③④ L7 기함 랩
await mount("u2l7");
await fwd(2);
await shot("l7-lab-start");
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
  for (let cy = 0; cy < 3; cy++) for (let cx = 0; cx < 8; cx++) tap(40 + ((cx + 0.5) / 8) * 280, 66 + ((cy + 0.6) / 3) * 120);
  await sleep(350);
  document.querySelector('.screen.active [data-fil-act="split"]')?.click();
  await sleep(1300);
  document.querySelector(".screen.active .hook-choices .hook-choice")?.click();
  await sleep(1000);
  for (let i = 0; i < 6; i++) { document.querySelector('.screen.active [data-fil-act="gen"]')?.click(); await sleep(300); }
});
await page.waitForTimeout(700);
await shot("l7-lab-generations");
await page.evaluate(() => document.querySelector('.screen.active [data-fil-act="meet"]')?.click());
await page.waitForTimeout(1900);
await shot("l7-lab-species");

// ⑤ recap 자세히 펼침
await fwd(2);
await page.evaluate(() => {
  document.querySelectorAll(".screen.active .rc-card, .screen.active .rc-more, .screen.active [class*='more']").forEach((c) => {
    if (c.tagName === "BUTTON") c.click();
  });
  const first = document.querySelector(".screen.active .rc-card button, .screen.active .rc-more-btn");
  first && first.click();
});
await page.waitForTimeout(600);
await shot("l7-recap");

// ⑥ 그림 문제 — L9 검색표(가림 인자가 정답을 가렸는지)
await mount("u2l9");
await fwd(6);
await shot("l9-figure-quiz");

// ⑦ L8 분류체계 그림 문제
await mount("u2l8");
await fwd(8);
await shot("l8-figure-quiz");

await browser.close();
console.log("DONE");
