// 중1 Ⅳ v3 — 랩 10종 "한 화면 예산" 기계 검사(390×700 폰 뷰포트, 사용자 피드백 2026-09-03).
// 각 랩을 마운트 직후와 판정 질문이 뜬 뒤 두 시점에서 재서, 스텝 총높이가 스크롤 영역(usable) 안에 들어오고
// helper가 2줄(52px) 이하인지 확인한다. 모든 랩 통과가 ALL PASS.
//   PORT=5463 node qa/check-u4v3-fit.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5463";
const HELPER_MAX = 52;
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  sessionStorage.setItem("ss.u4v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
const W = (ms) => page.waitForTimeout(ms);
const open = (i) => page.evaluate(async (idx) => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { UNIT4_V3 } = await import("/src/content/unit4v3.ts");
  nav.go(createLessonPlayer(UNIT4_V3.lessons[idx], { onExit: () => {}, onComplete: () => {} }));
}, i);
const fwd = async (n) => { for (let i = 0; i < n; i++) { await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click()); await W(420); } };
const clickSel = async (sel) => { await page.evaluate((s) => { document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ s, i }) => { document.querySelectorAll(`.screen.active ${s}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { s: sel, i }); };
const clickWhenEnabled = async (sel, tries = 60) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate((s) => { const b = document.querySelector(`.screen.active ${s}`); if (b && !b.disabled) { b.dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; } return false; }, sel);
    if (done) { await W(200); return true; }
    await W(300);
  }
  return false;
};
const waitAsk = async (cls, tries = 80) => {
  for (let t = 0; t < tries; t++) {
    const on = await page.evaluate((c) => { const q = document.querySelector(`.screen.active ${c}.show`); return !!q && q.offsetParent !== null; }, cls);
    if (on) return true;
    await W(300);
  }
  return false;
};
const measure = () => page.evaluate(() => {
  const sc = document.querySelector(".screen.active .scroll");
  const wrap = document.querySelector(".screen.active .stepWrap");
  const top0 = sc.getBoundingClientRect().top;
  const q = (sel) => { const e = wrap.querySelector(sel); if (!e || e.offsetParent === null) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top - top0 + sc.scrollTop), h: Math.round(r.height) }; };
  const askVisible = !!wrap.querySelector(".hook-choices.show") && wrap.querySelector(".hook-choices.show").offsetParent !== null;
  return { usable: sc.clientHeight, total: wrap.scrollHeight, helperH: q(".helper")?.h ?? 0, helperChars: (wrap.querySelector(".helper")?.textContent || "").trim().length, board: q(".mt3-board, .m3s-stage"), slot: q(".mt3-slot"), askVisible };
});

const LABS = [
  ["L1 잉크·식초", 0, 2, ".ink-q", async () => { await clickSel(".ink-btn"); await clickWhenEnabled(".ink-btn"); await W(300); await clickSel(".ink-btn"); }],
  ["L1 소독제 저울", 0, 4, ".esl-q", async () => { await clickSel(".esl-btn"); await W(400); await clickSel(".esl-btn"); }],
  ["L2 세 상태", 1, 2, ".m3s-q", async () => { await clickNth(".m3s-state", 1); await W(300); await clickNth(".m3s-state", 2); await W(300); await clickNth(".m3s-vessel", 1); }],
  ["L3 시계 접시", 2, 2, ".wgl-q", async () => { await clickSel(".wgl-btn"); }],
  ["L3 드라이아이스", 2, 3, ".dil-q", async () => { await clickSel(".dil-btn"); await clickWhenEnabled(".dil-btn"); }],
  ["L4 올리브유", 3, 1, ".ofl-q", async () => { await clickSel(".ofl-btn"); await clickWhenEnabled(".ofl-btn"); }],
  ["L4 아세톤 풍선", 3, 2, ".abl-q", async () => { await clickSel(".abl-btn"); }],
  ["L5 가열 곡선", 4, 2, ".mbl-q", async () => { await clickSel(".mbl-btn"); }],
  ["L6 냉각 곡선", 5, 2, ".frz-q", async () => { await clickSel(".frz-btn"); }],
  ["L6 주변 온도", 5, 3, ".stl-q", async () => {}],
];
let pass = 0, fail = 0;
const lines = [];
const judge = (name, cond, detail) => { (cond ? pass++ : fail++); lines.push(`${cond ? "PASS" : "FAIL"} ${name} | ${detail}`); };
for (const [label, li, si, qcls, act] of LABS) {
  await open(li); await W(900); await fwd(si); await W(700);
  await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));
  const m0 = await measure();
  await page.screenshot({ path: `qa/shots/u4v3-fit-${String(LABS.indexOf(LABS.find((l) => l[0] === label))).padStart(2, "0")}-mount.png`, fullPage: false });
  judge(`${label} 마운트`, m0.total <= m0.usable && m0.helperH <= HELPER_MAX, `total ${m0.total}/${m0.usable} · helper ${m0.helperChars}자 ${m0.helperH}px · board ${m0.board ? `@${m0.board.top} h${m0.board.h}` : "-"} · slot ${m0.slot ? `@${m0.slot.top} h${m0.slot.h}` : "-"}`);
  await act();
  const shown = await waitAsk(qcls);
  const m1 = await measure();
  await page.screenshot({ path: `qa/shots/u4v3-fit-${String(LABS.indexOf(LABS.find((l) => l[0] === label))).padStart(2, "0")}-ask.png`, fullPage: false });
  judge(`${label} 판정`, shown && m1.total <= m1.usable && m1.helperH <= HELPER_MAX, `ask ${shown ? "표시" : "미표시"} · total ${m1.total}/${m1.usable} · helper ${m1.helperChars}자 ${m1.helperH}px · slot ${m1.slot ? `@${m1.slot.top} h${m1.slot.h}` : "-"}`);
}
lines.push(`RESULT: PASS ${pass} / FAIL ${fail}`);
fs.writeFileSync("qa/u4v3-fit.txt", lines.join("\n") + "\n", "utf8");
process.stdout.write(Buffer.from(lines.join("\n") + "\n", "utf8"));
await browser.close();
process.exit(fail ? 1 : 0);
