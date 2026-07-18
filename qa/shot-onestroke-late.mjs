// 네온 한붓그리기 — 후반 절차 생성판 눈검수 샷(12판 내부 정점 데뷔·15판 교차 홀수판·18판 21선 브리더)
import { chromium } from "playwright-core";
import fs from "node:fs";
const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: "export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id=\"' + id + '\"]'); if (!el) { el = document.createElement('style'); el.setAttribute('data-vite-dev-id', id); document.head.appendChild(el); } el.textContent = css; }\nexport function removeStyle(id){ document.querySelector('style[data-vite-dev-id=\"' + id + '\"]')?.remove(); }\nexport function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }\nexport function injectQuery(u){ return u; }\nexport const ErrorOverlay = class {};\nexport default {};" }));
for (const best of [11, 14, 17]) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((b) => localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null, totalXp: 0, lifeXp: 0, lessons: {}, minigame: { onestroke: b }, exams: {}, wrongNotes: {} })), best);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1100);
  await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
  await page.waitForTimeout(400);
  await page.evaluate(() => document.getElementById("btn-onestroke").click());
  await page.waitForSelector("#sc-onestroke", { timeout: 4000 });
  await page.waitForTimeout(700);
  // 솔버 경로의 앞 절반을 그려 켠 선/꺼진 선이 함께 보이게
  await page.evaluate(async () => {
    const dev = window.__ostDev;
    const path = dev.path();
    const half = path.slice(0, Math.ceil(path.length / 2));
    const cv = document.querySelector("#sc-onestroke .ost-cv");
    const fire = (t, x, y) => cv.dispatchEvent(new PointerEvent(t, { pointerId: 7, clientX: x, clientY: y, bubbles: true, isPrimary: true }));
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const p0 = dev.pos(half[0]);
    fire("pointerdown", p0.x, p0.y);
    for (let i = 1; i < half.length; i++) {
      const a = dev.pos(half[i - 1]), b = dev.pos(half[i]);
      for (let k = 1; k <= 4; k++) fire("pointermove", a.x + ((b.x - a.x) * k) / 4, a.y + ((b.y - a.y) * k) / 4);
      await sleep(18);
    }
    const pe = dev.pos(half[half.length - 1]);
    fire("pointerup", pe.x, pe.y);
  });
  await page.waitForTimeout(250);
  const st = await page.evaluate(() => document.getElementById("sc-onestroke").dataset.ostStage);
  await page.screenshot({ path: `qa/shots/onestroke-late-${st}.png` });
  console.log("shot stage", st);
}
await browser.close();
