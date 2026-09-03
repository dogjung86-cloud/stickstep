// 중1 Ⅲ v3 — 랩 6종 "한 화면 예산" 기계 검사(390×700 폰 뷰포트, 사용자 피드백 2026-09-03 — Ⅳ v3와 같은 문법).
// 각 랩을 마운트 직후와 판정 질문이 뜬 뒤 두 시점에서 재서, 스텝 총높이가 스크롤 영역(usable) 안에 들어오고
// helper가 2줄(52px) 이하인지 확인한다. 폰 크기 샷 12장(qa/shots/u3v3-fit-*.png)도 남긴다. 모든 랩 통과가 ALL PASS.
//   PORT=5453 node qa/check-u3v3-fit.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5453";
const HELPER_MAX = 52;
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  sessionStorage.setItem("ss.u3v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
const W = (ms) => page.waitForTimeout(ms);
const open = (i) => page.evaluate(async (idx) => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { UNIT3_V3 } = await import("/src/content/unit3v3.ts");
  nav.go(createLessonPlayer(UNIT3_V3.lessons[idx], { onExit: () => {}, onComplete: () => {} }));
}, i);
const fwd = async (n) => { for (let i = 0; i < n; i++) { await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click()); await W(420); } };
const clickSel = async (sel) => { await page.evaluate((s) => { document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ s, i }) => { document.querySelectorAll(`.screen.active ${s}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { s: sel, i }); };
const setSlider = async (sel, v) => { await page.evaluate(({ s, v }) => { const el = document.querySelector(`.screen.active ${s}`); if (!el) return; el.value = String(v); el.dispatchEvent(new Event("input", { bubbles: true })); }, { s: sel, v }); await W(120); };
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
  return { usable: sc.clientHeight, total: wrap.scrollHeight, helperH: q(".helper")?.h ?? 0, helperChars: (wrap.querySelector(".helper")?.textContent || "").trim().length, board: q(".ht3-board"), slot: q(".ht3-slot") };
});

const LABS = [
  ["L1 입자 다이얼", 0, 2, ".pdi-q", async () => { await setSlider(".pdi-slider", 60); await setSlider(".pdi-slider", 90); await W(300); await setSlider(".pdi-slider", 40); await setSlider(".pdi-slider", 5); }],
  ["L2 열량계", 1, 2, ".cgl-q", async () => { await clickSel(".cgl-btn"); }],
  ["L3 막대 경주", 2, 2, ".rrl-q", async () => { await clickSel(".rrl-btn"); }],
  ["L3 냉난방기", 2, 4, ".apl-q", async () => { await clickNth(".apl-choice", 1); await W(3500); await clickNth(".apl-choice", 0); }],
  ["L4 가열 레이스", 3, 1, ".hrl-q", async () => { await clickSel(".hrl-btn"); }],
  ["L5 바이메탈", 4, 3, ".bml-q", async () => {}],
];
let pass = 0, fail = 0;
const lines = [];
const judge = (name, cond, detail) => { (cond ? pass++ : fail++); lines.push(`${cond ? "PASS" : "FAIL"} ${name} | ${detail}`); };
for (const [label, li, si, qcls, act] of LABS) {
  const n = String(LABS.findIndex((l) => l[0] === label)).padStart(2, "0");
  await open(li); await W(900); await fwd(si); await W(700);
  await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));
  const m0 = await measure();
  await page.screenshot({ path: `qa/shots/u3v3-fit-${n}-mount.png`, fullPage: false });
  judge(`${label} 마운트`, m0.total <= m0.usable && m0.helperH <= HELPER_MAX, `total ${m0.total}/${m0.usable} · helper ${m0.helperChars}자 ${m0.helperH}px · board ${m0.board ? `@${m0.board.top} h${m0.board.h}` : "-"} · slot ${m0.slot ? `@${m0.slot.top} h${m0.slot.h}` : "-"}`);
  await act();
  const shown = await waitAsk(qcls);
  const m1 = await measure();
  await page.screenshot({ path: `qa/shots/u3v3-fit-${n}-ask.png`, fullPage: false });
  judge(`${label} 판정`, shown && m1.total <= m1.usable && m1.helperH <= HELPER_MAX, `ask ${shown ? "표시" : "미표시"} · total ${m1.total}/${m1.usable} · helper ${m1.helperChars}자 ${m1.helperH}px · slot ${m1.slot ? `@${m1.slot.top} h${m1.slot.h}` : "-"}`);
}
lines.push(`RESULT: PASS ${pass} / FAIL ${fail}`);
fs.writeFileSync("qa/u3v3-fit.txt", lines.join("\n") + "\n", "utf8");
process.stdout.write(Buffer.from(lines.join("\n") + "\n", "utf8"));
await browser.close();
process.exit(fail ? 1 : 0);
