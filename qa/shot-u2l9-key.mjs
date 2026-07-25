// L9 kingdomKeyLab — 생물 카드가 무대(검색표) 위로 올라온 뒤, 카드·검색표·예/아니요가
// 스크롤 없이 한 화면에 들어오는지 실측 + 눈검수 샷.
// PORT=5211 node qa/shot-u2l9-key.mjs → qa/shots/u2k-*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
const VW = Number(process.env.VW || 420);
const VH = Number(process.env.VH || 860);
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    onboarded: true, premium: true, reviewMode: true, lessons: {}, totalXp: 0,
  }));
});
await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("u2l9")) st.completeLesson("u2l9", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("u2l9").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(800);
// 훅 → concept → 랩
for (let i = 0; i < 2; i++) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(500);
}
await page.waitForTimeout(500);

const measure = async (tag) => {
  const m = await page.evaluate(() => {
    const box = (sel) => {
      const r = document.querySelector(".screen.active " + sel)?.getBoundingClientRect();
      return r ? { top: Math.round(r.top), bottom: Math.round(r.bottom) } : null;
    };
    const c = document.querySelector(".screen.active .scroll");
    return {
      card: box(".kkl-card"),
      stage: box(".stage"),
      yn: box('.kkl-yn') || box("[data-kkl-act='next']"),
      ask: box('.kkl-ask'),
      vh: innerHeight,
      scrollNeeded: c ? Math.max(0, c.scrollHeight - c.clientHeight) : -1,
    };
  });
  const fits = (b) => b && b.top >= 0 && b.bottom <= m.vh;
  console.log(tag, JSON.stringify(m), "| 카드·무대·버튼 동시표시:", fits(m.card) && fits(m.stage) && fits(m.yn));
  return m;
};

await measure("초기");
await page.screenshot({ path: `qa/shots/u2k-${VW}-init.png`, timeout: 15000 });

// 첫 갈림길에 답해 본다(대장균 = 핵막 '아니요')
await page.evaluate(() => document.querySelector('.screen.active [data-kkl-ans="false"]')?.click());
await page.waitForTimeout(900);
await measure("1문 답한 뒤");
await page.screenshot({ path: `qa/shots/u2k-${VW}-answered.png`, timeout: 15000 });

await browser.close();
console.log("DONE");
