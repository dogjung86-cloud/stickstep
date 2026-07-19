// 중2 수학 Ⅴ 실사용 피드백 4건(2026-07-20) 재현·검수 샷.
// PORT=<포트> node qa/shot-m2u5-fixfeedback.mjs  (dev 서버 필수)
// ① shapeLock: "의뢰/의뢰서 원본/후보 실루엣" 텍스트 + AB 비 1:2 표기
// ② midpoint: 거리 박스가 도형 꼭짓점을 가리는 상태(연결 직후·A 위로 드래그)
// ③ pytha: 국면 3 a·b 스테퍼 시점의 도형 내 a/b 표기
// ④ rightCheck: 저울 판정 화면(계산식·접시 라벨 가독성)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const done = { done: true, acc: 100, bestXp: 10 };
  const lessons = {};
  for (let u = 1; u <= 4; u++) for (let l = 1; l <= 10; l++) lessons[`m2u${u}l${l}`] = done;
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 0,
    lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });

const openLesson = async (id) => {
  await page.reload({ waitUntil: "networkidle" });
  await W(1100);
  await page.evaluate(async (id) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(id).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(800);
};
const clickBtn = async (re, wait = 500) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".screen.active button")]
      .filter((x) => x.offsetParent && !x.disabled)
      .find((x) => new RegExp(re).test(x.textContent) || new RegExp(re).test(x.getAttribute("aria-label") ?? ""));
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (!t) throw new Error(`clickBtn 실패: /${re}/`);
  await W(wait);
};
const waitBtn = async (re, wait = 500, timeout = 20000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll(".screen.active button")].some(
      (b) => b.offsetParent && !b.disabled && (new RegExp(re).test(b.textContent) || new RegExp(re).test(b.getAttribute("aria-label") ?? "")),
    ),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const clickCTA = async (timeout = 26000) => {
  await page.waitForFunction(() => { const b = document.querySelector(".screen.active button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(600);
};
const hookPlay = async () => {
  for (let i = 0; i < 7; i++) {
    if (await page.$(".screen.active .hook-choices .hook-choice")) break;
    const t = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".screen.active .swapbtn")].find((x) => x.offsetParent && !x.disabled);
      if (b) { b.click(); return true; }
      return false;
    });
    await W(t ? 2600 : 900);
  }
  await page.waitForSelector(".screen.active .hook-choices .hook-choice", { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices .hook-choice").click());
  await W(500);
  await clickCTA();
};
const mq6 = async (re, wait = 2100) => {
  await page.waitForSelector(".screen.active .mq6-choice", { timeout: 16000 });
  await page.evaluate((re) => {
    const list = [...document.querySelectorAll(".screen.active .mq6-choice")].filter((b) => b.offsetParent && !b.disabled);
    (list.find((b) => new RegExp(re).test(b.textContent)) ?? list[0])?.click();
  }, re);
  await W(wait);
};
const svgPt = async (fn) => page.evaluate(fn);
const labFire = async (pts, wait = 600) => {
  await page.evaluate(async (pts) => {
    const svg = document.querySelector(".screen.active .mcl-plane svg");
    if (!svg) return;
    const vb = svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    const cx = (x) => r.left + ((x - vb.x) / vb.width) * r.width;
    const cy = (y) => r.top + ((y - vb.y) / vb.height) * r.height;
    const fire = (t, x, y) =>
      svg.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 44, isPrimary: true, clientX: cx(x), clientY: cy(y) }));
    fire("pointerdown", pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      for (let k = 1; k <= 5; k++) {
        fire("pointermove", x0 + ((x1 - x0) * k) / 5, y0 + ((y1 - y0) * k) / 5);
        await new Promise((res) => setTimeout(res, 26));
      }
    }
    fire("pointerup", pts[pts.length - 1][0], pts[pts.length - 1][1]);
  }, pts);
  await W(wait);
};
const svgClick = async (sel, wait = 500) => {
  await page.evaluate((sel) => {
    document.querySelector(`.screen.active ${sel}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, sel);
  await W(wait);
};

/* ── ② midpointLab(l7): 연결 직후 + A 위로 드래그 ── */
await openLesson("m2u5l7");
await hookPlay();
await page.waitForSelector(".screen.active .mcl-plane svg", { timeout: 12000 });
await W(400);
await labFire([[110.5, 133], [110.5, 133]], 400); // M 탭
await labFire([[229.5, 133], [229.5, 133]], 2400); // N 탭 → 연결
await shot("m2u5-mid-linked");
await labFire([[170, 48], [130, 44], [92, 40]], 500); // A를 왼쪽 위로
await shot("m2u5-mid-morph1");
await labFire([[92, 40], [180, 38], [262, 38]], 500); // A를 오른쪽 위로
await shot("m2u5-mid-morph2");
console.log("midpoint 샷 3장");

/* ── ① shapeLockLab(l4): 의뢰 ② 화면 ── */
await openLesson("m2u5l4");
await hookPlay();
await page.waitForSelector(".screen.active .slk-cards", { timeout: 12000 });
await W(400);
await shot("m2u5-slk-phase1");
await clickBtn("정보 카드 ∠B 40°", 900);
await clickBtn("정보 카드 ∠C 65°", 3600);
await waitBtn("다음 의뢰 받기", 900);
await shot("m2u5-slk-phase2");
await clickBtn("정보 카드 AB", 700);
await clickBtn("정보 카드 BC", 900);
await shot("m2u5-slk-phase2-open");
console.log("shapeLock 샷 3장");

/* ── ③ pythaLab(l10): 국면 3 스테퍼 ── */
await openLesson("m2u5l10");
await hookPlay();
await page.waitForSelector(".screen.active .pyl-sq", { timeout: 12000 });
await svgClick('[data-sq="a"]', 1200);
await svgClick('[data-sq="b"]', 1600);
await svgClick('[data-sq="c"]', 3400);
await waitBtn("증명 퍼즐로 밝히기", 900);
await shot("m2u5-pytha-frames");
await waitBtn("삼각형 옮겨 담기", 2600);
await mq6("같아요", 3200);
await W(600);
await shot("m2u5-pytha-phase3");
await clickBtn("a 키우기", 700);
await shot("m2u5-pytha-phase3b");
console.log("pytha 샷 3장");

/* ── ④ rightCheckLab(l11): 세트 ① 판정 ── */
await openLesson("m2u5l11");
await hookPlay();
await page.waitForSelector(".screen.active .rck-cards", { timeout: 12000 });
await W(300);
await shot("m2u5-rck-cards");
await clickBtn("조립하기", 3600);
await shot("m2u5-rck-verdict");
console.log("rightCheck 샷 2장");

await browser.close();
console.log("DONE — qa/shots/m2u5-*.png");
