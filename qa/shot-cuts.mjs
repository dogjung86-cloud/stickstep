// 컷이 concept 카드 안에서 제대로 렌더되는지 스크린샷 증거 — 각 단원 대표 레슨의 컷 concept 스텝.
// PORT=5199 node qa/shot-cuts.mjs  → qa/shots/cut-*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
mkdirSync("qa/shots", { recursive: true });

const PORT = process.env.PORT || "5199";
const BASE = `http://localhost:${PORT}/`;
// 레슨 id → 그 안에서 컷이 든 concept의 title 일부(그 스텝까지 이동)
const TARGETS = [
  { id: "u2l5", titleHas: "무리 짓기", tag: "bio2-classify" },
  { id: "g2u1l6", titleHas: "순물질과 혼합물", tag: "chem-purity" },
  { id: "g2u2l2", titleHas: "조암 광물", tag: "geo-mineral" },
  { id: "g2u4l2", titleHas: "화학식", tag: "atom-formula" },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: "networkidle" });

for (const T of TARGETS) {
  await page.evaluate(async (id) => {
    const st = await import("/src/core/store.ts");
    if (!st.isDone(id)) st.completeLesson(id, 1, 0);
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(id).lesson, () => {}));
  }, T.id);
  await page.waitForTimeout(700);

  // 목표 concept 스텝까지 앞으로 이동(최대 20스텝)
  let shot = false;
  for (let i = 0; i < 20; i++) {
    const title = await page.evaluate(() => {
      const a = document.querySelector(".screen.active");
      return a ? (a.textContent || "") : "";
    });
    const hasImg = await page.evaluate((th) => {
      const a = document.querySelector(".screen.active");
      if (!a || !(a.textContent || "").includes(th)) return false;
      const img = a.querySelector('img[src*="/cuts/"]');
      return !!(img && img.complete && img.naturalWidth > 0);
    }, T.titleHas);
    if (hasImg) {
      await page.screenshot({ path: `qa/shots/cut-${T.tag}.png` });
      console.log(`SHOT ${T.tag} (${T.id}) — 컷 concept 캡처`);
      shot = true;
      break;
    }
    const fwd = await page.$(".screen.active .xbtn.fwd");
    if (fwd) await fwd.click().catch(() => {});
    await page.waitForTimeout(450);
  }
  if (!shot) console.log(`MISS ${T.tag} (${T.id}) — 컷 concept 못 찾음`);
}

await browser.close();
