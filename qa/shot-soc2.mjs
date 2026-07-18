// shot-soc2.mjs — 사회 Ⅱ(아시아) 눈검수 샷. PORT=<포트> node qa/shot-soc2.mjs
// 산출: qa/shots/soc2-*.png (홈 Ⅱ 지도 · 훅 · 기함 배치(안경·완료) · 계절풍 · 피라미드 ·
//        경관 figTabs 실사 · 개념 컷 · recap 펼침 · 그림 문제(사마르칸트))
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const BASE = `http://localhost:${PORT}`;
mkdirSync("qa/shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10 }),
  );
});
await page.goto(BASE);
await page.waitForTimeout(2200);
// 홈 — Ⅱ 탭으로 전환해 지도(밴드+노드+데코) 캡처
await page.evaluate(() => document.querySelectorAll(".unit-tab")[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(900);
await page.screenshot({ path: "qa/shots/soc2-home.png" });

const openLesson = async (id) => {
  await page.evaluate(async (lessonId) => {
    const st = await import("/src/core/store.ts");
    if (!st.isDone(lessonId)) st.completeLesson(lessonId, 1, 0); // freeNav
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(lessonId).lesson, () => {}));
  }, id);
  await page.waitForTimeout(900);
};
const fwd = async (n = 1) => {
  for (let i = 0; i < n; i += 1) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForTimeout(520);
  }
};

// ── L1: 훅 → 기함(안경 + 배치 2 + 오답 토스트) → 그림 문제 ──
await openLesson("s1u2l1");
await page.evaluate(() => document.querySelector(".screen.active .hs2-games")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc2-hook.png" });
await fwd(2); // concept(컷) 지나 랩(세로 진입 카드)
await page.waitForSelector(".screen.active .swapbtn", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .swapbtn").click());
await page.waitForSelector(".rot-overlay .rpl-stage-wide", { timeout: 9000 });
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelector(".rot-overlay .rpl-lens").click());
await page.waitForTimeout(400);
await page.screenshot({ path: "qa/shots/soc2-lab-lens.png" });
// 가로 무대 배치 — 논리 지도 좌표 → 화면 좌표 역변환 후 포인터 드래그(합성)
const place = async (id, lon, lat) => {
  await page.evaluate(({ tid, LON, LAT }) => {
    const crop = { x: 569, y: 94, w: 348, h: 190 };
    const stage = document.querySelector(".rot-overlay .rpl-stage-wide");
    const ov = document.querySelector(".rot-overlay").getBoundingClientRect();
    const mapBox = document.querySelector(".rot-overlay .rpl-map");
    const native = document.querySelector(".rot-inner").classList.contains("native");
    const L = parseFloat(mapBox.style.left);
    const T = parseFloat(mapBox.style.top);
    const MW = parseFloat(mapBox.style.width);
    const MH = parseFloat(mapBox.style.height);
    const sx = ((LON + 180) / 360) * 1000;
    const sy = ((90 - LAT) / 180) * 500;
    const lx = L + ((sx - crop.x) / crop.w) * MW;
    const ly = T + ((sy - crop.y) / crop.h) * MH;
    const p = native ? { x: ov.left + lx, y: ov.top + ly } : { x: ov.right - ly, y: ov.top + lx };
    const tok = document.querySelector(`.rot-overlay .rpl-token[data-r="${tid}"]`);
    const tr = tok.getBoundingClientRect();
    const pe = (type, x, y, target) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: x, clientY: y, isPrimary: true }));
    pe("pointerdown", tr.left + tr.width / 2, tr.top + tr.height / 2, tok);
    pe("pointermove", p.x, p.y, stage);
    pe("pointerup", p.x, p.y, stage);
  }, { tid: id, LON: lon, LAT: lat });
  await page.waitForTimeout(380);
};
await place("east", 107, 36);
await place("southeast", 102, 15);
await place("south", 78, 22);
await place("southwest", 45, 24);
await place("central", 67, 45);
await page.waitForTimeout(3600); // 토스트 사라진 뒤 지도만
await page.screenshot({ path: "qa/shots/soc2-lab-complete.png" });
await page.evaluate(() => document.querySelector(".rot-exit").click());
await page.waitForTimeout(700);
await fwd(1); // recap
await page.evaluate(() => document.querySelector(".screen.active .rc-card")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(500);
await page.screenshot({ path: "qa/shots/soc2-recap-more.png" });
await fwd(4); // 문제들 지나 사마르칸트 그림 문제(마지막 mcq)
await page.waitForTimeout(600);
await page.screenshot({ path: "qa/shots/soc2-figure-quiz.png" });

// ── L2: 계절풍 랩(여름 상태) ──
await openLesson("s1u2l2");
await fwd(2); // 훅 → hotspot → monsoonLab
await page.waitForSelector(".screen.active .spring-canvas", { timeout: 9000 });
await page.waitForTimeout(2200);
await page.screenshot({ path: "qa/shots/soc2-monsoon.png" });

// ── L3: 경관 figTabs(실사 — 모스크 탭) ──
await openLesson("s1u2l3");
await fwd(2); // 훅 → concept → figTabs
await page.waitForSelector(".screen.active .figtabs", { timeout: 9000 });
await page.evaluate(() => document.querySelectorAll(".screen.active .seg button")[2]?.click());
await page.waitForTimeout(700);
await page.screenshot({ path: "qa/shots/soc2-figtabs-mosque.png" });

// ── L6: 피라미드 판독실(카타르) ──
await openLesson("s1u2l6");
await fwd(2); // 훅 → concept → pyramidLab
await page.waitForSelector(".screen.active .pyr-zone", { timeout: 9000 });
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".screen.active .seg button")].find((x) => x.textContent.includes("카타르"));
  b?.click();
});
await page.waitForTimeout(800);
await page.screenshot({ path: "qa/shots/soc2-pyramid.png" });

console.log("SHOTS DONE → qa/shots/soc2-*.png");
await browser.close();
