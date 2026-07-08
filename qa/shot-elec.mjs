// 중2 VII 피드백 반영분 시각 검증 스크린샷. PORT=5199 node qa/shot-elec.mjs → qa/shots/elec-*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5199";
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  ["g2u7l1","g2u7l2","g2u7l3","g2u7l4","g2u7l5","g2u7l6","g2u7l7","g2u7l8"].forEach((id) => lessons[id] = { done: true, acc: 95, bestXp: 120 });
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", premium: true, reviewMode: false,
    goalMin: 10, streak: 2, lastStudyDay: null, totalXp: 1600, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const W = (ms) => page.waitForTimeout(ms);
const mount = async (id) => {
  await page.evaluate(async (id) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(id).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(1000);
};
const fwd = async (n) => {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => document.querySelector(".screen.lesson-screen:last-of-type .xbtn.fwd")?.click());
    await W(520);
  }
};
const shot = async (name, full = true) => {
  await page.screenshot({ path: `qa/shots/elec-${name}.png`, fullPage: full });
  console.log("SHOT", name);
};
const clickBtn = async (re, wait = 500) => {
  await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    b?.click();
  }, re);
  await W(wait);
};

// L1 훅(발주 컷 쌍) — 두 장면 탭 후
await mount("g2u7l1");
await page.evaluate(() => document.querySelectorAll(".he-wcard")[0]?.click());
await W(400);
await page.evaluate(() => document.querySelectorAll(".he-wcard")[1]?.click());
await W(600);
await shot("l1-hook");

// L2 유도 랩(원판 깡통 굴림) — 막대를 깡통 쪽으로
await mount("g2u7l2");
await fwd(1);
await page.evaluate(() => {
  const cv = document.querySelector(".screen.lesson-screen:last-of-type .stage canvas");
  const b = cv.getBoundingClientRect();
  for (const type of ["pointerdown", "pointerup"])
    cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, isPrimary: true, pointerType: "touch", clientX: b.left + 150, clientY: b.top + 200 }));
});
await W(2800);
await shot("l2-induction-lab", false);
await fwd(1);
await shot("l2-concept-cut");

// L3 물레방아 가로 랩 + 회로 개념 사진 + 문제 그림
await mount("g2u7l3");
await fwd(1);
await clickBtn("가로 화면", 1800);
await page.waitForSelector(".rot-overlay.in canvas", { timeout: 9000 });
await W(1200);
await shot("l3-water-landscape", false);
await page.evaluate(() => document.querySelector(".rot-exit")?.click());
await W(900);
await shot("l3-water-preview", false);
await fwd(1);
await shot("l3-concept-circuit");
await fwd(2);
await shot("l3-quiz-circuit");

// L4 옴 랩 — 저항 바꾸기 모드 곡선
await mount("g2u7l4");
await fwd(1);
await W(600);
await clickBtn("저항 바꾸기", 600);
await clickBtn("이 지점 기록", 450);
await clickBtn("길이 2배", 350);
await clickBtn("이 지점 기록", 450);
await clickBtn("길이 3배", 350);
await clickBtn("이 지점 기록", 1200);
await shot("l4-ohm-inverse", false);

// L5 회로 실험대 — 세그가 무대 밖, 전구 가림 없음
await mount("g2u7l5");
await fwd(1);
await W(500);
await page.evaluate(() => {
  const cv = document.querySelector(".screen.lesson-screen:last-of-type .stage canvas");
  cv.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
});
await W(900);
await shot("l5-circuit-lab", false);

// L7 코일 자기장(전류 방향 확인용) + 오른손 팁
await mount("g2u7l7");
await fwd(1);
await W(500);
await clickBtn("전류 켜기", 1600);
await shot("l7-coil-on", false);
await fwd(1);
await shot("l7-grip-tip");

// L8 3D 그네(라벨) + 그림 정리 + 전동기
await mount("g2u7l8");
await fwd(1);
await W(1600);
await clickBtn("전류 켜기", 1800);
await shot("l8-swing3d", false);
await fwd(1);
await shot("l8-swing-palm");
await fwd(1);
await shot("l8-motor");

await browser.close();
console.log("DONE");
