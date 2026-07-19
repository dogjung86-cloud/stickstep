// h1u3 주요 화면 눈검수 샷 — 홈 Ⅲ 지도·훅 3종·연표(전부 기원후)·드릴·종교 유산 hotspot·recap·실사 퀴즈
// + 신작 그림 5종 독립 렌더 시트(파라미터 변형 포함).
// PORT=<포트> node qa/shot-his3.mjs → qa/shots/his3-*.png (폰 폭 390)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5173";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "his", premium: true, reviewMode: false, goalMin: 10, streak: 1, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {} }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const W = (ms) => page.waitForTimeout(ms);
const shot = async (name, full = false) => {
  await W(300);
  await page.screenshot({ path: `qa/shots/his3-${name}.png`, fullPage: full });
  console.log("SHOT", name);
};
const clickCTA = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(480);
};
const openLesson = async (id) => {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(760);
};
const svgTap = (sel) => page.evaluate((s) => document.querySelector(`.screen.active ${s}`).dispatchEvent(new MouseEvent("click", { bubbles: true })), sel);

// 1) 홈 — Ⅲ 밴드·"믿음의 길" 데코
await page.evaluate(() => document.querySelectorAll(".unit-tab")[2]?.click());
await W(900);
await shot("home-band3");

// 2) 훅 lambskewer — 굽기 전/후
await openLesson("h1u3l1");
await shot("hook-lambskewer");
await page.evaluate(() => document.querySelector(".screen.active .hh3-sk-btn").click());
await W(1300);
await shot("hook-lambskewer-grilled");

// 3) 훅 chessmate — 메이트 뒤
await openLesson("h1u3l6");
await svgTap(".hh3-ch-king");
await W(1300);
await shot("hook-chessmate");

// 4) 훅 pepper — 갈기 뒤
await openLesson("h1u3l10");
await svgTap(".hh3-pp-mill");
await W(1300);
await shot("hook-pepper");

// 5) L1 위진 concept — 룽먼·북위 불상 실사
await openLesson("h1u3l1");
await page.evaluate(() => document.querySelector(".screen.active .hh3-sk-btn").click());
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // 훅 → concept1
await clickCTA(); // concept1 → concept2
await page.evaluate(() => document.querySelectorAll(".screen.active img[src*='photos/his']")[0]?.scrollIntoView({ block: "center" }));
await shot("concept-longmen");

// 6) L9 hotspot 종교 유산 지도 — 첫 스팟 카드 펼침
await openLesson("h1u3l9");
// comic 직행 — 7컷 통과
for (let i = 0; i < 7; i += 1) await clickCTA();
await clickCTA(); // concept 봉건
await clickCTA(); // concept 문화
await page.waitForSelector(".screen.active .hs-dot", { timeout: 9000 });
await shot("hotspot-map");
await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot")[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await W(900);
await page.evaluate(() => document.querySelector(".screen.active .hs-photo.show")?.scrollIntoView({ block: "center" }));
await shot("hotspot-longmen-card");
await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot")[3]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await W(900);
await shot("hotspot-cordoba-card");

// 7) L10 연표 — 초기(전부 기원후 축) + 완성
await openLesson("h1u3l10");
await svgTap(".hh3-pp-mill");
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // concept 십자군
await clickCTA(); // order로
// order 통과(정순 클릭)
await page.waitForSelector(".screen.active .ord-chip", { timeout: 9000 });
const orderItems = await page.evaluate(() => [...document.querySelectorAll(".screen.active .ord-pool .ord-chip")].length);
for (let i = 0; i < orderItems; i += 1) {
  await page.evaluate(async (idx) => {
    const { findLesson } = await import("/src/content/curriculum.ts");
    const step = findLesson("h1u3l10").lesson.steps.find((s) => s.type === "order");
    const t = document.createElement("span");
    t.innerHTML = step.items[idx];
    const wanted = (t.textContent ?? "").replace(/\s+/g, " ").trim();
    const chip = [...document.querySelectorAll(".screen.active .ord-pool .ord-chip")].find((c) => (c.textContent ?? "").replace(/\s+/g, " ").trim() === wanted);
    chip?.click();
  }, i);
  await W(180);
}
await clickCTA();
await page.waitForSelector(".sheet.open", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
await W(500);
await clickCTA(); // concept 도시
await clickCTA(); // concept 르네상스
await page.waitForSelector(".screen.active .htl-cell", { timeout: 9000 });
await shot("timeline-start");
const targets = await page.evaluate(async () => {
  const { TIMELINES, centuryOf } = await import("/src/ui/timelineKit.ts");
  return TIMELINES.h1u3.tasks.map((t) => (t.kind === "century" ? t.century : centuryOf(t.year)));
});
for (const c of targets) {
  await page.evaluate((cc) => document.querySelector(`.screen.active .htl-cell[data-c="${cc}"]`).click(), c);
  await W(1150);
}
await shot("timeline-done");

// 8) L10 recap — 자세히 펼침
await clickCTA();
await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card")[0]?.click());
await W(500);
await page.evaluate(() => document.querySelector(".screen.active .rc-card.open")?.scrollIntoView({ block: "start" }));
await shot("recap-more");

// 9) L8 드릴 — 첫 문제 화면
await openLesson("h1u3l8");
await svgTap(".hh3-js-shirt");
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA();
await clickCTA();
await clickCTA();
await page.waitForSelector(".screen.active .mdr-q", { timeout: 9000 });
await shot("drill");

// 10) 신작 그림 독립 렌더 시트(변형 포함)
await page.evaluate(async () => {
  const { worldReligionsFig, feudalFig, threeSixFig, eastAsiaFig, islamFlowFig } = await import("/src/ui/hisFigures.ts");
  const host = document.createElement("div");
  host.id = "figsheet";
  host.style.cssText = "position:fixed;inset:0;z-index:99999;background:#fff;overflow:auto;padding:12px;display:grid;gap:12px";
  host.innerHTML = [
    "<b>worldReligionsFig</b>", worldReligionsFig(),
    "<b>worldReligionsFig marks</b>", worldReligionsFig({ marks: true }),
    "<b>feudalFig</b>", feudalFig(),
    "<b>feudalFig hide3</b>", feudalFig({ hide: 3 }),
    "<b>threeSixFig</b>", threeSixFig(),
    "<b>threeSixFig hide1</b>", threeSixFig({ hide: 1 }),
    "<b>eastAsiaFig</b>", eastAsiaFig(),
    "<b>eastAsiaFig marks</b>", eastAsiaFig({ labels: false }),
    "<b>islamFlowFig</b>", islamFlowFig(),
    "<b>islamFlowFig hide2</b>", islamFlowFig({ hide: 2 }),
  ].join("");
  document.body.appendChild(host);
});
await W(400);
await shot("figs-sheet", true);
await page.evaluate(() => document.getElementById("figsheet")?.remove());

console.log("DONE");
await browser.close();
