// shot-soc10.mjs — 사회 Ⅹ 눈검수 샷 11장. PORT=<포트> node qa/shot-soc10.mjs → qa/shots/soc10-*.png
// 샷별 합격 기준(주석이 정본):
//   home    Ⅹ 밴드 풀뿌리 라임 + 지도 데코 5종(기표 도장→확성기→신문→의사봉→새싹)이 경로 반대편에 —
//           발바닥·경로가 voice 색, 겹침 없음, Ⅸ 네이비와 뚜렷이 구분
//   hook1   onevote 개표 동률(5:5) + 마지막 한 표 스포트라이트 + 예측 질문이 선택지 위
//   judge2  ruleguard 판정 중 — 카드 + 4개념 선반 2×2 가독(선반 라벨 "○○ 선거 위반")
//   elc     electLab 선거 운동 국면 — 공약 포스터 2장 + 판정 quiz
//   elc2    피날레 — 6단계 지그재그 띠 + 배지 6개
//   judge4  polactor 판정 중 — 스틱 시 소식 카드 + 4주체 선반
//   pcy     policyLab 표출 국면 — 상단 5정거장 트랙 + 말풍선 3
//   pcy2    피날레 — 환류 화살표 점등(평가→표출 노란 점선) + 배지 5개
//   comic   만화 첫 컷 — 시골 정류장·어르신 당당한 자세(세부는 shot-soc10-bubbles)
//   recap7  L7 recap 첫 카드 more 펼침 — rm-h 다이아 불릿
//   quizfig localOrgFig 그림 문제 — 조직도 ㉠㉡ 가독
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5241";
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
      lessons: { s1u10l1: { done: true }, s1u10l2: { done: true }, s1u10l3: { done: true }, s1u10l4: { done: true }, s1u10l5: { done: true }, s1u10l6: { done: true }, s1u10l7: { done: true } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const W = (ms) => page.waitForTimeout(ms);
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/soc10-${name}.png` });
  console.log(`SHOT soc10-${name}`);
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
const tapAct = async (frag) => {
  await page.evaluate((f) => {
    const b = [...document.querySelectorAll(".screen.active .ppl-act")].filter((x) => !x.disabled && !x.classList.contains("done")).find((x) => x.textContent.includes(f));
    b?.click();
  }, frag);
  await W(480);
};
const msnFirst = async () => {
  await page.waitForSelector(".screen.active .ppl-quiz.show", { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-quiz .msn-opt")[0]?.click());
  await W(1900);
};

// ── 홈(Ⅹ 탭) ──
{
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(195, 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await W(800);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[9].click());
  await W(1000);
  await shot("home");
}

// ── L1 훅(onevote 동률+마지막 표) ──
{
  await openLesson("s1u10l1");
  for (let i = 0; i < 2; i += 1) {
    await page.evaluate(() => [...document.querySelectorAll(".screen.active .hs8-btn")].filter((b) => !b.disabled)[0]?.click());
    await W(700);
  }
  await W(900);
  await shot("hook1");
}

// ── L2 judgeLab(ruleguard — 4개념 2×2) ──
{
  await openLesson("s1u10l2");
  await fwd(2); // hook → concept → judgeLab
  await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
  await W(500);
  await shot("judge2");
}

// ── L3 electLab(선거 운동 국면 + 피날레) ──
{
  await openLesson("s1u10l3");
  await fwd(1);
  await page.waitForSelector(".screen.active .ppl-scene", { timeout: 9000 });
  for (let i = 0; i < 3; i += 1) await tapAct("명단 확인하기");
  await W(1400);
  await tapAct("후보 등록 받기");
  await tapAct("후보 등록 받기");
  await W(1400);
  await tapAct("기호 ① 공약");
  await tapAct("기호 ② 공약");
  await W(1000);
  await shot("elc");
  await msnFirst();
  await tapAct("기표하기");
  await msnFirst();
  for (let i = 0; i < 3; i += 1) await tapAct("개표하기");
  await W(1500);
  await tapAct("당선인 확정하기");
  await msnFirst();
  await W(500);
  await shot("elc2");
}

// ── L4 judgeLab(polactor) ──
{
  await openLesson("s1u10l4");
  await fwd(2); // hook → concept → judgeLab
  await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
  await W(500);
  await shot("judge4");
}

// ── L5 policyLab(표출 국면 + 환류 피날레) ──
{
  await openLesson("s1u10l5");
  await fwd(1);
  await page.waitForSelector(".screen.active .ppl-scene", { timeout: 9000 });
  for (let i = 0; i < 3; i += 1) await tapAct("목소리 모으기");
  await W(800);
  await shot("pcy");
  await W(1000);
  await tapAct("하나로 모으기");
  await msnFirst();
  await tapAct("회의 열기");
  await msnFirst();
  await tapAct("정책 실행하기");
  await msnFirst();
  await tapAct("별점 남기기");
  await W(1900);
  await shot("pcy2");
}

// ── L6 만화 첫 컷 + L7 recap·그림 문제 ──
{
  await openLesson("s1u10l6");
  await fwd(1);
  await page.waitForSelector(".screen.active .comic-art", { timeout: 9000 });
  await W(700);
  await shot("comic");
  // localOrgFig 그림 문제(L6 recap 뒤 mcq — recap까지 3스텝 더: concept→binSort→recap→mcq)
  await fwd(4);
  await W(500);
  await shot("quizfig");
}
{
  await openLesson("s1u10l7");
  await fwd(4); // hook → concept → binSort → pairMatch → recap
  await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.click());
  await W(600);
  await shot("recap7");
}

console.log("DONE");
await browser.close();
