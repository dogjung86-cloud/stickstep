// 중1 Ⅱ v3 — 눈검수 스크린샷(주요 화면 12장 → qa/shots/u2v3-*.png).
// 헤드리스 실크로뮴이 확정 경로(프리뷰 하니스 캡처 프리즈 무관).
//   PORT=5411 node qa/shot-u2v3.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
// 폰트·무한 애니 프리즈 예방(관행): 캡처 전 애니메이션 취소
const still = () => page.evaluate(() => document.getAnimations().forEach((a) => { try { a.cancel(); } catch { /* */ } }));
const W = (ms) => page.waitForTimeout(ms);

const open = (i) =>
  page.evaluate(async (idx) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { UNIT2_V3 } = await import("/src/content/unit2v3.ts");
    nav.go(createLessonPlayer(UNIT2_V3.lessons[idx], { onExit: () => {}, onComplete: () => {} }));
  }, i);
const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(460); };
const shot = async (name) => { await still(); await page.screenshot({ path: `qa/shots/u2v3-${name}.png`, fullPage: false }); console.log("SHOT", name); };
const scrollTop = () => page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));

// 1) L1 만화 첫 컷 · 줌 사다리(×40)
await open(0); await W(800);
await shot("l1-comic");
for (let i = 0; i < 7; i++) await cta();
await page.evaluate(() => [...document.querySelectorAll(".screen.active .zrl-mag")][1]?.click()); await W(500);
await page.evaluate(() => [...document.querySelectorAll(".screen.active .zrl-mag")][2]?.click()); await W(600);
await shot("l1-zoom40");
// 2) L1 recap 카드 more 펼침
await page.evaluate(() => [...document.querySelectorAll(".screen.active .zrl-mag")][3]?.click()); await W(600);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .zrl-q .hook-choice")].find((b) => b.textContent.includes("머리카락"))?.click(); }); await W(500);
await cta(); await cta(); // concept → recap
await page.evaluate(() => document.querySelectorAll(".screen.active .recap-card, .screen.active .rc-card")[0]?.click()); await W(450);
await shot("l1-recap-more");

// 3) L2 빵 공장 훅 · 식물세포 핫스팟
await open(1); await W(700);
await shot("l2-hook-factory");
await page.evaluate(() => { document.querySelectorAll(".screen.active .hb4-bf-room").forEach((r) => r.dispatchEvent(new MouseEvent("click", { bubbles: true }))); }); await W(900);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("부품들이"))?.click(); }); await W(400);
await cta(); await cta(); // concept1 → 동물 핫스팟
await page.evaluate(() => { document.querySelectorAll(".screen.active button.hs-dot").forEach((d) => d.click()); }); await W(700);
await cta(); await cta(); // concept2 → 식물 핫스팟
await scrollTop(); await W(200);
await shot("l2-hotspot-plant");

// 4) L3 표본 무대 · 관찰(검정말)
await open(2); await W(700);
await page.evaluate(() => document.querySelector(".screen.active .hb4-wl")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(2400);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("현미경"))?.click(); }); await W(400);
await cta(); await W(300);
await shot("l3-slide-desk");
const tool = (i) => page.evaluate((k) => [...document.querySelectorAll(".screen.active .smk-tool")][k]?.click(), i);
await tool(0); await W(350); await tool(1); await W(450);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .smk-ask .hook-choice")].find((b) => b.textContent.includes("물들인다"))?.click(); }); await W(800);
await tool(2); await W(450);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .smk-ask .hook-choice")].find((b) => b.textContent.includes("비스듬히"))?.click(); }); await W(1000);
await tool(3); await W(1700);
await page.evaluate(() => { const f = document.querySelector(".screen.active .smk-focus"); f.value = "68"; f.dispatchEvent(new Event("input", { bubbles: true })); }); await W(800);
await page.evaluate(() => [...document.querySelectorAll(".screen.active .smk-seg")][1]?.click()); await W(400);
await page.evaluate(() => { const f = document.querySelector(".screen.active .smk-focus"); f.value = "38"; f.dispatchEvent(new Event("input", { bubbles: true })); }); await W(900);
await scrollTop(); await W(200);
await shot("l3-observe-elodea");

// 5) L4 채용 무대(신호 미션 성공 연출)
await open(3); await W(700);
await page.evaluate(() => document.querySelector(".screen.active .hb4-bd")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(2400);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("원반 모양의 세포"))?.click(); }); await W(400);
await cta(); await W(300);
await page.evaluate(() => document.querySelector('.screen.active .sjb-card[data-k="nerve"]')?.click()); await W(1300);
await scrollTop(); await W(200);
await shot("l4-mission-signal");

// 6) L5 계단(동물 코스 완성 직후)
await open(4); await W(700);
await page.evaluate(() => document.querySelector(".screen.active .hb4-bh")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(500);
await page.evaluate(() => document.querySelector(".screen.active .hb4-bh")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(1600);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("비슷한 세포끼리"))?.click(); }); await W(400);
await cta(); await W(300);
for (const n of ["근육세포", "근육조직", "심장", "순환계", "사람"]) {
  await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .lsk-card")].find((c) => c.textContent.includes(t))?.click(); }, n);
  await W(300);
}
await scrollTop(); await W(300);
await shot("l5-ladder-animal");

// 7) L6 훅(독도) · 렌즈(변이 확대)
await open(5); await W(700);
await shot("l6-hook-dokdo");
await page.evaluate(() => { document.querySelectorAll(".screen.active .dk-spot").forEach((g) => g.dispatchEvent(new MouseEvent("click", { bubbles: true }))); }); await W(700);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("1,000종"))?.click(); }); await W(400);
await cta(); await W(300);
const lens = (i) => page.evaluate((k) => [...document.querySelectorAll(".screen.active .ecs-lens")][k]?.click(), i);
const region = (i) => page.evaluate((k) => [...document.querySelectorAll(".screen.active .ecs-region")][k]?.click(), i);
await lens(0); await W(400); await region(1); await W(1100);
await lens(1); await W(400); await region(1); await W(1100);
await lens(2); await W(800);
await scrollTop(); await W(200);
await shot("l6-lens-vary");

// 8) L7 다윈 만화 컷5(두 섬) · 두 섬 랩 3세대
await open(6); await W(700);
for (let i = 0; i < 5; i++) await cta();
await shot("l7-comic-islands");
await cta(); await cta(); await cta(); // 컷6·7 → concept → 랩
await W(900);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .bkl-ask .hook-choice")].find((b) => b.textContent.includes("두꺼운 부리"))?.click(); }); await W(600);
for (let g = 0; g < 3; g++) { await page.evaluate(() => document.querySelector(".screen.active .bkl-gen")?.click()); await W(450); }
await scrollTop(); await W(200);
await shot("l7-islands-gen3");

// 9) L8 기준 스위치(마지막 스위치 결과)
await open(7); await W(700);
await page.evaluate(() => [...document.querySelectorAll(".screen.active .ms-shelf")][0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(600);
await page.evaluate(() => [...document.querySelectorAll(".screen.active .ms-shelf")][1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(1800);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("고유의 특징"))?.click(); }); await W(400);
await cta(); await W(300);
for (let i = 0; i < 3; i++) { await page.evaluate((k) => [...document.querySelectorAll(".screen.active .grl-rule")][k]?.click(), i); await W(1250); }
await scrollTop(); await W(200);
await shot("l8-rule-milk");

// 10) L8 분류체계 concept(사다리 그림)
await cta(); await W(300);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .grl-ask .hook-choice")].find((b) => b.textContent.includes("고유한 특징"))?.click(); }); await W(500);
await cta(); await cta(); await W(300); // concept1 → concept2
await page.evaluate(() => { const figs = document.querySelectorAll(".screen.active .c-figure, .screen.active figure"); figs[1]?.scrollIntoView({ block: "center" }); }); await W(300);
await shot("l8-rank-ladder");

// 11) L9 검색표(방 3곳 채운 시점)
await open(8); await W(700);
await page.evaluate(() => document.querySelector(".screen.active .hb4-mr")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(3100);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("광합성"))?.click(); }); await W(400);
await cta(); await W(300);
const yes9 = () => page.evaluate(() => document.querySelector(".screen.active .kgt-ans.yes")?.click());
const no9 = () => page.evaluate(() => document.querySelector(".screen.active .kgt-ans.no")?.click());
for (const path of [["no"], ["yes", "yes"], ["yes", "no", "yes"]]) {
  for (const s of path) { await (s === "yes" ? yes9() : no9()); await W(320); }
  await W(1550);
}
await scrollTop(); await W(200);
await shot("l9-gates-3rooms");

// 12) L10 먹이 그물(개구리 빼기 직후)
await open(9); await W(700);
await page.evaluate(() => document.querySelector(".screen.active .bg-switch")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(3100);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("꽃가루"))?.click(); }); await W(400);
await cta(); await W(300);
await page.evaluate(() => [...document.querySelectorAll(".screen.active .wdp-web")][0]?.querySelector('[data-n="hawk"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(450);
await page.evaluate(() => [...document.querySelectorAll(".screen.active .wdp-web")][1]?.querySelector('[data-n="hawk"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))); await W(1300);
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .wdp-ask .hook-choice")].find((b) => b.textContent.includes("유일한 먹이"))?.click(); }); await W(600);
await page.evaluate(() => document.querySelector(".screen.active .wdp-drop")?.click()); await W(2700);
await scrollTop(); await W(200);
await shot("l10-web-dropped");

console.log("DONE 12 shots → qa/shots/u2v3-*.png");
await browser.close();
