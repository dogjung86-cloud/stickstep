// 중1 Ⅱ 생물의 구성과 다양성 단원 종합 평가 v3: 여덟 시험지 출제 검사. PORT=<dev 포트> node qa/e2e-exam-u2-forms.mjs
// (qa/e2e-exam-g2u7-forms.mjs를 이 풀에 맞춘 것. 레슨 10개라 시험지마다 레슨당 정확히 2문항이고 숫자 입력이 없다.)
// 프리미엄 계정으로 아홉 번 응시하며 본다.
//   1) 1~8번째 응시의 문항이 서로 하나도 겹치지 않고 합치면 160문항 전부인가
//   2) 응시마다 20문항, 레슨마다 2문항, 난이도 하 8 중 8 상 4, 모두 고르기 2~3인가
//   3) 9번째 응시는 8번째와 겹치지 않는가(한 바퀴 돈 뒤에도 연속 응시는 겹치지 않는다)
//   4) 그림 고르기(여러 칸), 짝짓기(머리줄), 표, 리뷰의 보기별 이유가 화면에 나오는가(폰과 넓은 화면 캡처는 qa/shots/u2v3-*.png)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
let PASS = 0, FAIL = 0, pageErrors = 0;
const ok = (cond, name, extra = "") => { if (cond) { PASS++; console.log("  ok  ", name); } else { FAIL++; console.log("  FAIL", name, extra); } };

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {},
};

async function open(viewport, scale) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  // 동시 세션이 소스를 저장해도 풀 리로드로 죽지 않게 한다. CSS 주입(updateStyle)은 살리고 웹소켓과 리로드만 뺀다
  // (qa/e2e-steprush.mjs의 스텁. 그래서 캡처에 스타일이 실린다)
  await page.route("**/@vite/client", (r) => r.fulfill({
    contentType: "application/javascript",
    body: `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`,
  }));
  page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });
  const W = (ms) => page.waitForTimeout(ms);
  await page.addInitScript((s) => { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("science-app.v1", JSON.stringify(s)); sessionStorage.setItem("seeded", "1"); } }, BASE);
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(Math.round(viewport.width / 2), 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await W(600);
  await page.waitForSelector(".unit-tab", { timeout: 12000 });
  await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("생물의 구성과 다양성"))?.click());
  await W(650);
  await page.waitForSelector(".screen.active .gm-node.exam", { timeout: 8000 });
  await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
  await W(850);
  await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
  return { page, W };
}

/** 현재 문항에 답한다(dev 전용 data-ans 사용). 화면에 무엇이 있는지도 돌려준다. */
async function answerCurrent(page, correct) {
  return page.evaluate(async (correct) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const a = document.querySelector(".screen.active"), q = a.querySelector(".ex-q");
    if (!q) return { err: "no-q" };
    const type = q.dataset.type, ans = JSON.parse(q.dataset.ans);
    const info = { qid: q.dataset.qid, type, cols: a.querySelector(".ex-opts.cols2, .ex-opts.cols3") ? 1 : 0, optFig: !!a.querySelector(".opt .ex-optfig svg"), head: !!a.querySelector(".ex-opt-head"), table: !!q.querySelector(".ex-table"), fig: !!q.querySelector(".q-figure svg"), bogi: !!q.querySelector(".ex-bogi, .bogi") };
    if (type === "mcq") {
      const opts = [...a.querySelectorAll(".opts .opt")];
      (correct ? opts.find((o) => +o.dataset.oi === ans) : opts.find((o) => +o.dataset.oi !== ans)).click();
    } else if (type === "multi") {
      const opts = [...a.querySelectorAll(".opts .opt")];
      if (correct) for (const oi of ans) { opts.find((o) => +o.dataset.oi === oi).click(); await sleep(40); }
      else opts.find((o) => !ans.includes(+o.dataset.oi)).click();
    } else return { err: `모르는 유형 ${type}` };
    return info;
  }, correct);
}

async function playExam(page, W, wrongAt, shots) {
  const seen = [];
  for (let i = 0; i < 20; i++) {
    await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
    const peek = await page.evaluate(() => { const a = document.querySelector(".screen.active"); return { cols: !!a.querySelector(".ex-opts.cols2, .ex-opts.cols3"), head: !!a.querySelector(".ex-opt-head"), table: !!a.querySelector(".ex-q .ex-table"), fig: !!a.querySelector(".ex-q .q-figure svg") }; });
    if (shots) for (const k of ["cols", "head", "table", "fig"]) if (peek[k] && !shots.done[k]) { shots.done[k] = true; await W(350); await page.screenshot({ path: `qa/shots/u2v3-${shots.tag}-${k}.png` }); }
    const r = await answerCurrent(page, !wrongAt.includes(i));
    if (r.err) throw new Error(`${r.err} at q${i + 1}`);
    seen.push(r);
    await W(120);
    if (await page.evaluate(() => document.querySelector(".screen.active .btn.cta").disabled)) throw new Error(`답을 넣었는데 버튼이 잠겨 있다: ${r.qid} (${r.type})`);
    await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
    await W(280);
  }
  await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
  await W(700);
  return seen;
}

// ═══════════ 폰: 아홉 번 응시 ═══════════
console.log("A. 폰 화면에서 아홉 번 응시");
const { page, W } = await open({ width: 420, height: 900 }, 2);
const pool = await page.evaluate(async () => { const m = await import("/src/content/exams/u2.ts"); return m.U2_EXAM.pool.map((it) => ({ id: it.id, lessonId: it.lessonId, diff: it.diff, type: it.type })); });
ok(pool.length === 160, "풀 160문항", String(pool.length));
const meta = new Map(pool.map((p) => [p.id, p]));
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
const attempts = [], shots = { tag: "phone", done: {} };
for (let n = 1; n <= 9; n++) {
  const seen = await playExam(page, W, n === 1 ? [0, 1, 2, 5, 9] : [], n <= 3 ? shots : null);
  attempts.push(seen);
  const ids = seen.map((s) => s.qid), byLesson = {}, lv = { 1: 0, 2: 0, 3: 0 };
  for (const id of ids) { const m = meta.get(id); byLesson[m.lessonId] = (byLesson[m.lessonId] || 0) + 1; lv[m.diff]++; }
  const lessonOk = Object.keys(byLesson).length === 10 && Object.values(byLesson).every((c) => c === 2);
  const multi = seen.filter((s) => s.type === "multi").length;
  ok(new Set(ids).size === 20 && lessonOk && lv[1] === 8 && lv[2] === 8 && lv[3] === 4 && multi >= 2 && multi <= 3, `${n}번째 응시: 20문항, 레슨마다 2문항, 하 8 중 8 상 4, 모두 고르기 2~3`, JSON.stringify({ byLesson, lv, multi }));
  if (n === 1) {
    // 리뷰에서 틀린 문항을 펼쳐 보기별 이유가 나오는지 본다
    const rows = await page.$$(".screen.active .xr-row.bad .xr-head");
    for (const r of rows.slice(0, 5)) { await r.click(); await W(200); }
    const whyN = await page.evaluate(() => document.querySelectorAll(".screen.active .xr-row.open .xr-why").length);
    ok(whyN > 0, "리뷰에 보기별 이유가 나온다", String(whyN));
    const open1 = await page.$(".screen.active .xr-row.open");
    if (open1) await open1.screenshot({ path: "qa/shots/u2v3-phone-review.png" });
  }
  if (n < 9) {
    await page.evaluate(() => document.querySelector(".screen.active .ex-retake").click());
    await W(700);
    if (!(await page.$(".screen.active .ex-q"))) { await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click()); await W(400); }
  }
}
const first8 = attempts.slice(0, 8).flatMap((a) => a.map((s) => s.qid));
ok(new Set(first8).size === 160, "1~8번째 응시의 문항이 하나도 겹치지 않고 160문항을 다 쓴다", `서로 다른 문항 ${new Set(first8).size}`);
const a8 = new Set(attempts[7].map((s) => s.qid)), a9 = attempts[8].map((s) => s.qid);
ok(a9.every((id) => !a8.has(id)), "9번째 응시는 8번째와 겹치지 않는다");
const all = attempts.flat();
ok(all.some((s) => s.cols && s.optFig), "그림 고르기 문항이 여러 칸으로 나온다");
ok(all.some((s) => s.head), "짝짓기 문항에 머리줄이 나온다");
ok(all.some((s) => s.table), "표가 있는 문항이 나온다");
ok(all.every((s) => s.type === "mcq" || s.type === "multi"), "숫자 입력 문항이 없다");
await page.close();

// ═══════════ 넓은 화면: 그림은 왼쪽, 답은 오른쪽 ═══════════
console.log("B. 넓은 화면");
const wide = await open({ width: 1366, height: 900 }, 1);
ok(await wide.page.evaluate(() => document.documentElement.classList.contains("wide")), "넓은 화면으로 열린다");
await wide.page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await playExam(wide.page, wide.W, [], { tag: "wide", done: {} });
await wide.page.close();

console.log(`\n결과: 통과 ${PASS}, 실패 ${FAIL}, 페이지 오류 ${pageErrors}`);
await browser.close();
process.exit(FAIL || pageErrors ? 1 : 0);
