// shot-soc5.mjs — 사회 Ⅴ(아메리카) 눈검수 샷. PORT=<포트> node qa/shot-soc5.mjs
// 산출: qa/shots/soc5-*.png — 샷별 합격 기준(눈검수 체크리스트):
//   soc5-home          : Ⅴ 탭 활성·노드 7개·아메리카 데코(단풍→마천루→선인장→앵무새→라마)·잘림 0
//   soc5-hook          : 검색 결과 장면 — 두 덩어리+지협 실루엣이 아메리카로 읽힘·검색어만 텍스트
//   soc5-lab-lens      : 기함 세로 — 지도가 화면 폭을 채움·안경 힌트 아이콘 3개가 지역 중심에·
//                        rpl-pill(우상단)이 그린란드 여백 위(도시 도장·라벨과 겹침 0)
//   soc5-lab-done      : 3지역 채움·지역명/도시 라벨 겹침 0(토론토·키토·리우데자네이루 labelDy 분리)·
//                        14개 도시 도장이 전부 육지 위
//   soc5-highland-low  : 고도 랩 초기(저지) — 단면 밴드·이키토스 마커·인셋 지도의 보라 고산 띠가 안데스 위
//   soc5-highland-quito: 2,850m 도달 — 키토 도시 마커에 등반 스틱맨 도착·기온 13℃ 안팎·핀 문구
//   soc5-terrain       : 지형 hotspot — 스팟 7점이 지형지물 위(로키 점이 산 글리프 위·미시시피 점이
//                        강 라인 위·브라질고원 점이 갈색 폴리곤 안)
//   soc5-spot-card     : 스팟 카드 — 실사(안데스)가 캡션 의도대로 읽힘·desc 잘림 0
//   soc5-climate       : 기후 concept — climate.webp 색이 육지에만·범례 6종 색 일치·회귀선 라벨
//   soc5-figtabs       : 혼종 문화 4탭 — 과달루페 실사가 캡션 의도(갈색 피부 성모)대로·탭 이름 잘림 0
//   soc5-recap         : recap 펼침 — 미니아트 렌더·rm-h 다이아 불릿·본문 잘림 0
//   soc5-quiz-fig      : 그림 문제(민족 구성 파이) — 수치·라벨 잘림 0·비율 부채꼴이 수치와 일치
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
        s1u5l1: { done: true, acc: 1, bestXp: 0 }, s1u5l2: { done: true, acc: 1, bestXp: 0 },
        s1u5l3: { done: true, acc: 1, bestXp: 0 }, s1u5l4: { done: true, acc: 1, bestXp: 0 },
        s1u5l5: { done: true, acc: 1, bestXp: 0 },
      },
    }),
  );
});
await page.goto(BASE);
await page.waitForTimeout(2200);

// 홈 — Ⅴ 탭으로 전환해 지도(밴드+노드+아메리카 데코) 캡처
await page.evaluate(() => document.querySelectorAll(".unit-tab")[4]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(900);
await page.screenshot({ path: "qa/shots/soc5-home.png" });

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

// ── L1: 훅(검색 결과) → 기함(안경 + 완주 도장) ──
await openLesson("s1u5l1");
await page.evaluate(() => document.querySelector(".screen.active .hs5-flipbtn")?.click());
await page.waitForTimeout(700);
await page.screenshot({ path: "qa/shots/soc5-hook.png" });
await fwd(2);
await page.waitForSelector(".screen.active .rpl-svg", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .rpl-stage")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(400);
await page.evaluate(() => document.querySelector(".screen.active .rpl-lens")?.click());
await page.waitForTimeout(450);
await page.screenshot({ path: "qa/shots/soc5-lab-lens.png" });
// 3지역 합성 배치 → 완주 도장 샷
const AM_CROP = { x: 28, y: 47, w: 392, h: 361 };
for (const [id, lon, lat] of [["anglo", -100, 45], ["central", -102, 24], ["south", -56, -11]]) {
  await page.evaluate(({ rid, LON, LAT, crop }) => {
    const svg = document.querySelector(".screen.active .rpl-svg");
    const r = svg.getBoundingClientRect();
    const sx = ((LON + 180) / 360) * 1000;
    const sy = ((90 - LAT) / 180) * 500;
    const x = r.left + ((sx - crop.x) / crop.w) * r.width;
    const y = r.top + ((sy - crop.y) / crop.h) * r.height;
    const tok = document.querySelector(`.screen.active .rpl-token[data-r="${rid}"]`);
    const tr = tok.getBoundingClientRect();
    const pe = (type, cx, cy, target) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: cx, clientY: cy, isPrimary: true }));
    pe("pointerdown", tr.left + tr.width / 2, tr.top + tr.height / 2, tok);
    pe("pointermove", x, y, document.body);
    pe("pointerup", x, y, document.body);
  }, { rid: id, LON: lon, LAT: lat, crop: AM_CROP });
  await page.waitForTimeout(320);
}
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc5-lab-done.png" });

// ── L3: 고도 랩(저지/키토) ──
await openLesson("s1u5l3");
await fwd(1);
await page.waitForSelector(".screen.active .spring-canvas", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .stage")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(2900);
await page.screenshot({ path: "qa/shots/soc5-highland-low.png" });
await page.evaluate(() => {
  const canvas = document.querySelector(".screen.active .spring-canvas");
  const r = canvas.getBoundingClientRect();
  const CVH = 396;
  const yb = CVH - 78;
  const yLogical = yb - (2850 / 6400) * (yb - 44);
  const cy = r.top + (yLogical / CVH) * r.height;
  const cx = r.left + r.width * 0.5;
  const pe = (type) => canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 9, clientX: cx, clientY: cy, isPrimary: true }));
  pe("pointerdown");
  pe("pointerup");
});
await page.waitForTimeout(2900);
await page.screenshot({ path: "qa/shots/soc5-highland-quito.png" });

// ── L2: 지형 hotspot(전 스팟 공개 + 카드) ──
await openLesson("s1u5l2");
await fwd(1);
await page.waitForSelector(".screen.active .hs-dot", { timeout: 9000 });
const nSpots = await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot").length);
for (let i = 0; i < nSpots; i += 1) {
  await page.evaluate((idx) => document.querySelectorAll(".screen.active .hs-dot")[idx].click(), i);
  await page.waitForTimeout(240);
}
await page.evaluate(() => document.querySelector(".screen.active .hs-art")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(300);
await page.screenshot({ path: "qa/shots/soc5-terrain.png" });
// 안데스 스팟 카드(실사) — 5번째 스팟 다시 탭
await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot")[4]?.click());
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/soc5-spot-card.png" });

// ── L3 concept: 기후 지도(climate.webp) ──
await openLesson("s1u5l3");
await fwd(2);
await page.waitForTimeout(500);
await page.evaluate(() => {
  const imgs = [...document.querySelectorAll(".screen.active .blocks svg, .screen.active .blocks img")];
  imgs[imgs.length - 1]?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc5-climate.png" });

// ── L5: figTabs 혼종 4탭(첫 탭 = 과달루페) ──
await openLesson("s1u5l5");
await fwd(2);
await page.waitForSelector(".screen.active .figtabs", { timeout: 9000 });
await page.waitForTimeout(700);
await page.screenshot({ path: "qa/shots/soc5-figtabs.png" });

// ── L4: recap 펼침 + 그림 문제(민족 구성 파이) ──
await openLesson("s1u5l4");
await fwd(3);
await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.click());
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/soc5-recap.png" });
await fwd(1);
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc5-quiz-fig.png" });

console.log("SHOTS DONE → qa/shots/soc5-*.png");
await browser.close();
