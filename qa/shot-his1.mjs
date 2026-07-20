// 역사① Ⅰ(h1u1) 눈검수 샷 — shot-soc2 문법. PORT=<포트> node qa/shot-his1.mjs → qa/shots/his1-*.png
// 말풍선 실기기 가독성 판정용으로 뷰포트는 폰 폭 390. 샷 10장:
// hub·home·l1 만화 말풍선(1인/2인 컷)·l3 사료 분류(실사 칩)·l4 연표(임무/완료)·드릴·recap 펼침·그림 문제.
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
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/his1-${name}.png` });
  console.log("SHOT", name);
};
const clickCTA = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(520);
};

// 1) 홈 역사 지도 → 2) 과목 허브
await shot("home");
// 허브 진입 = 하단 과목 탭(2026-07-20 — 구 앱바 subj-box 폐기)
await page.evaluate(() => [...document.querySelectorAll(".screen.active .gnav-item")].find((b) => b.textContent.includes("과목"))?.click());
await page.waitForSelector(".screen.active .subj-card", { timeout: 9000 });
await W(400);
await shot("hub");
await page.evaluate(() => document.querySelector(".screen.active .subj-card.his").click());
await W(900);

const openLesson = async (id) => {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(760);
};

// ── L1: 훅 통과 → 만화 말풍선 컷 2장 + recap 펼침 ────────────
await openLesson("h1u1l1");
await page.evaluate(() => document.querySelector(".screen.active .hh1-save").click());
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // 만화 진입 — 컷1(도서관)
await page.waitForSelector(".screen.active .comic-art", { timeout: 9000 });
await clickCTA(); // 컷2(랑케 말풍선 1개)
await W(400);
await page.evaluate(() => document.querySelector(".screen.active .comic-panel")?.scrollIntoView({ block: "start" }));
await W(200);
await shot("l1-bubble-one");
await clickCTA(); // 컷3
await clickCTA(); // 컷4
await clickCTA(); // 컷5
await clickCTA(); // 컷6(사관 — 말풍선 2개)
await W(400);
await page.evaluate(() => document.querySelector(".screen.active .comic-panel")?.scrollIntoView({ block: "start" }));
await W(200);
await shot("l1-bubble-two");

// ── L3: 사료 개념(실사) + binSort 실사 칩 ────────────────────
await openLesson("h1u1l3");
await page.evaluate(() => document.querySelector(".screen.active .hh1-tc-boxg").dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // concept(사료 3종 실사)
await W(700);
await shot("l3-concept-photos");
await clickCTA(); // binSort
await page.waitForSelector(".screen.active .bin-tray .bin-chip", { timeout: 9000 });
await W(500);
await shot("l3-binsort");

// ── L4: 연표 랩(임무·완료) + 드릴 + 그림 문제 ────────────────
await openLesson("h1u1l4");
await page.evaluate(() => document.querySelector(".screen.active .hh1-ca-small").dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // concept 서기·세기
await clickCTA(); // timelineLab
await page.waitForSelector(".screen.active .htl-cell", { timeout: 9000 });
await W(600);
await shot("l4-timeline-quest");
for (const c of [3, -2, 4, -2]) {
  await page.evaluate((cc) => document.querySelector(`.screen.active .htl-cell[data-c="${cc}"]`).click(), c);
  await W(1150);
}
await W(400);
await shot("l4-timeline-done");
await clickCTA(); // concept 연호
await clickCTA(); // 드릴
await page.waitForSelector(".screen.active .mdr-q", { timeout: 9000 });
await W(400);
await shot("l4-drill");
// 드릴 6문 전답 → recap → 그림 문제(연표 띠)
const np = async (l) => {
  await page.evaluate((label) => {
    const k = [...document.querySelectorAll(".screen.active .mnp-k")].find((x) => x.textContent.trim() === label && !x.disabled);
    k?.click();
  }, l);
  await W(70);
};
for (const a of ["19", "4", "20", "3", "395", "21"]) {
  for (const ch of a) await np(ch);
  await clickCTA();
  await W(1050);
}
await clickCTA(); // 요약 → recap
await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card")[2]?.click());
await W(500);
await page.evaluate(() => document.querySelector(".screen.active .rc-card.open")?.scrollIntoView({ block: "start" }));
await W(300);
await shot("l4-recap-more");
await clickCTA(); // 문제 1(연표 띠 그림)
await page.waitForSelector(".screen.active .q-figure, .screen.active .opts", { timeout: 9000 });
await W(500);
await shot("l4-quiz-strip");

// ── L5: 만화(밀면 — 검증 컷 말풍선 2개) ──────────────────────
await openLesson("h1u1l5");
await page.evaluate(() => document.querySelector(".screen.active .hh1-nd-frameg").dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
await W(400);
await clickCTA(); // 만화 컷1
await page.waitForSelector(".screen.active .comic-art", { timeout: 9000 });
for (let i = 0; i < 4; i += 1) await clickCTA(); // 컷5(검증 — 말풍선 2)
await W(400);
await page.evaluate(() => document.querySelector(".screen.active .comic-panel")?.scrollIntoView({ block: "start" }));
await W(200);
await shot("l5-bubble-debate");

console.log("DONE 10 shots");
await browser.close();
