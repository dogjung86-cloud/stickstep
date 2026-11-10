// 중1 과학 만화 열 편을 앱에서 끝까지 넘겨 보며 기계로 확인한다.
//   그림이 실제로 떴는가(naturalWidth > 0) · 말풍선이 컷 밖으로 나가지 않는가 · 말풍선끼리 겹치지 않는가 · 페이지 오류가 없는가
// 실행: PORT=5537 node qa/sketch/check-comics.mjs [저장 폴더]   (도는 동안 src 를 고치지 않는다. 새로고침되면 레슨 상태가 날아간다)
//   저장 폴더를 주면 편마다 컷 캡처를 남긴다(폰 375x812).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = `http://localhost:${process.env.PORT || 5537}`;
const OUT = process.argv[2];
if (OUT) mkdirSync(OUT, { recursive: true });
const COMICS = [
  ["u1l1", "과학적 탐구 방법", "I.", 8], ["u1l3", "과학과 인류 문명", "I.", 7],
  ["u2l1", "세포", "II.", 7], ["u2l7", "변이와 적응", "II.", 8],
  ["u3l3", "열의 이동", "III.", 8],
  ["u4l3", "상태 변화", "IV.", 7], ["u4l6", "열에너지 방출", "IV.", 7],
  ["u5l3", "중력", "V.", 7], ["u6l2", "보일 법칙", "VI.", 7], ["u7l3", "태양의 활동", "VII.", 8],
];
const VIEWS = [{ name: "375x812", width: 375, height: 812 }, { name: "390x700", width: 390, height: 700 }];

const seed = () => {
  const lessons = {};
  for (let u = 1; u <= 7; u++) for (let l = 1; l <= 12; l++) lessons[`u${u}l${l}`] = { done: true, acc: 95, bestXp: 60 };
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "중1", goalMin: 10, streak: 2, lastStudyDay: "2026-11-10", totalXp: 300, lessons, minigame: {}, premium: true }));
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL", msg); } };

for (const vp of VIEWS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(seed);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.waitForFunction(() => document.querySelector(".flipbook")?.classList.contains("settled"), null, { timeout: 20000 });
  await page.waitForTimeout(2200); // 워드마크와 버튼이 다 떠오를 때까지
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /둘러보기|이어가기/.test(b.textContent))?.click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(700);

  for (const [id, label, tab, want] of COMICS) {
    await page.evaluate((u) => [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.trim().startsWith(u))?.click(), tab);
    await page.waitForTimeout(600);
    await page.evaluate((label) => [...document.querySelectorAll(".screen.active .gm-node")].find((x) => (x.getAttribute("aria-label") || "").includes(label))?.click(), label);
    await page.waitForTimeout(900);
    await page.waitForSelector(".screen.active .comic-dots", { timeout: 15000 });
    await page.waitForTimeout(3300);
    const n = await page.evaluate(() => document.querySelectorAll(".screen.active .comic-dots i").length);
    ok(n === want, `${vp.name} ${id}: 컷 수 ${n} (기대 ${want})`);
    for (let i = 0; i < n; i++) {
      await page.waitForFunction(() => { const im = document.querySelector(".screen.active .comic-img"); return im && im.complete; }, null, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(300);
      const r = await page.evaluate(() => {
        const im = document.querySelector(".screen.active .comic-img"), art = document.querySelector(".screen.active .comic-art");
        const a = art.getBoundingClientRect();
        const bs = [...art.querySelectorAll(".cut-bubble")].map((b) => { const q = b.getBoundingClientRect(); return { t: b.textContent, l: q.left - a.left, r: a.right - q.right, top: q.top - a.top, bot: a.bottom - q.bottom, x0: q.left, x1: q.right, y0: q.top, y1: q.bottom }; });
        return { src: im.getAttribute("src"), nw: im.naturalWidth, bs };
      });
      ok(r.nw > 0 && /sketch\/comics\//.test(r.src), `${vp.name} ${id} 컷 ${i + 1}: 그림이 뜨지 않음 (${r.src})`);
      for (const b of r.bs) ok(b.l >= -1 && b.r >= -1 && b.top >= -1 && b.bot >= -1, `${vp.name} ${id} 컷 ${i + 1}: 말풍선 "${b.t}" 이 컷 밖으로 (왼 ${b.l.toFixed(0)} 오른 ${b.r.toFixed(0)} 위 ${b.top.toFixed(0)})`);
      for (let p = 0; p < r.bs.length; p++) for (let q = p + 1; q < r.bs.length; q++) { const A = r.bs[p], B = r.bs[q]; ok(A.x1 <= B.x0 + 1 || B.x1 <= A.x0 + 1 || A.y1 <= B.y0 + 1 || B.y1 <= A.y0 + 1, `${vp.name} ${id} 컷 ${i + 1}: 말풍선 "${A.t}" 과 "${B.t}" 이 겹침`); }
      if (OUT && vp.name === "375x812") {
        await page.evaluate(() => { const el = document.querySelector(".screen.active .comic-dots"); let sc = el?.parentElement; while (sc && !/auto|scroll/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement; if (el && sc) sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 10; });
        await page.waitForTimeout(150);
        await page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
        await page.screenshot({ path: join(OUT, `${id}-cut${i + 1}.png`) });
      }
      await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
      await page.waitForTimeout(450);
    }
    await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click());
    await page.waitForTimeout(800);
  }
  ok(errors.length === 0, `${vp.name}: 페이지 오류 ${errors.length}건 ${errors.slice(0, 3).join(" | ")}`);
  await ctx.close();
}
await browser.close();
console.log(`${pass}/${pass + fail} ${fail ? "FAIL" : "ALL PASS"}`);
process.exit(fail ? 1 : 0);
