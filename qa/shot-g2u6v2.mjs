// 중2 Ⅵ 동물과 에너지 v2 — 스텝 화면 캡처(눈 검수용).
//   PORT=3000 node qa/shot-g2u6v2.mjs           전체
//   PORT=3000 LESSON=g2u6l4 node qa/shot-g2u6v2.mjs   한 레슨만
// 결과: tmp/g2u6v2-shots/<레슨>-<번호>-<타입>.png
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const PORT = process.env.PORT || "5173";
const ONLY = process.env.LESSON || "";
const DIR = "tmp/g2u6v2-shots";
await mkdir(DIR, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let errs = 0;
page.on("pageerror", (e) => { errs++; console.log("PAGEERROR:", e.message); });
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 160)); });

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800,
    lessons: {}, minigame: {},
  }));
});
// HMR 리로드 면역 — 동시 세션이 파일을 저장해도 이 캡처가 날아가지 않게 한다.
// **updateStyle은 진짜로 동작시켜야 한다**(no-op으로 두면 dev CSS가 통째로 안 붙는다 — 실제로 겪은 사고).
await page.route("**/@vite/client", (r) =>
  r.fulfill({
    contentType: "application/javascript",
    body: `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`,
  }),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);

const W = (ms) => page.waitForTimeout(ms);

async function openLesson(id) {
  return page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    if (!found) throw new Error("레슨 없음: " + lessonId);
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: () => {} }));
    return found.lesson.steps.map((s) => s.type);
  }, id);
}

// 검토 모드의 자유 이동 화살표(.xbtn.fwd)로 스텝을 넘긴다 — CTA 게이트와 무관하게 전 스텝 검수.
const forward = () =>
  page.evaluate(() => {
    const fwd = document.querySelector(".screen.active .xbtn.fwd");
    if (fwd && fwd.style.visibility !== "hidden") { fwd.click(); return "fwd"; }
    return "none";
  });

const LESSONS = ["g2u6l1", "g2u6l2", "g2u6l3", "g2u6l4", "g2u6l5", "g2u6l6", "g2u6l7", "g2u6l8", "g2u6l9", "g2u6l10", "g2u6l11", "g2u6l12"].filter((l) => !ONLY || l === ONLY);

for (const id of LESSONS) {
  const types = await openLesson(id);
  await W(900);
  console.log(`\n== ${id} — ${types.length}스텝: ${types.join(" → ")}`);
  for (let i = 0; i < types.length; i++) {
    await W(650);
    const name = `${id}-${String(i).padStart(2, "0")}-${types[i]}`;
    await page.screenshot({ path: `${DIR}/${name}.png` });
    if (i < types.length - 1) {
      const how = await forward();
      if (how === "none") console.log("   !! 스텝 " + i + " 에서 이동 실패");
    }
  }
  console.log(`   샷 ${types.length}장 저장`);
}
console.log(`\nPAGEERRORS: ${errs}`);
await browser.close();
