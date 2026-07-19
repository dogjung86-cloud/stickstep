// shot-soc7.mjs — 사회 Ⅶ 눈검수 샷(qa/shots/soc7-*.png). PORT=<포트> node qa/shot-soc7.mjs
// 샷별 합격 기준(눈검수 체크리스트 — "처음 보는 중1 학생" 시점):
//   01 home       : Ⅶ 밴드가 플럼색, 데코 5종(요람→책가방→이름표→덩굴→악수)이 노드·서로와 겹치지 않음
//   02 l1-hook    : 쌍둥이 성장 장면 — 두 인물의 인사·소품 대비가 읽히고 글자 잘림 0
//   03 l1-judge   : 판정소 첫 카드 — **사례 텍스트 잘림 0**, 선반 이름·힌트 가독, 진행 필 표기
//   04 l2-lifepath: 정거장 4·띠·카드 트레이 — 라벨 겹침 0, 스틱맨 실루엣 시기 구분(키 차이) 읽힘
//   05 l4-comic0  : 만화 컷1 — **말풍선이 화자 머리 위**·꼬리가 정수리를 향함·2줄 이내 가독
//   06 l4-comic2  : 만화 컷3(GAG) — 말풍선 2개가 각자 화자 위, 자빠지는 연기 가림 0
//   07 l5-dilemma : 갈래 선택 결과 — 얻은 것(초록)·잃은 것(잿빛) 대비, 항목 텍스트 잘림 0
//   08 l6-judge   : 차이·차별 판정소 — 함정 카드 문구 가독, 선반 색(파랑/빨강) 구분
//   09 l7-recap   : recap 첫 카드 펼침 — rm-h 소제목 렌더, more 본문 가독
//   10 l4-figure  : statusFig(letters) 그림 문제 — ㉠~㉣ 필 가독, 색 범례 잘림 0
//   전 샷 공통: **성역할·집단 고정관념 무(無)** — 스틱맨 성별 표지 없음, 직업·가사 클리셰 없음.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5217";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);

await page.addInitScript(() =>
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
      onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10,
      lessons: { s1u7l1: { done: true }, s1u7l2: { done: true }, s1u7l4: { done: true }, s1u7l5: { done: true }, s1u7l6: { done: true }, s1u7l7: { done: true } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const W = (ms) => page.waitForTimeout(ms);
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/${name}.png`, fullPage: false });
  console.log(`SHOT ${name}`);
};
const openLesson = async (id) => {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(900);
};
const fwd = async (n = 1) => {
  for (let i = 0; i < n; i += 1) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await W(680);
  }
};

// 01 홈 — Ⅶ 탭
await page.evaluate(() => document.querySelectorAll(".unit-tab")[6]?.click());
await W(900);
await shot("soc7-01-home");

// 02 l1 훅(성장 후) · 03 l1 판정소
await openLesson("s1u7l1");
await page.evaluate(() => document.querySelector(".screen.active .hs7-btn")?.click());
await W(1100);
await shot("soc7-02-l1-hook");
await fwd(1);
await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .jdg-stage")?.scrollIntoView({ block: "center" }));
await W(400);
await shot("soc7-03-l1-judge");

// 04 l2 lifePath — 정배치 2 + 매체 띠 점등 상태
await openLesson("s1u7l2");
await fwd(2);
await page.waitForSelector(".screen.active .lfp-card", { timeout: 9000 });
await page.evaluate(() => {
  const tap = (sel) => document.querySelector(sel)?.click();
  tap('.screen.active .lfp-card[data-a="family"]');
  tap('.screen.active .lfp-slot[data-slot="baby"]');
});
await W(400);
await page.evaluate(() => {
  const tap = (sel) => document.querySelector(sel)?.click();
  tap('.screen.active .lfp-card[data-a="media"]');
  tap(".screen.active .lfp-band");
});
await W(500);
await page.evaluate(() => document.querySelector(".screen.active .lfp-stage")?.scrollIntoView({ block: "center" }));
await W(300);
await shot("soc7-04-l2-lifepath");

// 05·06 l4 comic 컷1·컷3(말풍선 정렬 판정)
await openLesson("s1u7l4");
await fwd(2);
await page.waitForSelector(".screen.active .comic-panel", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .comic-panel")?.scrollIntoView({ block: "center" }));
await W(500);
await shot("soc7-05-l4-comic0");
await page.evaluate(() => document.querySelector(".screen.active button.cta")?.click());
await W(600);
await page.evaluate(() => document.querySelector(".screen.active button.cta")?.click());
await W(700);
await shot("soc7-06-l4-comic2");

// 10 l4 그림 문제(statusFig letters) — comic 뒤 concept·binSort 지나 그림 mcq(7번째 스텝)
await fwd(4);
await page.waitForSelector(".screen.active .q-figure, .screen.active .opts", { timeout: 9000 }).catch(() => {});
await W(400);
await shot("soc7-10-l4-figure");

// 07 l5 dilemma — 갈래 A 결과
await openLesson("s1u7l5");
await fwd(1);
await page.waitForSelector(".screen.active .dlm-choice", { timeout: 9000 });
await page.evaluate(() => document.querySelectorAll(".screen.active .dlm-choice")[0]?.click());
await W(1300);
await page.evaluate(() => document.querySelector(".screen.active .dlm-result")?.scrollIntoView({ block: "center" }));
await W(300);
await shot("soc7-07-l5-dilemma");

// 08 l6 판정소(함정 카드 시점 — 4번째 카드까지 진행)
await openLesson("s1u7l6");
await fwd(2);
await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
await page.evaluate(async () => {
  const { JUDGES } = await import("/src/ui/judgeKit.ts");
  const d = JUDGES.diffdisc;
  for (let i = 0; i < 3; i += 1) {
    document.querySelector(`.screen.active .jdg-shelf[data-c="${d.cases[i].answer}"]`)?.click();
    await new Promise((r) => setTimeout(r, 560));
  }
});
await W(600);
await page.evaluate(() => document.querySelector(".screen.active .jdg-stage")?.scrollIntoView({ block: "center" }));
await W(300);
await shot("soc7-08-l6-judge");

// 09 l7 recap 펼침
await openLesson("s1u7l7");
await fwd(3);
await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.click());
await W(600);
await shot("soc7-09-l7-recap");

console.log("DONE");
await browser.close();
