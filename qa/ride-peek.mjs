// 순환 여행 랩(g2u6RideLab, 레슨 g2u6l3) 엿보기: 랩을 끝까지 몰며 국면마다 무대를 찍는다.
// 실행: PORT=5721 node qa/ride-peek.mjs <출력 폴더> [--wrong] [--flat] [--nogl] [--wide] [--fast] [--still]
//   --wrong  결정마다 먼저 한 번 틀린다(동맥, 좌심방, 동맥) · --flat 세션 표식으로 평면 무대 · --nogl WebGL2를 끈 브라우저 흉내
//   --wide   PC 크기(1280×800) · --fast 찍는 수를 줄인다
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PORT = process.env.PORT || "5721";
const BASE = `http://localhost:${PORT}`;
const OUT = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "qa/shots/ride";
const has = (f) => process.argv.includes(f);
const WRONG = has("--wrong");
const FLAT = has("--flat");
const NOGL = has("--nogl");
const WIDE = has("--wide");
const FAST = has("--fast");
const STILL = has("--still"); // 움직임 줄이기 설정
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext(
  { ...(WIDE ? { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 } : { viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), ...(STILL ? { reducedMotion: "reduce" } : {}) },
);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate|favicon|net::ERR|status of 404/.test(m.text())) errors.push("console: " + m.text()); });
await page.addInitScript(({ flat, nogl }) => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
  if (flat) sessionStorage.setItem("ss.rideflat", "1");
  if (nogl) {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...a) {
      if (type === "webgl2") return null;
      return orig.call(this, type, ...a);
    };
  }
}, { flat: FLAT, nogl: NOGL });
await page.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};` }));

const W = (ms) => page.waitForTimeout(ms);
await page.goto(`${BASE}/?open=g2u6l3`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
await W(800);
for (let i = 0; i < 12; i++) {
  const on = await page.evaluate(() => !!document.querySelector(".screen.active .step.g2u6x-ride-step"));
  if (on) break;
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await W(600);
}
await page.waitForFunction(() => {
  const s = document.querySelector(".screen.active .step.g2u6x-ride-step");
  return s && (s.dataset.g6Stage === "flat" || s.dataset.g6Ready === "1");
}, null, { timeout: 15000 });
await W(500);
let n = 0;
const ds = () => page.evaluate(() => ({ ...document.querySelector(".screen.active .step.g2u6x-ride-step").dataset }));
const shot = async (name, full = false) => {
  n += 1;
  const file = join(OUT, `${String(n).padStart(2, "0")}-${name}.png`);
  if (full || WIDE) await page.screenshot({ path: file });
  else {
    const box = await page.locator(".screen.active .bv-stage.g2u6x-ride").boundingBox();
    await page.screenshot({ path: file, clip: box });
  }
  return file;
};
const clickPick = (k) =>
  page.evaluate((k) => {
    const b = document.querySelector(`.screen.active .g2u6x-rd-pick[data-k="${k}"]`);
    if (!b || b.disabled) return false;
    b.click();
    return true;
  }, k);
const waitPicks = async () => {
  for (let i = 0; i < 400; i++) {
    const d = await ds();
    if (d.g6Picks && d.g6Picks.split(",").some((x) => x && !x.endsWith("-"))) return d;
    if (d.g6Phase === "ask" || d.g6Phase === "done") return d;
    await W(100);
  }
  return ds();
};
const RIGHT = { start: "pump", d1: "cap", d2: "ra", pump2: "pump", lung: "breath", d4: "vein", pump3: "pump" };
const WRONG_K = { d1: "art", d2: "la", d4: "artery" };
const info = { stage: (await ds()).g6Stage, log: [] };
await shot("start", true);
for (let guard = 0; guard < 20; guard++) {
  const d = await waitPicks();
  if (d.g6Phase === "ask") break;
  const step = d.g6Step;
  info.log.push(step);
  await W(300);
  await shot(`${step}-pick`, step === "d1" || step === "d2");
  if (WRONG && WRONG_K[step]) {
    await clickPick(WRONG_K[step]);
    await W(700);
    await shot(`${step}-wrong`);
    await W(1500);
  }
  await clickPick(RIGHT[step]);
  if (!FAST) {
    await W(1300);
    await shot(`${step}-after1`);
    await W(1600);
    await shot(`${step}-after2`);
  }
}
// 판정
await W(800);
await shot("judge", true);
await page.evaluate((wrong) => {
  const b = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].find((x) => x.dataset.ok === (wrong ? "0" : "1"));
  b?.click();
}, WRONG);
await W(600);
await shot("verdict", true);
await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-next")?.click());
await W(800);
await shot("done", true);
info.errors = errors;
writeFileSync(join(OUT, "info.json"), JSON.stringify(info, null, 1));
console.log(JSON.stringify(info));
await browser.close();
