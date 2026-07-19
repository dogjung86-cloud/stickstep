// h1u4 주요 화면 눈검수 샷 — 홈 Ⅳ 지도(교역의 길 데코)·훅 4종·청명상하도 hotspot(스팟 정렬)·
// 신항로 hotspot(실사 카드)·연표(축 900)·드릴·recap·유물 concept + 신작 그림 7종 독립 렌더 시트.
// PORT=<포트> node qa/shot-his4.mjs → qa/shots/his4-*.png (폰 폭 390)
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
  await page.screenshot({ path: `qa/shots/his4-${name}.png`, fullPage: full });
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
const passHook = async (sel) => {
  await svgTap(sel);
  await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
  await W(400);
  await clickCTA();
};

// 1) 홈 — Ⅳ 밴드·"교역의 길" 데코(나침반→지폐→범선→향신료→왕관)
await page.evaluate(() => document.querySelectorAll(".unit-tab")[3]?.click());
await W(900);
await shot("home-band4");

// 2) 훅 4종 — 조작 후 상태
await openLesson("h1u4l1");
await shot("hook-penmotto");
await svgTap(".hh4-mt-frame");
await W(1300);
await shot("hook-penmotto-zoom");

await openLesson("h1u4l3");
await svgTap(".hh4-gr-tent");
await W(1300);
await shot("hook-gercamp-lit");

await openLesson("h1u4l5");
await svgTap(".hh4-km-bowl");
await W(1300);
await shot("hook-kimchi-zoom");

await openLesson("h1u4l9");
await svgTap(".hh4-fr-tray");
await W(1300);
await shot("hook-frychoco-origin");

// 3) L2 hotspot 청명상하도 — 스팟 정렬 눈검수(다섯 점이 다리·배·상점·수레·가게 위인지)
await openLesson("h1u4l2");
await passHook(".hh4-bn-wallet");
await clickCTA(); // c1 → c2
await clickCTA(); // c2 → hotspot
await page.waitForSelector(".screen.active .hs-dot", { timeout: 9000 });
await shot("hotspot-qingming");
await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot")[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await W(900);
await shot("hotspot-qingming-spot1");

// 4) L9 hotspot 신항로 — 지도 + 마추픽추 실사 카드
await openLesson("h1u4l9");
await passHook(".hh4-fr-tray");
await clickCTA(); // c1 → hotspot
await page.waitForSelector(".screen.active .hs-dot", { timeout: 9000 });
await shot("hotspot-searoutes");
await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot")[2]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await W(900);
await page.evaluate(() => document.querySelector(".screen.active .hs-photo.show")?.scrollIntoView({ block: "center" }));
await shot("hotspot-machu-card");

// 5) L7 concept — 타지마할 실사
await openLesson("h1u4l7");
await passHook(".hh4-tj-photo");
await clickCTA(); // c1 → c2
await clickCTA(); // c2 → c3(타지마할·무굴 회화)
await page.evaluate(() => document.querySelectorAll(".screen.active img[src*='photos/his']")[0]?.scrollIntoView({ block: "center" }));
await shot("concept-tajmahal");

// 6) L6 — 막부 구조도 concept + 드릴
await openLesson("h1u4l6");
await passHook(".hh4-sg-tv");
await page.evaluate(() => document.querySelectorAll(".screen.active svg")[1]?.scrollIntoView({ block: "center" }));
await shot("concept-bakufu");
await clickCTA(); // c1 → c2
await clickCTA(); // c2 → c3
await clickCTA(); // c3 → order
await page.waitForSelector(".screen.active .ord-chip", { timeout: 9000 });
const orderItems = await page.evaluate(() => [...document.querySelectorAll(".screen.active .ord-pool .ord-chip")].length);
for (let i = 0; i < orderItems; i += 1) {
  await page.evaluate(async (idx) => {
    const { findLesson } = await import("/src/content/curriculum.ts");
    const step = findLesson("h1u4l6").lesson.steps.find((s) => s.type === "order");
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
await page.waitForSelector(".screen.active .mdr-q", { timeout: 9000 });
await shot("drill");

// 7) L10 연표 — 초기(축 900) + 완성
await openLesson("h1u4l10");
await passHook(".hh4-as-tv");
await clickCTA(); // c1 → c2
await clickCTA(); // c2 → c3
await clickCTA(); // c3 → timelineLab
await page.waitForSelector(".screen.active .htl-cell", { timeout: 9000 });
await shot("timeline-start");
const targets = await page.evaluate(async () => {
  const { TIMELINES, centuryOf } = await import("/src/ui/timelineKit.ts");
  return TIMELINES.h1u4.tasks.map((t) => (t.kind === "century" ? t.century : centuryOf(t.year)));
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

// 9) 신작 그림 독립 렌더 시트(변형 포함)
await page.evaluate(async () => {
  const { songPressFig, yuanClassFig, bakufuFig, silverFlowFig, searoutesFig, triangleTradeFig, centuryStripFig } = await import("/src/ui/hisFigures.ts");
  const host = document.createElement("div");
  host.id = "figsheet";
  host.style.cssText = "position:fixed;inset:0;z-index:99999;background:#fff;overflow:auto;padding:12px;display:grid;gap:12px";
  // svg는 width/height 미지정이라 기본 300x150으로 잘린다 — 폭 100%·높이 자동 강제(전 그림 온전 렌더)
  host.innerHTML = "<style>#figsheet svg{width:100%;height:auto;display:block}</style>" + [
    "<b>songPressFig</b>", songPressFig(),
    "<b>songPressFig hide yo</b>", songPressFig({ hide: "yo" }),
    "<b>yuanClassFig</b>", yuanClassFig(),
    "<b>yuanClassFig hide1</b>", yuanClassFig({ hide: 1 }),
    "<b>bakufuFig</b>", bakufuFig(),
    "<b>bakufuFig hide0</b>", bakufuFig({ hide: 0 }),
    "<b>silverFlowFig</b>", silverFlowFig(),
    "<b>searoutesFig</b>", searoutesFig(),
    "<b>searoutesFig marks</b>", searoutesFig({ marks: true }),
    "<b>triangleTradeFig</b>", triangleTradeFig(),
    "<b>triangleTradeFig hide1</b>", triangleTradeFig({ hide: 1 }),
    "<b>centuryStripFig 10~17 mark15</b>", centuryStripFig({ start: 10, end: 17, mark: 15 }),
  ].join("");
  document.body.appendChild(host);
});
await W(400);
await shot("figs-sheet", true);
await page.evaluate(() => document.getElementById("figsheet")?.remove());

console.log("DONE");
await browser.close();
