// shot-soc9.mjs — 사회 Ⅸ 눈검수 샷 11장. PORT=<포트> node qa/shot-soc9.mjs → qa/shots/soc9-*.png
// 샷별 합격 기준(주석이 정본):
//   home    Ⅸ 밴드 투표 잉크 네이비 + 지도 데코 5종(말풍선→투표함→기둥→법전→손)이 경로 반대편에 —
//           발바닥·경로가 vote 색, 겹침 없음
//   hook1   seatwar 세 주장 등장 + 예측 질문이 선택지 위
//   judge1  ispolitics 판정 중 — 카드·선반 2개·목표 칩 가독
//   dilemma speedvote 갈래 A 결과 — 얻은 것·잃은 것 두 칼럼
//   sfr     suffrageLab 1918 시점 — 여성 카드 부분 점등("30세 이상만" 배지)
//   sfr2    1928 완주 — 네 카드 전부 점등 + 투표함 반짝
//   ppl     principleLab 주권 국면 완료 — 왕관이 시민들 머리 위로 분산
//   ppl2    피날레 — 네 기둥+이념 지붕 신전, 배지 4개
//   comic   만화 첫 컷 — 말풍선·언덕 구도(세부는 shot-soc9-bubbles)
//   recap7  L7 recap 첫 카드 more 펼침 — rm-h 다이아 불릿
//   quizfig kleroterionFig 그림 문제 — 이름표·돌 관 도해 가독
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5291";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
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
      lessons: { s1u9l1: { done: true }, s1u9l2: { done: true }, s1u9l3: { done: true }, s1u9l4: { done: true }, s1u9l5: { done: true }, s1u9l7: { done: true } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const W = (ms) => page.waitForTimeout(ms);
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/soc9-${name}.png` });
  console.log(`SHOT soc9-${name}`);
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
    await W(650);
  }
};

// ── 홈(Ⅸ 탭) ──
{
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(195, 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await W(800);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[8].click());
  await W(1000);
  await shot("home");
}

// ── L1 훅(seatwar) + judgeLab(ispolitics) ──
{
  await openLesson("s1u9l1");
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => [...document.querySelectorAll(".screen.active .hs9-btn, .screen.active .hs8-btn")].filter((b) => !b.disabled)[0]?.click());
    await W(700);
  }
  await W(900);
  await shot("hook1");
  await fwd(1);
  await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
  await W(500);
  await shot("judge1");
}

// ── L2 dilemmaLab(speedvote 갈래 A) ──
{
  await openLesson("s1u9l2");
  await fwd(2); // hook → concept → dilemma
  await page.waitForSelector(".screen.active .dlm-choice", { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .dlm-choice")[0].click());
  await W(1000);
  await shot("dilemma");
}

// ── L4 suffrageLab(1918 + 1928) ──
{
  await openLesson("s1u9l4");
  await fwd(1);
  await page.waitForSelector(".screen.active .sfr-range", { timeout: 9000 });
  const setEra = async (v) => {
    await page.evaluate((val) => {
      const r = document.querySelector(".screen.active .sfr-range");
      r.value = String(val);
      r.dispatchEvent(new Event("input", { bubbles: true }));
    }, v);
    await W(500);
  };
  for (let v = 1; v <= 4; v += 1) await setEra(v);
  await shot("sfr");
  await setEra(5);
  await W(400);
  await shot("sfr2");
}

// ── L5 principleLab(주권 국면 + 피날레) ──
{
  await openLesson("s1u9l5");
  await fwd(2); // hook → concept → lab
  await page.waitForSelector(".screen.active .ppl-scene", { timeout: 9000 });
  const act = (i = 0) => page.evaluate((idx) => [...document.querySelectorAll(".screen.active .ppl-act")].filter((b) => !b.disabled)[idx]?.click(), i);
  const msn0 = async () => {
    await page.waitForSelector(".screen.active .ppl-quiz.show", { timeout: 9000 });
    await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-quiz .msn-opt")[0]?.click());
    await W(1900);
  };
  await act();
  await W(1000);
  await shot("ppl");
  await msn0();
  await act(0); await W(700); await act(0); await W(1100); await msn0();
  await act(); await W(1000); await msn0();
  for (let i = 0; i < 3; i += 1) { await act(); await W(420); }
  await W(800); await msn0();
  await W(1100);
  await shot("ppl2");
}

// ── L3 만화 첫 컷 ──
{
  await openLesson("s1u9l3");
  await fwd(1);
  await page.waitForSelector(".screen.active .comic-art", { timeout: 9000 });
  await W(800);
  await shot("comic");
}

// ── L7 recap more + L3 그림 문제(클레로테리온) ──
{
  await openLesson("s1u9l7");
  await fwd(3); // hook → concept → binSort → recap
  await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.click());
  await W(600);
  await shot("recap7");
}
{
  await openLesson("s1u9l3");
  await fwd(4); // hook → comic → concept → recap → quiz(클레로테리온)
  await page.waitForSelector(".screen.active .q-figure, .screen.active .opts", { timeout: 9000 });
  await W(500);
  await shot("quizfig");
}

console.log("DONE");
await browser.close();
