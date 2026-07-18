// probe-wpl.mjs — worldPlaceLab 실입력(마우스/터치) 재현 프로브. PORT=<포트> node qa/probe-wpl.mjs
// e2e의 합성 dispatchEvent와 달리 page.mouse/touchscreen을 써서 실제 히트테스트를 태운다.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "2943";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 120));
});

await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10 }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);

await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");
  if (!st.isDone("s1u1l2")) st.completeLesson("s1u1l2", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u1l2").lesson, () => {}));
});
await page.waitForTimeout(800);
await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(600);
// 실클릭으로 가로 진입
await page.click(".screen.active .swapbtn");
await page.waitForSelector(".rot-overlay .wpl-stage", { timeout: 9000 });
await page.waitForTimeout(800);

const rectOf = (sel) =>
  page.evaluate((s) => {
    const el2 = document.querySelector(s);
    if (!el2) return null;
    const r = el2.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }, sel);

console.log("native:", await page.evaluate(() => document.querySelector(".rot-inner")?.classList.contains("native")));

// 1) 기후 안경 — 실클릭
const lensR = await rectOf(".wpl-lens");
console.log("lens rect:", lensR);
await page.mouse.click(lensR.x, lensR.y);
await page.waitForTimeout(400);
console.log("lens on:", await page.evaluate(() => document.querySelector(".wpl-lens")?.classList.contains("on")));

// 2) 토큰 실드래그 — 순록을 지도 중앙 위(시베리아 근처)로
const tokR = await rectOf('.wpl-token[data-t="reindeer"]');
console.log("token rect:", tokR);
// 논리 지도 좌표(시베리아 100E, 71N) → 화면 좌표
const target = await page.evaluate(() => {
  const ov = document.querySelector(".rot-overlay").getBoundingClientRect();
  const native = document.querySelector(".rot-inner").classList.contains("native");
  const mapBox = document.querySelector(".wpl-map");
  const L = parseFloat(mapBox.style.left), T = parseFloat(mapBox.style.top);
  const MW = parseFloat(mapBox.style.width), MH = parseFloat(mapBox.style.height);
  const sx = ((100 + 180) / 360) * 1000, sy = ((90 - 71) / 180) * 500;
  const lx = L + (sx / 1000) * MW, ly = T + ((sy - 14) / 400) * MH;
  return native ? { x: ov.left + lx, y: ov.top + ly } : { x: ov.right - ly, y: ov.top + lx };
});
console.log("drop target(screen):", target);
await page.mouse.move(tokR.x, tokR.y);
await page.mouse.down();
await page.waitForTimeout(120);
await page.mouse.move(target.x, target.y, { steps: 8 });
await page.waitForTimeout(120);
await page.mouse.up();
await page.waitForTimeout(500);
console.log("after drag:", await page.evaluate(() => ({
  marks: document.querySelectorAll(".wpl-mark").length,
  toast: document.querySelector(".wpl-toast")?.textContent?.slice(0, 30),
  pill: document.querySelectorAll(".wpl-pill span")[1]?.textContent?.slice(0, 30),
  armed: document.querySelectorAll(".wpl-token.armed").length,
  done: document.querySelectorAll(".wpl-token.done").length,
})));

// 3) 탭-탭 경로 — 오아시스 탭 후 사하라 탭 (터치로)
const tok2 = await rectOf('.wpl-token[data-t="oasis"]');
await page.touchscreen.tap(tok2.x, tok2.y);
await page.waitForTimeout(300);
console.log("armed after tap:", await page.evaluate(() => document.querySelectorAll(".wpl-token.armed").length));
const sahara = await page.evaluate(() => {
  const ov = document.querySelector(".rot-overlay").getBoundingClientRect();
  const native = document.querySelector(".rot-inner").classList.contains("native");
  const mapBox = document.querySelector(".wpl-map");
  const L = parseFloat(mapBox.style.left), T = parseFloat(mapBox.style.top);
  const MW = parseFloat(mapBox.style.width), MH = parseFloat(mapBox.style.height);
  const sx = ((10 + 180) / 360) * 1000, sy = ((90 - 23) / 180) * 500;
  const lx = L + (sx / 1000) * MW, ly = T + ((sy - 14) / 400) * MH;
  return native ? { x: ov.left + lx, y: ov.top + ly } : { x: ov.right - ly, y: ov.top + lx };
});
await page.touchscreen.tap(sahara.x, sahara.y);
await page.waitForTimeout(500);
console.log("after tap-tap:", await page.evaluate(() => ({
  marks: document.querySelectorAll(".wpl-mark").length,
  toast: document.querySelector(".wpl-toast")?.textContent?.slice(0, 30),
  done: document.querySelectorAll(".wpl-token.done").length,
})));

await browser.close();
