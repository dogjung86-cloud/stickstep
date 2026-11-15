// 중2 Ⅵ 레슨 2의 소화기관 랩과 융털 랩 캡처(2026-11-15). 폰(390×700)과 PC(1440×900) 크기에서 핵심 시점을 찍는다.
// 실행: PORT=<dev 포트> node qa/shot-g2u6-digest.mjs <출력 폴더>
// 랩을 한 길로 간다: 입(맞게) → 위(녹말을 골라 틀리게) → 쓸개즙(지방을 골라 틀리게) → 이자액(셋 다) → 큰창자 → 판정. 융털 랩은 세 벽을 다 흘려보낸다.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const PORT = process.env.PORT || "5711";
const BASE = `http://localhost:${PORT}`;
const OUT = process.argv[2] ?? "qa/shots/g2u6-digest";
mkdirSync(OUT, { recursive: true });
const W = (p, ms) => p.waitForTimeout(ms);

async function run(name, viewport, mobile) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/@vite/client", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id=\"' + id + '\"]'); if (!el) { el = document.createElement('style'); el.setAttribute('data-vite-dev-id', id); document.head.appendChild(el); } el.textContent = css; } export function removeStyle(id){ document.querySelector('style[data-vite-dev-id=\"' + id + '\"]')?.remove(); } export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; } export function injectQuery(u){ return u; } export const ErrorOverlay = class {}; export default {};" }));
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
  });
  await page.goto(`${BASE}/?open=g2u6l2`, { waitUntil: "domcontentloaded" });
  await W(page, 2500);
  const fwd = async () => {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await W(page, 800);
  };
  for (let i = 0; i < 3; i++) await fwd();
  const click = async (sel, ms) => {
    await page.click(`.screen.active ${sel}`);
    await W(page, ms);
  };
  const shot = async (mark) => page.screenshot({ path: join(OUT, `${name}-${mark}.png`) });
  // 소화기관 랩
  await shot("organ-1-start");
  await click('.g2u6x-chipbtn[data-k="n0"]', 200);
  await click(".g2u6x-mix", 2300);
  await shot("organ-2-mouth");
  await click(".g2u6x-mix", 700);
  await shot("organ-3-eso");
  await W(page, 1400);
  await click('.g2u6x-chipbtn[data-k="n0"]', 200);
  await click(".g2u6x-mix", 2200);
  await shot("organ-4-stomach-miss");
  await click(".g2u6x-mix", 1700);
  await click('.g2u6x-chipbtn[data-k="n2"]', 200);
  await click(".g2u6x-mix", 2300);
  await shot("organ-5-bile-miss");
  await click(".g2u6x-mix", 500);
  for (const k of ["n0", "n1", "n2"]) await click(`.g2u6x-chipbtn[data-k="${k}"]`, 150);
  await click(".g2u6x-mix", 1500);
  await shot("organ-6-pancreas");
  await W(page, 4000);
  await shot("organ-7-final");
  await click(".g2u6x-mix", 2500);
  await shot("organ-8-large");
  await click(".g2u6x-mix", 800);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .bv-choice")].find((b) => b.dataset.ok === "0")?.click());
  await W(page, 700);
  await shot("organ-9-judge-wrong");
  await page.evaluate(() => document.querySelector(".screen.active .bv-next")?.click());
  await W(page, 600);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .bv-choice")].find((b) => b.dataset.ok === "1")?.click());
  await W(page, 700);
  await page.evaluate(() => document.querySelector(".screen.active .bv-next")?.click());
  await W(page, 800);
  await shot("organ-10-done");
  // 융털 랩
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
  await W(page, 1200);
  await shot("villi-1-start");
  for (const k of ["w0", "w1", "w2"]) {
    await click(`.g2u6x-chipbtn[data-k="${k}"]`, 300);
    await click(".g2u6x-flow-btn", 1900);
    await shot(`villi-2-${k}`);
  }
  console.log(`${name}: 페이지 오류 ${errors.length}${errors.length ? " " + errors.slice(0, 3).join(" | ") : ""}`);
  await browser.close();
  return errors.length;
}

const e1 = await run("phone", { width: 390, height: 700 }, true);
const e2 = await run("pc", { width: 1440, height: 900 }, false);
process.exit(e1 + e2 ? 1 : 0);
