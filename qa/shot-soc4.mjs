// shot-soc4.mjs — 사회 Ⅳ(아프리카) 눈검수 샷. PORT=<포트> node qa/shot-soc4.mjs
// 산출: qa/shots/soc4-*.png — 샷별 합격 기준(눈검수 체크리스트):
//   soc4-home        : Ⅳ 탭 활성·노드 8개·아프리카 데코(피라미드→바오바브→기린→젬베→태양광)·잘림 0
//   soc4-hook        : 퍼즐 장면 — 아프리카 실루엣이 아프리카로 읽힘·글자 0
//   soc4-lab-lens    : 기함 세로 — 지도가 화면 폭을 채움·안경 힌트 아이콘 5개가 지역 중심에·겹침 0
//   soc4-lab-done    : 5지역 채움·지역명/도시 라벨 겹침 0·다르에스살람 labelDy 분리 확인
//   soc4-rainbelt-jan: 1월 — 비 띠가 적도 남쪽·남사바나 초록/북사바나 갈색·태양 마커 남쪽·라벨 잘림 0
//   soc4-rainbelt-jul: 7월 — 비 띠가 적도 북쪽(사헬)·색 교대 반전·누 떼 북상
//   soc4-terrain     : 지형 hotspot — 스팟 7점이 지형지물 위(사하라 점이 모래 폴리곤 안, 폭포 점이 잠베지강 위)
//   soc4-spot-card   : 스팟 카드 — 실사(킬리만자로)가 캡션 의도대로 읽힘·desc 잘림 0
//   soc4-climate     : 기후 concept — climate.webp 색이 육지에만·범례 4종 색 일치·적도/회귀선 라벨
//   soc4-figtabs     : 생활 문화 5탭 — 실사가 캡션 의도대로(사막 옷=원경 뒷모습)·탭 이름 잘림 0
//   soc4-recap       : recap 펼침 — 미니아트 렌더·rm-h 다이아 불릿·본문 잘림 0
//   soc4-quiz-fig    : 그림 문제(중위 연령 막대) — 수치·라벨 잘림 0·막대 순서가 값 순
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
        s1u4l1: { done: true, acc: 1, bestXp: 0 }, s1u4l2: { done: true, acc: 1, bestXp: 0 },
        s1u4l3: { done: true, acc: 1, bestXp: 0 }, s1u4l4: { done: true, acc: 1, bestXp: 0 },
        s1u4l6: { done: true, acc: 1, bestXp: 0 }, s1u4l8: { done: true, acc: 1, bestXp: 0 },
      },
    }),
  );
});
await page.goto(BASE);
await page.waitForTimeout(2200);

// 홈 — Ⅳ 탭으로 전환해 지도(밴드+노드+아프리카 데코) 캡처
await page.evaluate(() => document.querySelectorAll(".unit-tab")[3]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(900);
await page.screenshot({ path: "qa/shots/soc4-home.png" });

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

// ── L1: 훅 → 기함(안경 + 완주 도장) ──
await openLesson("s1u4l1");
await page.evaluate(() => document.querySelector(".screen.active .hs4-puzzle")?.click());
await page.waitForTimeout(400);
await page.evaluate(() => document.querySelector(".screen.active .hs4-puzzle")?.click());
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc4-hook.png" });
await fwd(2);
await page.waitForSelector(".screen.active .rpl-svg", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .rpl-stage")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(400);
await page.evaluate(() => document.querySelector(".screen.active .rpl-lens")?.click());
await page.waitForTimeout(450);
await page.screenshot({ path: "qa/shots/soc4-lab-lens.png" });
// 5지역 합성 배치 → 완주 도장 샷
const AF_CROP = { x: 444, y: 144, w: 209, h: 206 };
for (const [id, lon, lat] of [["north", 10, 24], ["west", -2, 13], ["central", 21, 1], ["east", 38, 6], ["south", 23, -22]]) {
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
  }, { rid: id, LON: lon, LAT: lat, crop: AF_CROP });
  await page.waitForTimeout(320);
}
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc4-lab-done.png" });

// ── L3: 비 띠 랩(1월/7월) ──
await openLesson("s1u4l3");
await fwd(1);
await page.waitForSelector(".screen.active .spring-canvas", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .stage")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(2900);
await page.screenshot({ path: "qa/shots/soc4-rainbelt-jan.png" });
await page.evaluate(() => {
  const btns = [...document.querySelectorAll(".screen.active .seg button")];
  btns.find((b) => b.textContent.includes("7월"))?.click();
});
await page.waitForTimeout(2600);
await page.screenshot({ path: "qa/shots/soc4-rainbelt-jul.png" });

// ── L2: 지형 hotspot(전 스팟 공개 + 카드) ──
await openLesson("s1u4l2");
await fwd(1);
await page.waitForSelector(".screen.active .hs-dot", { timeout: 9000 });
const nSpots = await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot").length);
for (let i = 0; i < nSpots; i += 1) {
  await page.evaluate((idx) => document.querySelectorAll(".screen.active .hs-dot")[idx].click(), i);
  await page.waitForTimeout(240);
}
await page.evaluate(() => document.querySelector(".screen.active .hs-art")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(300);
await page.screenshot({ path: "qa/shots/soc4-terrain.png" });
// 킬리만자로 스팟 카드(실사) — 6번째 스팟 다시 탭
await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot")[5]?.click());
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/soc4-spot-card.png" });

// ── L3 concept: 기후 지도(climate.webp) ──
await openLesson("s1u4l3");
await fwd(2);
await page.waitForTimeout(500);
await page.evaluate(() => {
  const imgs = [...document.querySelectorAll(".screen.active .blocks svg, .screen.active .blocks img")];
  imgs[imgs.length - 1]?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc4-climate.png" });

// ── L4: figTabs 실사 5탭(첫 탭) ──
await openLesson("s1u4l4");
await fwd(2);
await page.waitForSelector(".screen.active .figtabs", { timeout: 9000 });
await page.waitForTimeout(700);
await page.screenshot({ path: "qa/shots/soc4-figtabs.png" });

// ── L6: recap 펼침 + 그림 문제(중위 연령 막대) ──
await openLesson("s1u4l6");
await fwd(3);
await page.waitForSelector(".screen.active .rc-card", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.click());
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/soc4-recap.png" });
await fwd(1);
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc4-quiz-fig.png" });

console.log("SHOTS DONE → qa/shots/soc4-*.png");
await browser.close();
