// shot-soc12.mjs — 사회 Ⅻ 눈검수 샷 12장. PORT=<포트> node qa/shot-soc12.mjs → qa/shots/soc12-*.png
// 샷별 합격 기준(주석이 정본):
//   home    Ⅻ 밴드 존엄 플럼 + 지도 데코 5종(빛 구슬→방패→자물쇠→문→맞잡은 손)이 경로 반대편에 —
//           발바닥·경로가 dign 색, ocea 바이올렛·civic 로즈와 뚜렷이 구분
//   comic   L1 만화 첫 컷(침대 기지개) — 말풍선 1개(세부는 shot-soc12-bubbles)
//   judge1  invade 판정 중 — 일상 카드 + 2개념 선반(침해다/아니다) 가독
//   hook2   tenbook 마지막 비트 — 빛나는 조문 페이지 + 예측 질문이 선택지 위
//   sdl     shieldLab 국면 1 — 같은 일 다른 몫의 기운 저울(반사실 장면)
//   sdl2    shieldLab 피날레 — 왕관 받침돌 위 다섯 방패 문장 + 배지 5개
//   pair3   L3 pairMatch 보드 — 생활 장면 5 ↔ 방패 5 칩 가독
//   judge4  limit3 판정 중 — 3개념 선반(안전 보장/질서 유지/공공복리) 2열 배치 가독
//   judge5  rescue 판정 중 — 3개념 선반(법원/헌법재판소/국가인권위원회) 가독
//   wrl     workRightLab 관찰 국면 — 큰 책상 너머 닿지 않는 목소리 + 우상단 기운 미니 저울
//   wrl2    workRightLab 피날레 — 타결 악수 + 서명 계약서 + 걸음 배지 3개
//   quizfig remedyMapFig 그림 문제 — 침해 2카드→㉠㉡ 창구 화살표 배선이 오독 없이 가독
//           (조직도류 연결선 눈검수 — localOrgFig 교훈 항목, 법원 공통 길은 점선)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5347";
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
      lessons: { s1u12l1: { done: true }, s1u12l2: { done: true }, s1u12l3: { done: true }, s1u12l4: { done: true }, s1u12l5: { done: true }, s1u12l6: { done: true }, s1u12l7: { done: true } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const W = (ms) => page.waitForTimeout(ms);
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/soc12-${name}.png` });
  console.log(`SHOT soc12-${name}`);
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

// ── 홈(Ⅻ 탭) ──
{
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(195, 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await W(800);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[11].click());
  await W(1100);
  await shot("home");
}

// ── L1 만화 첫 컷 + judgeLab(invade) ──
{
  await openLesson("s1u12l1");
  await page.waitForSelector(".screen.active .comic-panel", { timeout: 9000 });
  await W(900);
  await shot("comic");
  await fwd(2); // concept → judgeLab
  await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
  await W(500);
  await shot("judge1");
}

// ── L2 훅(tenbook 마지막 비트) + shieldLab 반사실·피날레 ──
{
  await openLesson("s1u12l2");
  await tapHs(2);
  await W(1100);
  await shot("hook2");
  await fwd(2); // concept → shieldLab
  await page.waitForSelector(".screen.active .ppl-scene", { timeout: 9000 });
  await W(500);
  await shot("sdl");
  await tapAct("같은 잣대 세우기");
  await W(1000);
  await msnFirst();
  await tapAct("간섭 걷어 내기");
  await tapAct("간섭 걷어 내기");
  await W(1900);
  await tapAct("투표함 열기");
  await tapAct("투표함 열기");
  await W(1900);
  await tapAct("구제 요청서 내기");
  await W(1000);
  await msnFirst();
  await tapAct("안전망 펼치기");
  await W(1000);
  await msnFirst();
  await W(600);
  await shot("sdl2");
}

// ── L3 pairMatch 보드 ──
{
  await openLesson("s1u12l3");
  await fwd(2); // 훅 → concept → pairMatch
  await page.waitForSelector(".screen.active .pm-chip", { timeout: 9000 });
  await W(500);
  await shot("pair3");
}

// ── L4 judgeLab(limit3 — 3선반) ──
{
  await openLesson("s1u12l4");
  await fwd(2);
  await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
  await W(500);
  await shot("judge4");
}

// ── L5 judgeLab(rescue — 3선반) ──
{
  await openLesson("s1u12l5");
  await fwd(2);
  await page.waitForSelector(".screen.active .jdg-card.in", { timeout: 9000 });
  await W(500);
  await shot("judge5");
}

// ── L6 workRightLab 관찰·피날레 ──
{
  await openLesson("s1u12l6");
  await fwd(2); // 훅 → concept → workRightLab
  await page.waitForSelector(".screen.active .ppl-scene", { timeout: 9000 });
  await W(500);
  await shot("wrl");
  await tapAct("혼자 말해 보기");
  await W(2100);
  await tapAct("함께 모이기");
  await tapAct("함께 모이기");
  await W(1300);
  await msnFirst();
  await tapAct("교섭 테이블 차리기");
  await W(1000);
  await msnFirst();
  await tapAct("다음 단계 밟기");
  await tapAct("다음 단계 밟기");
  await W(1400);
  await msnFirst();
  await W(600);
  await shot("wrl2");
}

// ── L7 remedyMapFig 그림 문제 ──
{
  await openLesson("s1u12l7");
  await fwd(4); // 훅 → concept → binSort → recap → 그림 mcq
  await page.waitForSelector(".screen.active .q-figure svg", { timeout: 9000 });
  await W(500);
  await shot("quizfig");
}

console.log("DONE");
await browser.close();
