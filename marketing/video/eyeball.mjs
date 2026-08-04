// 마케팅 영상 후보 장면 눈검수 샷 — PORT=5311 dev 서버 필요
// node eyeball.mjs  → shots/*.png
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app/package.json의 playwright-core를 재사용(marketing/video → app 두 단계 위)
const requireApp = createRequire(path.join(__dirname, "..", "..", "package.json"));
const { chromium } = requireApp("playwright-core");

const PORT = process.env.PORT || "5311";
const OUT = path.join(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);

const DONE_IDS = ["u3l1", "u4l2", "u4l3", "u5l3", "u6l2", "u7l5", "u7l6", "g2u3l1", "g2u3l6"];
await page.addInitScript((ids) => {
  const lessons = {};
  ids.forEach((id) => (lessons[id] = { done: true, acc: 1, bestXp: 10 }));
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null,
      totalXp: 120, lessons, minigame: {},
    }),
  );
}, DONE_IDS);

await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// ── 스플래시 정착 장면(CTA 후보) ──
await page.waitForSelector("#sc-splash", { timeout: 25000 });
await page.waitForTimeout(2600); // 플립북 1바퀴 + study 정착 + 워드마크
await page.screenshot({ path: path.join(OUT, "splash-settle.png") });

// 홈 진입
await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click(); });
await page.waitForSelector("#sc-home", { timeout: 15000 });
await page.waitForTimeout(700);

// 단원 지도 몇 장 (u3 열 / u4 물질 / u7 우주)
for (const [i, name] of [[2, "home-u3"], [3, "home-u4"], [6, "home-u7"]]) {
  await page.evaluate((k) => document.querySelectorAll(".unit-tab")[k]?.click(), i);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
}

const jump = async (lessonId) => {
  const steps = await page.evaluate(async (id) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(id);
    if (!found) return null;
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: () => {} }));
    return found.lesson.steps.map((s) => s.type);
  }, lessonId);
  await page.waitForTimeout(800);
  return steps;
};

const fwdTo = async (idx) => {
  for (let k = 0; k < idx; k++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForTimeout(450);
  }
};

// [레슨, 목표 스텝 타입, 샷 이름, 추가 대기(ms)]
const TARGETS = [
  ["u3l1", "heatParticles", "lab-heatParticles", 1200],
  ["u4l2", null, "lab-u4l2", 1500],
  ["u5l3", "comic", "comic-newton", 1200],
  ["u6l2", "comic", "comic-boyle", 1200],
  ["u6l2", "boyleSyringe", "lab-boyleSyringe", 1200],
  ["u7l5", "moonPhase3d", "lab-moonPhase3d", 3000],
  ["u7l6", "eclipse3d", "lab-eclipse3d", 3000],
  ["g2u3l1", "reflectLab", "lab-reflectLab", 1200],
  ["g2u3l6", "colorMixLab", "lab-colorMixLab", 1200],
];

for (const [lesson, type, name, wait] of TARGETS) {
  const steps = await jump(lesson);
  if (!steps) { console.log("MISS", lesson); continue; }
  console.log(lesson, "steps:", steps.join(","));
  let idx = type ? steps.indexOf(type) : Math.min(1, steps.length - 1);
  if (idx < 0) { console.log("  no step", type); continue; }
  await fwdTo(idx);
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log("  shot →", name);
}

await browser.close();
console.log("DONE");
