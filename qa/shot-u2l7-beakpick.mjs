// L7 beakpick 훅 — "부리 모양이 정답 먹이로 날아가 집는" 연출 눈검수 + 이동량 실측.
// PORT=5211 node qa/shot-u2l7-beakpick.mjs  → qa/shots/u2l7-beak-*.png
// 주의: @vite/client를 route로 스텁하면 dev CSS가 통째로 죽는다 → 스텁하지 않는다.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
const BASE = `http://localhost:${PORT}`;
mkdirSync("qa/shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });

const openHook = async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true,
    }));
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson("u2l7");
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: () => {} }));
  });
  await page.waitForSelector(".screen.active .hb2-beakpick", { timeout: 10000 });
  await page.waitForTimeout(700);
};

// 부리 그룹의 실제 이동량(transform-box: view-box → 매트릭스는 뷰박스 user unit)
const probe = (page) => page.evaluate(() => {
  const root = document.querySelector(".screen.active");
  const arm = root?.querySelector(".hb2-bp-arm");
  if (!arm) return { dx: 0, dy: 0, foods: [], res: [], spark: [], helper: `무대 없음(${root?.className ?? "no screen"})` };
  const m = new DOMMatrix(getComputedStyle(arm).transform);
  const foods = [...root.querySelectorAll(".hb2-bp-food")].map((f) => f.getAttribute("class").replace("hb2-bp-food ", ""));
  const res = [...root.querySelectorAll(".hb2-bp-res")].map((r) => `${r.textContent.trim() || "-"}(${Number(getComputedStyle(r).opacity).toFixed(2)})`);
  const spark = [...root.querySelectorAll(".hb2-bp-spark")].map((s) => Number(getComputedStyle(s).opacity).toFixed(2));
  return {
    dx: +m.e.toFixed(1), dy: +m.f.toFixed(1), foods, res, spark,
    helper: root.querySelector(".hook-helper, .hk-helper, .helper")?.innerText.replace(/\s+/g, " ").trim().slice(0, 60) ?? "",
  };
});

const errs = [];
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => errs.push(e.message));
await openHook(page);

const shot = async (name) => {
  await page.screenshot({ path: `qa/shots/u2l7-beak-${name}.png`, timeout: 15000 });
  console.log("SHOT", name);
};

const chipLabels = await page.evaluate(() =>
  [...document.querySelectorAll(".screen.active .hb2-chip")].map((c) => c.textContent.trim()));
console.log("칩 라벨:", chipLabels.join(" / "));
await shot("0-intro");

const names = ["clip", "tweez", "spoon"];
for (let i = 0; i < 3; i++) {
  await page.evaluate((idx) => {
    document.querySelectorAll(".screen.active .hb2-chip")[idx]?.click();
  }, i);
  await page.waitForTimeout(160);
  await page.evaluate(() => document.querySelector(".screen.active .hb2-action")?.click());
  await page.waitForTimeout(180);
  const early = await probe(page);
  await page.waitForTimeout(150);
  const flying = await probe(page);
  await shot(`${i + 1}-${names[i]}-fly`);
  await page.waitForTimeout(500); // 도착(620) + 쪼기 시작
  const pecking = await probe(page);
  await page.waitForTimeout(500);
  const landed = await probe(page);
  await shot(`${i + 1}-${names[i]}-pick`);
  await page.locator(".screen.active .hb2-beakpick").screenshot({ path: `qa/shots/u2l7-beak-${i + 1}-${names[i]}-stage.png`, timeout: 15000 });
  console.log(`[${names[i]}] 0.18s dx=${early.dx} | 0.33s dx=${flying.dx} dy=${flying.dy} | 쪼는중 dx=${pecking.dx} dy=${pecking.dy} | 결과 ${landed.res.join(" ")} 먹이 ${landed.foods.join(" ")} 반짝 ${landed.spark.join(" ")}`);
  console.log(`   helper: ${landed.helper}`);
  await page.waitForTimeout(1400); // 대기 위치 복귀 + 다음 부리 선택
}

await page.waitForTimeout(1400);
const ended = await page.evaluate(() => {
  const root = document.querySelector(".screen.active");
  return {
    q: root.querySelector(".hook-q")?.innerText.replace(/\s+/g, " ").trim() ?? "",
    choices: [...root.querySelectorAll(".hook-choice")].map((c) => c.innerText.replace(/\s+/g, " ").trim()),
  };
});
console.log("예측 질문:", ended.q);
console.log("예측 보기:", ended.choices.join(" | "));
await shot("4-predict");

// reduced-motion — 이동 없이 결과만 즉시
const rm = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
rm.on("pageerror", (e) => errs.push(e.message));
await openHook(rm);
await rm.evaluate(() => document.querySelector(".screen.active .hb2-action")?.click());
await rm.waitForTimeout(260);
const rmState = await probe(rm);
console.log(`[reduced] dx=${rmState.dx} dy=${rmState.dy} 결과 ${rmState.res.join(" ")} 먹이 ${rmState.foods.join(" ")}`);
await rm.screenshot({ path: "qa/shots/u2l7-beak-5-reduced.png", timeout: 15000 });
console.log("SHOT 5-reduced");

if (errs.length) console.log("PAGEERROR:", errs.join(" / "));
await browser.close();
console.log(errs.length ? "DONE (에러 있음)" : "DONE");
