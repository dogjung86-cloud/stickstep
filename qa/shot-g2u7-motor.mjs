// 중2 Ⅶ 레슨 8 전동기 코일 랩(g2u7MotorLab)을 걸으며 찍는다: 폰(390×700)과 PC(1920×1080).
// 시점: 0 처음 → 1 붙잡은 채 전류(왼쪽 변의 힘) → 2 오른쪽 변의 힘 예측 → 3 예측 뒤(양쪽 힘) → 4 코일을 놓아 돈다 → 5 전류 방향을 바꿈.
// 실행: PORT=<dev 포트> node qa/shot-g2u7-motor.mjs <출력 폴더> [접두] [--views phone,pc] [--flat]
//   --flat: 평면 무대로(WebGL2가 없는 브라우저 흉내). 화면 전체와 무대만 자른 그림(-stage)을 함께 남긴다.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const PORT = process.env.PORT || "5781";
const BASE = `http://localhost:${PORT}`;
const argv = process.argv.slice(2);
const vi = argv.indexOf("--views");
const pick = vi >= 0 ? argv[vi + 1].split(",") : ["phone", "pc"];
const flat = argv.includes("--flat");
const pos = argv.filter((a, i) => !a.startsWith("--") && (vi < 0 || i !== vi + 1));
const OUT = pos[0] || "qa/shots/g2u7-motor";
const TAG = pos[1] || "shot";
mkdirSync(OUT, { recursive: true });

const SEED = () => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
};
const NOGL = () => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...a) {
    return type === "webgl2" ? null : orig.call(this, type, ...a);
  };
};
const VIEWS = [
  { name: "phone", viewport: { width: 390, height: 700 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: "pc", viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
].filter((v) => pick.includes(v.name));

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const errors = [];
for (const v of VIEWS) {
  const ctx = await browser.newContext({ viewport: v.viewport, deviceScaleFactor: v.deviceScaleFactor, isMobile: v.isMobile, hasTouch: v.hasTouch });
  await ctx.addInitScript(SEED);
  if (flat) await ctx.addInitScript(NOGL);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${v.name}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/vibrate|WebGL context/.test(m.text())) errors.push(`${v.name} console: ${m.text()}`); });
  await page.goto(`${BASE}/?open=g2u7l8`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
  await page.waitForTimeout(900);
  const btn = (text) => page.evaluate((text) => {
    const b = [...document.querySelectorAll(".screen.active .bv-ctl button")].find((x) => x.textContent.includes(text) && !x.disabled);
    b?.click();
    return !!b;
  }, text);
  // 검토 모드의 앞으로 가기로 전동기 랩까지(제목으로 알아본다)
  for (let i = 0; i < 6; i++) {
    const t = await page.evaluate(() => document.querySelector(".screen.active .bv-title")?.textContent ?? "");
    if (t.includes("전동기 속 코일")) break;
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(2200); // 3D가 첫 장면을 그릴 때까지
  const shot = async (label) => {
    await page.screenshot({ path: join(OUT, `${TAG}-${v.name}-${label}.png`) });
    const st = page.locator(".screen.active .bv-stage").first();
    if (await st.count()) await st.screenshot({ path: join(OUT, `${TAG}-${v.name}-${label}-stage.png`) }).catch(() => {});
  };
  await shot("0-start");
  await btn("전류 흘려주기");
  await page.waitForTimeout(1300);
  await shot("1-left");
  await page.waitForFunction(() => !!document.querySelector(".screen.active .bv-q.show .bv-choice:not(:disabled)"), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
  await shot("2-predict");
  await page.evaluate(() => {
    const bs = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].filter((b) => !b.disabled);
    (bs.find((x) => x.dataset.ok === "1") ?? bs[0])?.click();
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector(".screen.active .bv-next")?.click());
  await page.waitForTimeout(1200);
  await shot("3-both");
  await btn("코일 놓기");
  await page.waitForTimeout(1700);
  await shot("4-spin");
  await btn("전류 방향");
  await page.waitForTimeout(1500);
  await shot("5-flip");
  const st = await page.evaluate(() => ({ helper: document.querySelector(".screen.active .bv-helper")?.textContent ?? "", gl: !!document.querySelector(".screen.active .bv-stage canvas.g2u7x-cv3d") }));
  console.log(`${v.name}: 3D ${st.gl ? "있음" : "없음"}, 도움말 "${st.helper}"`);
  await ctx.close();
}
await browser.close();
if (errors.length) console.log("페이지 오류: " + errors.join(" | "));
console.log(`저장: ${OUT}`);
