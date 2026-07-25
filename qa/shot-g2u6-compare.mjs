// 구 g2u6(codex 판)와 신 g2u6v2(재제작 판)를 같은 조건에서 나란히 캡처한다.
// 구 판은 커리큘럼에서 빠져 findLesson으로 못 찾으니 모듈을 직접 import해 mount한다.
//   PORT=3000 node qa/shot-g2u6-compare.mjs
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const PORT = process.env.PORT || "5173";
const DIR = "tmp/g2u6-compare";
await mkdir(DIR, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let errs = 0;
page.on("pageerror", (e) => { errs++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
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
await page.waitForTimeout(1000);

const W = (ms) => page.waitForTimeout(ms);

/** which: "old" = 구 unit6.ts, "new" = 재제작 unit6v2.ts */
async function open(which, idx) {
  return page.evaluate(async ({ which, idx }) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const mod = which === "old"
      ? await import("/src/content/g2/unit6.ts")
      : await import("/src/content/g2/unit6v2.ts");
    const unit = which === "old" ? mod.G2_UNIT6 : mod.G2_UNIT6_V2;
    const lesson = unit.lessons[idx];
    if (!lesson) return null;
    nav.go(createLessonPlayer(lesson, { onExit: () => {}, onComplete: () => {} }));
    return { title: lesson.title, steps: lesson.steps.map((s) => s.type) };
  }, { which, idx });
}

const fwd = () =>
  page.evaluate(() => {
    const b = document.querySelector(".screen.active .xbtn.fwd");
    if (b && b.style.visibility !== "hidden") { b.click(); return true; }
    return false;
  });

for (const which of ["old", "new"]) {
  for (let i = 0; i < 12; i++) {
    const info = await open(which, i);
    if (!info) break;
    await W(1000);
    console.log(`${which} L${i + 1} ${info.title} — ${info.steps.join(" → ")}`);
    for (let k = 0; k < info.steps.length; k++) {
      await W(600);
      await page.screenshot({ path: `${DIR}/${which}-L${String(i + 1).padStart(2, "0")}-${String(k).padStart(2, "0")}-${info.steps[k]}.png` });
      if (k < info.steps.length - 1) await fwd();
    }
  }
}
console.log(`\nPAGEERRORS: ${errs}`);
await browser.close();
