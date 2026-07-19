// shot-soc6.mjs — 사회 Ⅵ(오세아니아와 극지방) 눈검수 샷. PORT=<포트> node qa/shot-soc6.mjs
// 산출: qa/shots/soc6-*.png — 샷별 합격 기준(눈검수 체크리스트):
//   soc6-home        : Ⅵ 탭 활성·노드 8개·데코(산호초→울루루→캥거루→쇄빙선→펭귄 서사 순)·잘림 0
//   soc6-hook        : 새해 생중계 장면 — 불꽃이 태평양 쪽(빨간 날짜 변경선 옆)에서 터짐·글자 0
//   soc6-lab-lens    : 기함 세로 — 지도가 화면 폭을 채움·안경 힌트 아이콘 5개가 지역 중심에·
//                      rpl-pill(우상단)이 빈 바다 위(팔라우·마셜 도장과 겹침 0)·날짜 변경선 라벨 표기
//   soc6-lab-done    : 5지역 채움·지역명/나라 도장 라벨 겹침 0(파푸아뉴기니·사모아 labelDy 분리)·
//                      13개 도장 제자리·**폴리네시아 채움이 날짜 변경선을 넘어도 이음새 티 안 남**
//   soc6-season-dec  : seasonLab 12월 — 시드니 반팔+산타 모자·서울 패딩·햇빛 게이지 반전(시드니↑)·
//                      지축이 왼쪽으로 기울고 남반구가 태양(오른쪽)을 향함
//   soc6-terrain     : 지형 hotspot — 스팟 7점이 지형지물 위(사막 점이 모래 폴리곤 안·대보초 점이
//                      청록 점선 호 위·북섬 화산 점이 화산 글리프 위·남섬 빙하 점이 남섬 위)
//   soc6-spot-card   : 스팟 카드 — 울루루 실사가 캡션 의도대로·desc 잘림 0
//   soc6-climate     : 기후 concept — climate.webp 색이 육지에만·범례 4종 색 일치(열대 진초록·
//                      건조 모래 노랑·온대 연두·고산 갈색)·북부 열대/내륙 건조/남동 온대가 읽힘
//   soc6-polar       : 극 원판 2장 — 북극 가운데가 바다·남극 가운데가 대륙(흰색)·대륙/대양 라벨
//                      겹침 0·남극 반도가 아메리카 쪽을 향함
//   soc6-shiprace    : 경주 후 — 북동 항로(주황)에 "먼저 도착!" 배지·두 항로가 지도에서 갈라짐·
//                      베링 해협 헤어핀이 지도 밖으로 안 끊김(날짜 변경선 밴드)
//   soc6-figtabs     : 극지방 4탭(펭귄 탭) — 실사 로드·캡션 잘림 0
//   soc6-recap-final : L8 recap 첫 카드 펼침 — 미니아트·rm-h 불릿·Ⅰ~Ⅵ 세계 일주 피날레 outro 노출
//   soc6-quiz-fig    : 그림 문제(gpgpFig) — 환류 화살표가 시계 방향 고리로 읽힘·라벨 잘림 0·
//                      아메리카 서안(+360 사본)이 오른쪽에 보임
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const BASE = `http://localhost:${PORT}`;
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
    JSON.stringify({
      onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10,
      lessons: {
        s1u6l1: { done: true, acc: 1, bestXp: 0 }, s1u6l2: { done: true, acc: 1, bestXp: 0 },
        s1u6l3: { done: true, acc: 1, bestXp: 0 }, s1u6l5: { done: true, acc: 1, bestXp: 0 },
        s1u6l7: { done: true, acc: 1, bestXp: 0 }, s1u6l8: { done: true, acc: 1, bestXp: 0 },
      },
    }),
  );
});
await page.goto(BASE);
await page.waitForTimeout(2200);

// 홈 — Ⅵ 탭으로 전환해 지도(밴드+노드 8+데코) 캡처
await page.evaluate(() => document.querySelectorAll(".unit-tab")[5]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(900);
await page.screenshot({ path: "qa/shots/soc6-home.png" });

const openLesson = async (id) => {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, () => {}));
  }, id);
  await page.waitForTimeout(1000);
};
const fwd = async (n = 1) => {
  for (let i = 0; i < n; i += 1) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForTimeout(650);
  }
};

// ── L1: 훅(불꽃) → 기함(안경 + 완주 도장 + 날짜변경선) ──
await openLesson("s1u6l1");
await page.evaluate(() => document.querySelector(".screen.active .hs6-btn")?.click());
await page.waitForTimeout(900);
await page.screenshot({ path: "qa/shots/soc6-hook.png" });
await fwd(2);
await page.waitForSelector(".screen.active .rpl-svg", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .rpl-stage")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(400);
await page.evaluate(() => document.querySelector(".screen.active .rpl-lens")?.click());
await page.waitForTimeout(450);
await page.screenshot({ path: "qa/shots/soc6-lab-lens.png" });
// 5지역 프로그램 배치(도장·채움·이음새 확인용)
const OC_CROP = { x: 805, y: 200, w: 229, h: 184 };
const place = async (regionId, lon, lat) => {
  await page.evaluate(({ id, LON, LAT, crop }) => {
    const svg = document.querySelector(".screen.active .rpl-svg");
    const r = svg.getBoundingClientRect();
    const sx = ((LON + 180) / 360) * 1000;
    const sy = ((90 - LAT) / 180) * 500;
    const x = r.left + ((sx - crop.x) / crop.w) * r.width;
    const y = r.top + ((sy - crop.y) / crop.h) * r.height;
    const tok = document.querySelector(`.screen.active .rpl-token[data-r="${id}"]`);
    const tr = tok.getBoundingClientRect();
    const pe = (type, cx, cy, target) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: cx, clientY: cy, isPrimary: true }));
    pe("pointerdown", tr.left + tr.width / 2, tr.top + tr.height / 2, tok);
    pe("pointermove", x, y, document.body);
    pe("pointerup", x, y, document.body);
  }, { id: regionId, LON: lon, LAT: lat, crop: OC_CROP });
  await page.waitForTimeout(300);
};
await place("australia", 134, -25);
await place("newzealand", 171, -43);
await place("melanesia", 145, -6);
await place("micronesia", 153, 6);
await place("polynesia", 186, -12);
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/soc6-lab-done.png" });

// ── L3: seasonLab 12월(산타·게이지 반전) ──
await openLesson("s1u6l3");
await fwd(1);
await page.waitForSelector(".screen.active .spring-canvas", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .stage")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(600);
await page.evaluate(() => {
  const canvas = document.querySelector(".screen.active .spring-canvas");
  const r = canvas.getBoundingClientRect();
  const cy = r.top + r.height * 0.55;
  const pe = (type, x) => canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 9, clientX: x, clientY: cy, isPrimary: true }));
  const cx = r.left + r.width * 0.5;
  pe("pointerdown", cx);
  for (let i = 1; i <= 6; i += 1) pe("pointermove", cx - r.width * 0.8 * (i / 6));
  pe("pointerup", cx - r.width * 0.8);
});
await page.waitForTimeout(1400);
await page.screenshot({ path: "qa/shots/soc6-season-dec.png" });

// ── L2: 지형 hotspot(스팟 정렬) + 스팟 카드(울루루) ──
await openLesson("s1u6l2");
await fwd(1);
await page.waitForSelector(".screen.active .hs-dot", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .hs-art")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc6-terrain.png" });
await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot")[0]?.click());
await page.waitForTimeout(700);
await page.screenshot({ path: "qa/shots/soc6-spot-card.png" });

// ── L3 concept: 기후 지도(범례 4종) ──
await openLesson("s1u6l3");
await fwd(2);
await page.waitForTimeout(600);
await page.evaluate(() => {
  const imgs = [...document.querySelectorAll(".screen.active svg")];
  const climate = imgs.find((s) => (s.getAttribute("aria-label") ?? "").includes("기후 분포"));
  climate?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc6-climate.png" });

// ── L7: 극 원판 concept → figTabs(펭귄) → shipRace(경주 후) ──
await openLesson("s1u6l7");
await fwd(1);
await page.waitForTimeout(600);
await page.evaluate(() => {
  const svgs = [...document.querySelectorAll(".screen.active svg")];
  const polar = svgs.find((s) => (s.getAttribute("aria-label") ?? "").includes("극중심"));
  polar?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc6-polar.png" });
await fwd(1);
await page.waitForSelector(".screen.active .figtabs", { timeout: 9000 });
await page.evaluate(() => document.querySelectorAll(".screen.active .seg button")[2]?.click());
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc6-figtabs.png" });
await fwd(1);
await page.waitForSelector(".screen.active .shr-go", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .shr-map")?.scrollIntoView({ block: "start" }));
await page.evaluate(() => document.querySelector(".screen.active .shr-go")?.click());
await page.waitForTimeout(9800);
await page.screenshot({ path: "qa/shots/soc6-shiprace.png" });

// ── L8: recap 피날레 펼침 ──
await openLesson("s1u6l8");
await fwd(3);
await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.click());
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc6-recap-final.png" });

// ── L5: 그림 문제(gpgpFig — 환류·쓰레기 지대) ──
await openLesson("s1u6l5");
await fwd(4);
await page.waitForTimeout(700);
await page.evaluate(() => {
  const fig = document.querySelector(".screen.active .q-figure, .screen.active .qz-fig, .screen.active .opts");
  fig?.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc6-quiz-fig.png" });

console.log("SHOTS DONE → qa/shots/soc6-*.png");
await browser.close();
