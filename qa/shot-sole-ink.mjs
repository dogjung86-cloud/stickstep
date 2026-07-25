// 중2 Ⅵ 지도 발바닥 색 눈검수 샷.
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const PORT = process.env.PORT || "3000";
const OUT = process.env.OUT || "tmp/sole-check";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
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
await page.waitForTimeout(1200);

for (const [unit, name] of [["g2u6", "g2u6-body"], ["g2u5", "g2u5-plant"]]) {
  await page.evaluate(async (u) => {
    const { nav } = await import("/src/core/router.ts");
    const { homeScreen } = await import("/src/screens/home.ts");
    nav.reset(homeScreen(() => {}, u, {}));
  }, unit);
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    ink: document.querySelector(".map-head")?.style.getPropertyValue("--mh-ink"),
    node: document.querySelector(".gm-node")?.className,
  }));
  console.log(`${name}: --mh-ink=${info.ink} · node="${info.node}"`);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}
await browser.close();
