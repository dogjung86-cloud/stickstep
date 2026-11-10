// 중1 과학 7개 단원: 랩·활동 스텝 전수 실측(390×700 폰 뷰포트).
// 레슨마다 스텝을 차례로 넘기며, 도입·개념·정리·문제가 아닌 스텝(랩과 활동)을 마운트 직후에 재고 캡처한다.
// 재는 것: 스텝 총높이와 스크롤 영역(몇 화면인가), 보이는 글자 수, 제목·도움말·목표 칩, 조작 요소(버튼·슬라이더·캔버스),
//          첫 화면 밖에 깔린 조작 요소 수. 결과는 OUT/g1-labs.json 과 OUT/caps/*.png.
//   PORT=5547 OUT="D:/Brilliant Science/output/lab-redesign/audit" node qa/audit-g1-labs.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.PORT || "5547";
const OUT = process.env.OUT || "qa/shots/audit-g1";
const ONLY = (process.env.ONLY || "").split(",").filter(Boolean); // 예: ONLY=u3,u4
fs.mkdirSync(path.join(OUT, "caps"), { recursive: true });

const SKIP = new Set(["hook", "comic", "concept", "recap", "quiz"]);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("  PAGEERROR:", e.message); });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
const W = (ms) => page.waitForTimeout(ms);

const units = await page.evaluate(async () => {
  const c = await import("/src/content/curriculum.ts");
  return c.CURRICULUM.map((u) => ({
    id: u.id, title: u.title,
    lessons: u.lessons.map((l) => ({
      id: l.id, title: l.title,
      steps: l.steps.map((s) => ({ type: s.type, kind: s.type === "quiz" ? (s.mode ?? null) : null, scene: s.scene ?? null, mode: s.type === "quiz" ? null : (s.mode ?? null), fig: !!s.figure })),
    })),
  }));
});

const open = (uid, li) => page.evaluate(async ({ uid, li }) => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const c = await import("/src/content/curriculum.ts");
  const u = c.CURRICULUM.find((x) => x.id === uid);
  nav.go(createLessonPlayer(u.lessons[li], { onExit: () => {}, onComplete: () => {} }));
}, { uid, li });
const fwd = async () => { await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click()); await W(460); };

const measure = () => page.evaluate(() => {
  const sc = document.querySelector(".screen.active .scroll");
  const wrap = document.querySelector(".screen.active .stepWrap");
  if (!sc || !wrap) return null;
  const top0 = sc.getBoundingClientRect().top;
  const vis = (e) => e && e.offsetParent !== null && e.getBoundingClientRect().height > 0;
  const rect = (e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top - top0 + sc.scrollTop), h: Math.round(r.height), w: Math.round(r.width) }; };
  const txt = (sel) => { const e = wrap.querySelector(sel); return vis(e) ? e.innerText.replace(/\s+/g, " ").trim() : ""; };
  const usable = sc.clientHeight;
  const btns = [...wrap.querySelectorAll("button, [role=button], .seg > *, .chip")].filter(vis);
  const ranges = [...wrap.querySelectorAll("input[type=range]")].filter(vis);
  const canv = [...wrap.querySelectorAll("canvas")].filter(vis).map(rect);
  const svgs = [...wrap.querySelectorAll("svg")].filter(vis).map(rect).filter((r) => r.h >= 90);
  const stage = [...wrap.querySelectorAll(".stage, canvas, [class*=board], [class*=stage]")].filter(vis).map(rect).sort((a, b) => b.h * b.w - a.h * a.w)[0] ?? null;
  const below = [...btns, ...ranges].filter((e) => { const r = rect(e); return r.top + r.h > usable; }).length;
  // 궁금증 카드(완료 뒤 읽을거리)를 뺀, 랩을 진행하는 데 필요한 조작 요소만
  const belowMain = [...btns, ...ranges].filter((e) => !e.closest(".curio")).filter((e) => { const r = rect(e); return r.top + r.h > usable; }).length;
  const helperEl = wrap.querySelector(".helper");
  // 무대(SVG) 안 글자 중 가장 작은 실제 크기(px). 12px 미만은 폰에서 읽기 어렵다
  let minSvgText = null;
  for (const t of wrap.querySelectorAll("svg text")) {
    if (!vis(t.closest("svg"))) continue;
    const fs = parseFloat(getComputedStyle(t).fontSize);
    const svg = t.ownerSVGElement; const vb = svg.viewBox?.baseVal; const bw = svg.getBoundingClientRect().width;
    const k = vb && vb.width ? bw / vb.width : 1;
    const px = Math.round(fs * k * 10) / 10;
    if (t.textContent.trim() && (minSvgText === null || px < minSvgText)) minSvgText = px;
  }
  return {
    usable, total: wrap.scrollHeight, screens: Math.round((wrap.scrollHeight / usable) * 100) / 100,
    chars: wrap.innerText.replace(/\s+/g, "").length,
    title: txt("h1, .h1, .step-title"), lead: txt(".sub, .lead"),
    helper: helperEl && vis(helperEl) ? helperEl.innerText.replace(/\s+/g, " ").trim() : "",
    helperH: helperEl && vis(helperEl) ? Math.round(helperEl.getBoundingClientRect().height) : 0,
    helperTop: helperEl && vis(helperEl) ? rect(helperEl).top : null,
    goals: [...wrap.querySelectorAll(".pn-badge")].filter(vis).map((e) => e.innerText.trim()),
    buttons: btns.map((e) => e.innerText.replace(/\s+/g, " ").trim().slice(0, 16)).filter(Boolean).slice(0, 14),
    nButtons: btns.length, nRanges: ranges.length, canvases: canv.length, bigSvgs: svgs.length,
    stage, below, belowMain, minSvgText,
    minTap: (() => { const hs = [...btns, ...ranges].map((e) => e.getBoundingClientRect().height).filter((h) => h > 0); return hs.length ? Math.round(Math.min(...hs)) : null; })(),
  };
});

const rows = [];
for (const u of units) {
  if (ONLY.length && !ONLY.includes(u.id)) continue;
  for (let li = 0; li < u.lessons.length; li++) {
    const L = u.lessons[li];
    await open(u.id, li); await W(900);
    for (let si = 0; si < L.steps.length; si++) {
      const st = L.steps[si];
      if (si > 0) await fwd();
      if (SKIP.has(st.type)) continue;
      await W(1400); // 캔버스·3D 첫 프레임, 발주 이미지 로드
      await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));
      const m = await measure();
      const name = `${L.id}-${String(si + 1).padStart(2, "0")}-${st.type}${st.mode ? "-" + st.mode : ""}`;
      await page.screenshot({ path: path.join(OUT, "caps", `${name}.png`), fullPage: false });
      if (m && m.total > m.usable + 4) {
        await page.evaluate(() => { const sc = document.querySelector(".screen.active .scroll"); sc.scrollTo(0, sc.scrollHeight); });
        await W(250);
        await page.screenshot({ path: path.join(OUT, "caps", `${name}-b.png`), fullPage: false });
        await page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));
      }
      rows.push({ unit: u.id, lesson: L.id, lessonTitle: L.title, step: si + 1, of: L.steps.length, type: st.type, mode: st.mode, cap: name, ...m });
      console.log(`${name} | ${m ? `${m.total}/${m.usable} (${m.screens}화면) 글자 ${m.chars} 버튼 ${m.nButtons} 슬라이더 ${m.nRanges} 캔버스 ${m.canvases} 화면밖 ${m.below}` : "측정 실패"}`);
    }
  }
}
const quiz = units.filter((u) => !ONLY.length || ONLY.includes(u.id)).map((u) => ({
  unit: u.id,
  lessons: u.lessons.map((l) => {
    const cnt = {};
    for (const s of l.steps) {
      if (SKIP.has(s.type) && s.type !== "quiz") continue;
      const k = s.type === "quiz" ? `quiz:${s.kind}${s.fig ? "+그림" : ""}` : s.type;
      cnt[k] = (cnt[k] || 0) + 1;
    }
    return { id: l.id, title: l.title, seq: l.steps.map((s) => (s.type === "quiz" ? `q:${s.kind}${s.fig ? "*" : ""}` : s.type + (s.scene ? ":" + s.scene : "") + (s.mode ? "/" + s.mode : ""))), cnt };
  }),
}));
fs.writeFileSync(path.join(OUT, "g1-labs.json"), JSON.stringify({ rows, quiz, pageErrors }, null, 1), "utf8");
console.log(`DONE rows=${rows.length} pageErrors=${pageErrors}`);
await browser.close();
