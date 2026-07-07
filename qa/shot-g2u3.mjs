// 중2 III — 주요 화면 스크린샷(시각 품질 검수용). PORT=5174 node qa/shot-g2u3.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  for (let i = 1; i <= 8; i++) lessons[`g2u3l${i}`] = { done: true, acc: 95, bestXp: 120 };
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "중2", goalMin: 10, streak: 3,
    lastStudyDay: null, totalXp: 480, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/g2u3-${name}.png` });
  console.log("shot:", name);
};
const clickBtn = async (re, wait = 420) => {
  await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
      .find((x) => new RegExp(re).test(x.textContent));
    b?.click();
  }, re);
  await W(wait);
};
const clickCTA = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector("button.cta");
    return b && !b.disabled;
  }, { timeout: 16000 });
  await page.evaluate(() => document.querySelector("button.cta").click());
  await W(600);
};
const hookChoice = async (idx) => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 9000 });
  await page.evaluate((idx) => document.querySelectorAll(".hook-choices.show .hook-choice")[idx].click(), idx);
  await W(380);
};
const canvasPtr = async (calc, wait = 150) => {
  const r = await page.evaluate(() => {
    const b = document.querySelector(".step canvas").getBoundingClientRect();
    return { left: b.left, top: b.top, width: b.width, height: b.height };
  });
  const pts = calc(r.width, r.height);
  await page.evaluate(([pts, left, top]) => {
    const cv = document.querySelector(".step canvas");
    for (const [type, x, y] of pts) {
      cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, isPrimary: true, pointerType: "touch", clientX: left + x, clientY: top + y }));
    }
  }, [pts, r.left, r.top]);
  await W(wait);
};
const angleSet = (deg, pivot) => canvasPtr((w, h) => {
  const P = { x: w / 2, y: pivot(w, h) };
  const rad = (deg * Math.PI) / 180;
  return [["pointerdown", P.x + Math.sin(rad) * 140, P.y - Math.cos(rad) * 140], ["pointerup", P.x + Math.sin(rad) * 140, P.y - Math.cos(rad) * 140]];
}, 250);
const openLesson = async (idx) => {
  // 홈에서 중2 탭 → idx번째 노드(완료/현재 무관하게 강제 열기 위해 노드 직접 클릭 — done 시딩으로 l1·l2는 열림)
  await page.evaluate(() => {
    const t = [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.includes("중2"));
    t?.click();
  });
  await W(700);
  await page.evaluate((idx) => {
    document.querySelectorAll(".gm-node")[idx]?.click();
  }, idx);
  await W(900);
};
const exitLesson = async () => {
  await page.evaluate(() => [...document.querySelectorAll(".lheader .xbtn")].at(-1)?.click());
  await W(800);
};

// 1) 홈 — 중2 지도
await page.evaluate(() => {
  const t = [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.includes("중2"));
  t?.click();
});
await W(800);
await shot("home");

// 2) L1 훅(마을 거울 s3) + 반사 랩 60° + 난반사 돋보기
await page.evaluate(() => document.querySelectorAll(".gm-node")[0]?.click());
await W(900);
await clickBtn("거울 돌리기", 450);
await clickBtn("거울 돌리기", 450);
await clickBtn("거울 돌리기", 800);
await shot("l1-hook");
await clickCTA();
const mirPivot = (w, h) => h - 64;
await angleSet(52, mirPivot);
await angleSet(20, mirPivot);
await W(600);
await angleSet(56, mirPivot);
await W(400);
await shot("l1-reflect");
// 예측 응답 후 60° → 과녁 단계까지
await hookChoice(1);
await angleSet(60, mirPivot);
await W(900);
await shot("l1-aim");
await angleSet(34, mirPivot);
await W(900);
await clickCTA();
await clickBtn("울퉁불퉁", 500);
await canvasPtr((w, h) => [["pointerdown", 26 + (w - 52) * 0.5, h - 82], ["pointerup", 26 + (w - 52) * 0.5, h - 82]], 400);
await shot("l1-diffuse");
await exitLesson();

// 3) L2 굴절 랩 55°
await openLesson(1);
await clickBtn("물 붓기", 1000);
await shot("l2-hook");
await hookChoice(0);
await W(300);
await clickCTA();
const ifPivot = (w, h) => h * 0.52;
await angleSet(55, ifPivot);
await W(500);
await shot("l2-refract");
await exitLesson();

// 4) L3 seeLab — 미션 2까지 진행한 화면
await openLesson(2);
await clickBtn("전등 켜기", 1000);
await hookChoice(0);
await W(300);
await clickCTA();
const tapC = (fx, fy) => canvasPtr((w, h) => [["pointerdown", fx(w, h), fy(w, h)], ["pointerup", fx(w, h), fy(w, h)]], 400);
await tapC((w) => w * 0.13, () => 86);
await tapC((w) => w * 0.6 - 4, (w, h) => h - 170);
await W(400);
await tapC((w) => w * 0.13, () => 86);
await tapC((w) => w * 0.86, (w, h) => h - 92);
await tapC((w) => w * 0.6 - 4, (w, h) => h - 170);
await W(700);
await shot("l3-see");
await exitLesson();

// 5) L4 작도소 — 연장선 켠 화면
await openLesson(3);
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => document.querySelector(".hlm")?.click());
  await W(420);
}
await hookChoice(0);
await W(300);
await clickCTA();
await clickBtn("연장", 600);
await shot("l4-mirror");
await exitLesson();

// 6) L5 벤치 — 가로(오목 거울 가까이 = 확대 정립)
await openLesson(4);
await clickBtn("볼록한 뒷면", 1200);
await shot("l5-hook");
await clickCTA();
await clickBtn("가로 화면", 1500);
await page.waitForSelector(".rot-overlay.in .sp3-canvas", { timeout: 9000 });
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".lb-seg button")].find((x) => x.textContent === "오목 거울");
  b?.click();
});
await W(500);
await page.evaluate(() => {
  const overlay = document.querySelector(".rot-overlay");
  const cv = overlay.querySelector(".sp3-canvas");
  const r = overlay.getBoundingClientRect();
  const w = window.innerHeight;
  const h = window.innerWidth;
  const dx = w * 0.62;
  const fire = (type, sx, sy) => cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 9, isPrimary: true, pointerType: "touch", clientX: r.right - sy, clientY: r.top + sx }));
  fire("pointerdown", dx - 230, h * 0.56);
  fire("pointermove", dx - 90, h * 0.56);
  fire("pointerup", dx - 90, h * 0.56);
});
await W(600);
await shot("l5-bench");
await page.evaluate(() => document.querySelector(".rot-exit")?.click());
await W(800);
await exitLesson();

// 7) L6 — 조명 스튜디오(초록 조명) + 스포트라이트 + 화소
await openLesson(5);
await page.evaluate(() => document.querySelector(".hlp")?.click());
await W(1100);
await shot("l6-hook");
await hookChoice(0);
await W(300);
await clickCTA();
await hookChoice(2);
await W(300);
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".stage-hud .seg button")].find((x) => x.textContent === "초록");
  b?.click();
});
await W(600);
await shot("l6-objcolor");
for (const name of ["빨간", "초록", "파란"]) {
  await page.evaluate((name) => {
    const b = [...document.querySelectorAll(".stage-hud .seg button")].find((x) => x.textContent === name);
    b?.click();
  }, name);
  await W(400);
}
await clickCTA();
const dragL = (fx0, fy0, fx1, fy1) => canvasPtr((w, h) => [
  ["pointerdown", fx0 * w, fy0 * h], ["pointermove", ((fx0 + fx1) / 2) * w, ((fy0 + fy1) / 2) * h],
  ["pointermove", fx1 * w, fy1 * h], ["pointerup", fx1 * w, fy1 * h],
], 350);
await dragL(0.7, 0.34, 0.44, 0.42);
await dragL(0.5, 0.72, 0.36, 0.52);
await shot("l6-mix");
await dragL(0.44, 0.42, 0.7, 0.34);
await dragL(0.36, 0.52, 0.5, 0.72);
await W(200);
// 화소 랩까지는 이동 생략(스크린샷 전용) — 나가기
await exitLesson();

// 8) L7 물결 수조 — 자동 진동 + 이름표
await openLesson(6);
await clickBtn("돌 던지기", 1000);
await shot("l7-hook");
await hookChoice(0);
await W(300);
await clickCTA();
await clickBtn("자동 진동 켜기", 2600);
await clickBtn("이름표", 700);
await shot("l7-wave");
await exitLesson();

// 9) L8 소리 — 톱니 고음
await openLesson(7);
await clickBtn("긴 막대", 600);
await clickBtn("짧은 막대", 800);
await shot("l8-hook");
await hookChoice(0);
await W(300);
await clickCTA();
await clickBtn("소리 켜기", 500);
await page.evaluate(() => {
  const rows = document.querySelectorAll(".px-sliders.show .px-sl");
  const tr = rows[1].querySelector(".px-track").getBoundingClientRect();
  for (const type of ["pointerdown", "pointerup"]) {
    rows[1].dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 11, isPrimary: true, clientX: tr.left + tr.width * 0.85, clientY: tr.top + 8 }));
  }
});
await clickBtn("바이올린풍", 500);
await shot("l8-sound");
await exitLesson();

console.log("done");
await browser.close();
