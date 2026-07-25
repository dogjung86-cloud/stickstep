// L9 kingdomKeyLab — 생물 8종을 끝까지 분류해 마지막 5계 비교표를 캡처한다.
// PORT=5211 node qa/shot-u2l9-table.mjs → qa/shots/u2t-table.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
const VW = Number(process.env.VW || 420);
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: VW, height: 900 }, deviceScaleFactor: 2 });
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
for (let i = 0; i < 2; i++) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(500);
}

// 카드 이름 → 계 → 갈림길 정답 경로(①핵막 ②나머지 무리 ③광합성 ④세포벽·운동)
const KING_OF = { "대장균": "원핵", "소나무": "식물", "아메바": "원생", "송이버섯": "균",
                  "효모": "균", "다시마": "원생", "고사리": "식물", "박새": "동물" };
const PATH = { 원핵: [false], 원생: [true, true], 식물: [true, false, true],
               균: [true, false, false, false], 동물: [true, false, false, true] };
for (let guard = 0; guard < 120; guard++) {
  const st = await page.evaluate(() => ({
    name: document.querySelector(".screen.active .kkl-name")?.textContent?.trim() || "",
    qNo: Number((document.querySelector(".screen.active .kkl-q b")?.textContent || "0").trim()),
    hasAns: !!document.querySelector('.screen.active [data-kkl-ans="true"]'),
    hasNext: !!document.querySelector('.screen.active [data-kkl-act="next"]'),
    hasTable: !!document.querySelector(".screen.active .kkl-tbl"),
  }));
  if (st.hasTable) break;
  if (st.hasNext) {
    await page.evaluate(() => document.querySelector('.screen.active [data-kkl-act="next"]')?.click());
  } else if (st.hasAns && st.qNo > 0) {
    const king = KING_OF[st.name];
    const ans = PATH[king] ? PATH[king][st.qNo - 1] : true;
    await page.evaluate((v) => document.querySelector(`.screen.active [data-kkl-ans="${v}"]`)?.click(), ans);
  } else break;
  await page.waitForTimeout(300);
}

const ok = await page.evaluate(() => !!document.querySelector(".screen.active .kkl-tbl"));
console.log("표 도달:", ok);
if (ok) {
  await page.evaluate(() => document.querySelector(".screen.active .kkl-sum")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(400);
}
await page.screenshot({ path: `qa/shots/u2t-table-${VW}.png`, timeout: 15000 });
console.log("SHOT lab", VW);

// recap 스텝으로 이동해 같은 표가 한 번 더 나오는지 확인
for (let i = 0; i < 6; i++) {
  const atRecap = await page.evaluate(() => !!document.querySelector(".screen.active .rc-cards"));
  if (atRecap) break;
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(420);
}
const inRecap = await page.evaluate(() => {
  const t = document.querySelector(".screen.active .c-callout .kkl-tbl");
  if (t) t.scrollIntoView({ block: "center" });
  return !!t;
});
console.log("recap 표:", inRecap);
await page.waitForTimeout(400);
await page.screenshot({ path: `qa/shots/u2t-recap-${VW}.png`, timeout: 15000 });
await browser.close();
