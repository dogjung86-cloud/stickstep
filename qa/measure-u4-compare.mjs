// 중1 Ⅳ 구판(UNIT4) vs v3(UNIT4_V3) — 랩 스텝 세로 밀도 비교(390×700 폰 뷰포트, 마운트 시점).
// 각 레슨의 전 스텝을 앞으로 가기(검토 모드)로 훑으며 helper/무대가 있는 스텝만 기록한다.
//   PORT=5463 node qa/measure-u4-compare.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5463";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
const W = (ms) => page.waitForTimeout(ms);
const open = (mod, name, i) => page.evaluate(async ({ mod, name, i }) => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const m = await import(mod);
  nav.go(createLessonPlayer(m[name].lessons[i], { onExit: () => {}, onComplete: () => {} }));
}, { mod, name, i });
const measure = () => page.evaluate(() => {
  const sc = document.querySelector(".screen.active .scroll");
  const wrap = document.querySelector(".screen.active .stepWrap");
  if (!sc || !wrap) return null;
  const top0 = sc.getBoundingClientRect().top;
  const q = (sel) => { const e = wrap.querySelector(sel); if (!e || e.offsetParent === null) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top - top0 + sc.scrollTop), h: Math.round(r.height) }; };
  const helper = wrap.querySelector(".helper");
  const board = q(".mt3-board, .stage, .matter-stage, .lab-stage, .hp-stage, canvas, .mstage");
  const title = (wrap.querySelector("h1, h2, .pn-title, .title")?.textContent || "").trim().slice(0, 18);
  const fwd = document.querySelector(".screen.active .xbtn.fwd");
  const fwdOn = !!fwd && getComputedStyle(fwd).visibility !== "hidden";
  return { title, usable: sc.clientHeight, total: wrap.scrollHeight, helper: helper ? helper.textContent.trim().length : 0, helperH: q(".helper")?.h ?? 0, chips: q(".pn-badges, .hp-goals")?.h ?? 0, board, fwdOn, lab: !!(helper || board) };
});
const rows = [];
for (const [tag, mod, name] of [["구판", "/src/content/unit4.ts", "UNIT4"], ["v3", "/src/content/unit4v3.ts", "UNIT4_V3"]]) {
  for (let li = 0; li < 6; li++) {
    await open(mod, name, li); await W(1000);
    for (let s = 0; s < 16; s++) {
      await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));
      const m = await measure();
      if (!m) break;
      if (m.lab) rows.push({ tag, lesson: `L${li + 1}`, step: s, ...m });
      if (!m.fwdOn) break;
      await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
      await W(500);
    }
  }
}
const lines = rows.map((r) => `${r.tag} ${r.lesson} s${r.step} | ${r.title} | total ${r.total} (${(r.total / r.usable).toFixed(2)}화면) | chips ${r.chips} helper ${r.helper}자/${r.helperH}px | board ${r.board ? `@${r.board.top} h${r.board.h}` : "-"}`);
fs.writeFileSync("qa/u4-compare-measure.txt", lines.join("\n") + "\n", "utf8");
process.stdout.write(Buffer.from(lines.join("\n") + "\n", "utf8"));
await browser.close();
