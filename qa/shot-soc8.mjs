// shot-soc8.mjs — 사회 Ⅷ 눈검수 샷 11장. PORT=<포트> node qa/shot-soc8.mjs → qa/shots/soc8-*.png
// 샷별 합격 기준(주석이 정본):
//   home    Ⅷ 밴드 단청 레드 + 지도 데코 5종(밥상→장독→폰→탈→안경)이 경로 반대편에 —
//           발바닥·경로가 fest 색, 겹침 없음
//   hook1   wordhunt 셋째 장면(현수막) + 예측 질문이 선택지 위
//   kimchi  변동성 국면 — 슬라이더 왼쪽 끝(하양 김치) 시점, 항아리 속이 하얀 배추
//   kimchi2 완주 — 속성 배지 5종이 무대 아래 나란히
//   fact    도구 2개 완료 시점 — 게시물 하이라이트 + 도구 램프 문구
//   fact2   도장 시점 — "가짜 정보" 도장이 게시물 위 대각선
//   feast   두 번째 손님(프리야) 상차림 중 — 접시에 음식 아이콘, 손님 카드 live 링
//   figtabs 민속춤 실사 탭(티니클링) — 사진 로드·캡션 가독
//   concept6 새해 음식 3장 나란히 — 사진 아래 캡션 진하게
//   recap7  L7 recap 첫 카드 more 펼침 — rm-h 다이아 불릿
//   quizfig attitudeFig 그림 문제 — (가)(나) 라벨·깃발 은유 가독
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
      lessons: { s1u8l1: { done: true }, s1u8l2: { done: true }, s1u8l3: { done: true }, s1u8l5: { done: true }, s1u8l6: { done: true }, s1u8l7: { done: true } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const W = (ms) => page.waitForTimeout(ms);
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/soc8-${name}.png` });
  console.log(`SHOT soc8-${name}`);
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

// ── 홈(Ⅷ 탭) ──
{
  // 부팅 스플래시 → 둘러보기
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(195, 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await W(800);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[7].click());
  await W(1000);
  await shot("home");
}

// ── L1 훅(wordhunt 셋째 장면) ──
{
  await openLesson("s1u8l1");
  for (let i = 0; i < 2; i += 1) {
    await page.evaluate(() => document.querySelector(".screen.active .hs8-btn")?.click());
    await W(500);
  }
  await page.evaluate(() => document.querySelector(".screen.active .hs8-btn")?.click());
  await W(1300);
  await shot("hook1");
}

// ── L3 kimchiLab(변동성 하양 시점 + 완주 배지) ──
{
  await openLesson("s1u8l3");
  await fwd(1); // 랩으로
  await page.waitForSelector(".screen.active .kcl-scene", { timeout: 9000 });
  const act = () => page.evaluate(() => document.querySelector(".screen.active .kcl-act")?.click());
  const msn0 = async () => {
    await page.waitForSelector(".screen.active .kcl-quiz.show", { timeout: 9000 });
    await page.evaluate(() => document.querySelectorAll(".screen.active .kcl-quiz .msn-opt")[0]?.click());
    await W(1700);
  };
  await act(); await W(900); await msn0();
  for (let i = 0; i < 3; i += 1) { await act(); await W(300); }
  await W(600); await msn0();
  for (let i = 0; i < 3; i += 1) { await act(); await W(300); }
  await W(800); await msn0();
  await page.waitForSelector(".screen.active .kcl-range", { timeout: 9000 });
  await page.evaluate(() => {
    const r = document.querySelector(".screen.active .kcl-range");
    r.value = "0";
    r.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await W(600);
  await shot("kimchi");
  await page.evaluate(() => {
    const r = document.querySelector(".screen.active .kcl-range");
    r.value = "100";
    r.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await W(700); await msn0();
  await act();
  await W(750 * 3 + 1200);
  await msn0();
  await W(400);
  await shot("kimchi2");
}

// ── L5 factLab(하이라이트·도장) ──
{
  await openLesson("s1u8l5");
  await fwd(1);
  await page.waitForSelector(".screen.active .fcl-post", { timeout: 9000 });
  const pick0 = async () => {
    await page.waitForSelector(".screen.active .fcl-quiz.show", { timeout: 9000 });
    await page.evaluate(() => document.querySelectorAll(".screen.active .fcl-quiz .msn-opt")[0]?.click());
    await W(1600);
  };
  await page.evaluate(() => document.querySelector('.screen.active .fcl-tool[data-t="source"]').click());
  await W(400);
  await shot("fact");
  await pick0();
  for (const t of ["ground", "bias", "intent"]) {
    await page.evaluate((id) => document.querySelector(`.screen.active .fcl-tool[data-t="${id}"]`).click(), t);
    await W(350);
    await pick0();
  }
  await W(700);
  await pick0(); // 최종 판정 정답
  await W(1900);
  await shot("fact2");
}

// ── L6 feastLab(프리야 상차림 중) + concept 실사 ──
{
  await openLesson("s1u8l6");
  await fwd(1);
  await page.waitForSelector(".screen.active .fsl-food", { timeout: 9000 });
  const tap = (f) => page.evaluate((id) => document.querySelector(`.screen.active .fsl-food[data-f="${id}"]`).click(), f);
  for (const f of ["bulgogi", "bibim", "dubu", "eggroll"]) { await tap(f); await W(260); }
  await W(1000);
  await tap("suyuk"); await tap("bibim");
  await W(500);
  await shot("feast");
  for (const f of ["dubu", "eggroll"]) { await tap(f); await W(260); }
  await W(1100);
  for (const f of ["bibim", "dubu", "eggroll"]) { await tap(f); await W(260); }
  await W(1500);
  await page.evaluate(() => document.querySelectorAll(".screen.active .fsl-quiz .msn-opt")[0]?.click());
  await W(700);
  await page.evaluate(() => document.querySelector(".screen.active button.cta")?.click());
  await W(800); // concept로
  await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 900));
  await W(400);
  await shot("concept6");
}

// ── L2 figTabs(티니클링 탭) ──
{
  await openLesson("s1u8l2");
  await fwd(1);
  await page.waitForSelector(".screen.active .figtabs", { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .seg button")[1]?.click());
  await W(700);
  await shot("figtabs");
}

// ── L7 recap more + 그림 문제(attitudeFig) ──
{
  await openLesson("s1u8l7");
  await fwd(4); // hook→concept→comic→judge→recap
  await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.click());
  await W(500);
  await shot("recap7");
  await fwd(1); // 그림 문제(mcq attitudeFig)
  await page.waitForSelector(".screen.active .q-figure", { timeout: 9000 });
  await shot("quizfig");
}

console.log("DONE");
await browser.close();
