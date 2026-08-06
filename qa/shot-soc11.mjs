// shot-soc11.mjs — 사회 Ⅺ 눈검수 샷 11장. PORT=<포트> node qa/shot-soc11.mjs → qa/shots/soc11-*.png
// 샷별 합격 기준(주석이 정본):
//   home    Ⅺ 밴드 법전 브라운 + 지도 데코 5종(새끼손가락 약속→법전→저울→법원→계단)이 경로 반대편에 —
//           발바닥·경로가 law 색, 겹침 없음, Ⅹ 라임·afri 골드와 뚜렷이 구분
//   hook1   morninglaw 마지막 비트(횡단보도) + 도장 3개 + 예측 질문이 선택지 위
//   judge1  lawmoral 판정 중 — 하루 카드 + 2개념 선반(법/도덕) 가독
//   hook2   goddess 두 손 공개(저울+칼) — 여신상 좌대·소품 가독
//   comic   만화 첫 컷(카페 게시판) — 말풍선 2개(세부는 shot-soc11-bubbles)
//   bins4   L4 사회법 3분류 통(노동법/경제법/사회 보장법) + 카드
//   trl     trialLab 민사 1국면 — 법원 접수처 + 소장 + "민사 1" 파일 탭
//   trl2    trialLab 피날레 — 민사·형사 두 줄 비교 띠 + 배지 6개
//   ftl     fairTrialLab 장치 1 — 압력 화살표가 판사석을 흔드는 반사실 장면
//   ftl2    fairTrialLab 피날레 — 4기둥 위 수평 저울 신전 + 배지 4개
//   quizfig appealLadderFig 그림 문제 — ㉠(1심→2심)·㉡(2심→대법원) 화살표 배선이 오독 없이 가독
//           (조직도류 연결선 눈검수 — localOrgFig 교훈 항목)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5331";
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
      lessons: { s1u11l1: { done: true }, s1u11l2: { done: true }, s1u11l3: { done: true }, s1u11l4: { done: true }, s1u11l5: { done: true }, s1u11l6: { done: true }, s1u11l7: { done: true } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const W = (ms) => page.waitForTimeout(ms);
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/soc11-${name}.png` });
  console.log(`SHOT soc11-${name}`);
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
const tapHs = async (n = 1) => {
  for (let i = 0; i < n; i += 1) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll(".screen.active .hs8-btn")].filter((x) => !x.disabled)[0];
      b?.click();
    });
    await W(850);
  }
};

// ── 홈(Ⅺ 탭) ──
{
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(195, 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await W(800);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[10].click());
  await W(1100);
  await shot("home");
}

// ── L1 훅(morninglaw 완료 상태) + judgeLab(lawmoral) ──
{
  await openLesson("s1u11l1");
  await tapHs(2);
  await W(1100);
  await shot("hook1");
  await fwd(2); // concept → judgeLab
  await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
  await W(500);
  await shot("judge1");
}

// ── L2 훅(goddess 두 손 공개) ──
{
  await openLesson("s1u11l2");
  await tapHs(2);
  await W(1100);
  await shot("hook2");
}

// ── L4 만화 첫 컷 + binSort ──
{
  await openLesson("s1u11l4");
  await page.waitForSelector(".screen.active .comic-panel", { timeout: 9000 });
  await W(900);
  await shot("comic");
  await fwd(2); // concept → binSort
  await page.waitForSelector(".screen.active .bin-tray .bin-chip", { timeout: 9000 });
  await W(400);
  await shot("bins4");
}

// ── L5 trialLab(민사 1국면 → 피날레) ──
{
  await openLesson("s1u11l5");
  await fwd(2); // hook 지나 concept → trialLab
  await page.waitForSelector(".screen.active .ppl-scene", { timeout: 9000 });
  await W(500);
  await shot("trl");
  await tapAct("소장 접수하기");
  await W(1000);
  await msnFirst();
  await tapAct("변론 듣기");
  await tapAct("변론 듣기");
  await W(1600);
  await tapAct("판결 선고하기");
  await W(1100);
  await msnFirst();
  await tapAct("수사 진행하기");
  await tapAct("수사 진행하기");
  await W(1500);
  await tapAct("기소하기");
  await W(1000);
  await msnFirst();
  await tapAct("재판 진행하기");
  await tapAct("재판 진행하기");
  await W(1800);
  await shot("trl2");
}

// ── L6 fairTrialLab(반사실 장면 → 피날레) ──
{
  await openLesson("s1u11l6");
  await fwd(1); // hook 지나 fairTrialLab
  await page.waitForSelector(".screen.active .ppl-scene", { timeout: 9000 });
  await W(500);
  await shot("ftl");
  await tapAct("바람막이 세우기");
  await W(1100);
  await msnFirst();
  await tapAct("커튼 걷기");
  await tapAct("커튼 걷기");
  await W(1800);
  await tapAct("소문 카드 기각하기");
  await tapAct("증거 카드 채택하기");
  await W(1100);
  await msnFirst();
  await tapAct("다시 재판 청구하기");
  await tapAct("다시 재판 청구하기");
  await W(1200);
  await msnFirst();
  await W(600);
  await shot("ftl2");
}

// ── L7 그림 문제(appealLadderFig — 연결선 배선 눈검수) ──
{
  await openLesson("s1u11l7");
  await fwd(4); // hook→concept→order→recap 지나 첫 퀴즈(appealLadderFig)
  await page.waitForSelector(".screen.active .q-figure, .screen.active .opts", { timeout: 9000 });
  await W(600);
  await shot("quizfig");
}

console.log("DONE 11 shots");
await browser.close();
