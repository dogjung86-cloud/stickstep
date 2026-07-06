// VII 수정 검증 샷 — node qa/shot-u7fix.mjs (dev 5173 필요)
// 일식 가로 / 태양계 투어 가로 / 훅 실사 3종 / 마지막 레슨 문제1 그림을 캡처한다.
import { chromium } from "playwright-core";

const OUT = process.argv[2] ?? "qa/u7fix";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  const done = { done: true, acc: 100, bestXp: 60 };
  const lessons = {};
  ["u7l1", "u7l2", "u7l3", "u7l4", "u7l5", "u7l6"].forEach((id) => (lessons[id] = { ...done }));
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "중1", goalMin: 10, streak: 1,
    lastStudyDay: "2026-07-07", totalXp: 500, lessons, minigame: {},
  }));
});

const freeze = () => page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
const shot = async (name) => {
  await freeze();
  await page.screenshot({ path: `${OUT}-${name}.png` });
  console.log("SAVED", name);
};
const clickText = (re) => page.evaluate((re) => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
    .find((x) => new RegExp(re).test(x.textContent || "") || new RegExp(re).test(x.getAttribute("aria-label") || ""));
  if (b) b.click();
  return !!b;
}, re);
const openLesson = async (label) => {
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await clickText("VII\\. 태양계");
  await page.waitForTimeout(500);
  await page.evaluate((label) => {
    const n = [...document.querySelectorAll(".screen.active .gm-node")].find((x) => (x.getAttribute("aria-label") || "").includes(label));
    n?.click();
  }, label);
  await page.waitForTimeout(800);
};
const fwd = async (n = 1) => {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForTimeout(450);
  }
};

// 1) 일식과 월식 — 가로 진입
await openLesson("일식과 월식");
await fwd(1);
await clickText("가로 화면으로");
await page.waitForTimeout(2400);
await shot("eclipse-land");
// 기울기 모드 켜고 달을 태양 쪽으로 끌어 빗나감 장면
await clickText("왜 매달 안");
await page.waitForTimeout(1400);
await page.evaluate(() => {
  const cv = document.querySelector(".sp3-canvas");
  const r = cv.getBoundingClientRect();
  // 가로 좌표(lx,ly) → 화면: clientY = top + lx, clientX = right - ly
  const fire = (type, lx, ly, id = 9) => cv.dispatchEvent(new PointerEvent(type, {
    bubbles: true, pointerId: id, isPrimary: true,
    clientX: r.right - ly, clientY: r.top + lx,
  }));
  const W = innerHeight, H = innerWidth; // 가로 무대 크기
  fire("pointerdown", W * 0.5, H * 0.55);
  for (let i = 1; i <= 10; i++) fire("pointermove", W * (0.5 - 0.03 * i), H * 0.55);
  fire("pointerup", W * 0.2, H * 0.55);
});
await page.waitForTimeout(1200);
await shot("eclipse-tilt");

// 2) 태양계 투어 — 가로 진입 + 목성 포커스
await openLesson("태양계 식구들");
await fwd(1);
await clickText("가로 화면으로");
await page.waitForTimeout(2600);
await shot("tour-overview");
// 핀치 줌인(두 손가락)
await page.evaluate(() => {
  const cv = document.querySelector(".sp3-canvas");
  const r = cv.getBoundingClientRect();
  const fire = (type, lx, ly, id) => cv.dispatchEvent(new PointerEvent(type, {
    bubbles: true, pointerId: id, isPrimary: id === 11,
    clientX: r.right - ly, clientY: r.top + lx,
  }));
  const W = innerHeight, H = innerWidth;
  fire("pointerdown", W * 0.5 - 40, H * 0.5, 11);
  fire("pointerdown", W * 0.5 + 40, H * 0.5, 12);
  for (let i = 1; i <= 8; i++) {
    fire("pointermove", W * 0.5 - 40 - i * 14, H * 0.5, 11);
    fire("pointermove", W * 0.5 + 40 + i * 14, H * 0.5, 12);
  }
  fire("pointerup", 0, 0, 11);
  fire("pointerup", 0, 0, 12);
});
await page.waitForTimeout(1400);
await shot("tour-zoomed");

// 3) 훅 실사 — 행성 크기(목성), 별보기(토성), 달 사진
await openLesson("행성 분류");
await page.waitForTimeout(400);
await shot("hook-planetsize");
await openLesson("태양계 식구들");
await page.waitForTimeout(400);
await page.evaluate(() => document.querySelector(".hk-space-hit")?.click());
await page.waitForTimeout(900);
await shot("hook-stargaze");
await openLesson("달의 위상");
await page.waitForTimeout(400);
await clickText("오늘 밤 사진 보기");
await page.waitForTimeout(900);
await shot("hook-moonpic");

// 4) 일식 레슨 문제 1 — 손전등 모형 그림
await openLesson("일식과 월식");
await fwd(3);
await shot("quiz-eclipse-model");

await browser.close();
console.log("DONE");
