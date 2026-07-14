// 오답노트 E2E — 시험 오답 수집 → 복습 탭 진입 카드 → 노트 목록(과목 세그·단원 섹션) →
// 다시 풀기(극복/재오답) → 극복 섹션 이동 → 레슨 퀴즈 훅 불변식 → 빈 상태 → 과목·단원 구분까지 실플레이.
// PORT=<포트> node qa/e2e-notebook.mjs — dev 서버 필수(시험 보기 선택이 dev 전용 data-oi/data-ans를 쓴다).
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

let PASS = 0, FAIL = 0;
const ok = (cond, name, extra = "") => {
  if (cond) { PASS++; console.log("  ok  ", name); }
  else { FAIL++; console.log("  FAIL", name, extra); }
};
const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const store = () => page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
};

async function seed(state) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), state);
  await page.reload({ waitUntil: "networkidle" });
  await W(1500);
}

async function answerCurrent(correct) {
  return page.evaluate(async (correct) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const a = document.querySelector(".screen.active");
    const q = a.querySelector(".ex-q");
    if (!q) return { err: "no-q" };
    const type = q.dataset.type;
    const ans = JSON.parse(q.dataset.ans);
    if (type === "mcq") {
      const opts = [...a.querySelectorAll(".opts .opt")];
      (correct ? opts.find((o) => +o.dataset.oi === ans) : opts.find((o) => +o.dataset.oi !== ans)).click();
    } else if (type === "multi") {
      const opts = [...a.querySelectorAll(".opts .opt")];
      if (correct) for (const oi of ans) { opts.find((o) => +o.dataset.oi === oi).click(); await sleep(45); }
      else { const w = opts.map((o) => +o.dataset.oi).find((x) => !ans.includes(x)); opts.find((o) => +o.dataset.oi === w).click(); }
    } else if (type === "num") {
      const val = correct ? String(ans) : "999";
      for (const ch of val) { [...a.querySelectorAll(".mnp-k")].find((k) => k.textContent.trim() === ch)?.click(); await sleep(35); }
    } else {
      const chips = [...a.querySelectorAll(".ex-chip")];
      (correct ? chips.find((c) => c.dataset.w === String(ans)) : chips.find((c) => c.dataset.w !== String(ans))).click();
    }
    return { qid: q.dataset.qid, type };
  }, correct);
}

// 오답노트 정본 진입 = 복습 탭(2026-07-12 IA 개편 — 구 마이페이지 경로는 폐기)
async function openReviewTab() {
  await page.waitForSelector(".screen.active .gnav", { timeout: 8000 });
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .gnav-item")].find((b) => b.textContent.includes("복습"))?.click());
  await W(650);
  await page.waitForSelector(".screen.active .nb-entry .nb-entry-n", { timeout: 8000 });
}

async function openNotebook() {
  await openReviewTab();
  await page.evaluate(() => document.querySelector(".screen.active .nb-entry").click());
  await W(650);
  await page.waitForSelector(".screen.active .nb-htitle", { timeout: 8000 });
}

// ═══════════ A. 시험 오답 3개 수집 ═══════════
console.log("A. 시험(u3) 17/20 — 오답 3개 수집");
await seed(BASE);
await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("열"))?.click());
await W(650);
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
await W(850);
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(650);
for (let i = 0; i < 20; i++) {
  await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
  const r = await answerCurrent(i < 17);
  if (r.err) throw new Error(`${r.err} at q${i + 1}`);
  await W(150);
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
  await W(300);
}
await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
await W(900);

let st = await store();
let notes = Object.values(st.wrongNotes ?? {});
ok(notes.length === 3, "오답노트 3건 기록", `got ${notes.length}`);
ok(notes.every((n) => n.kind === "exam" && n.key.startsWith("e:u3exam:")), "키 형식 e:u3exam:*");
ok(notes.every((n) => !n.overcome && n.wrongCount === 1), "초기 상태: 미극복·1회");
ok(notes.every((n) => n.q && n.explain && n.lessonId.startsWith("u3l")), "스냅샷(문항·해설·레슨) 보존");

// ═══════════ B. 마이페이지 진입 카드 → 오답노트 목록 ═══════════
console.log("B. 복습 탭 카드 → 목록");
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click()); // 결과 → 홈
await W(900);
await openReviewTab();
const entryTxt = await page.evaluate(() => document.querySelector(".screen.active .nb-entry-n")?.textContent);
ok(entryTxt === "3문항 대기", "진입 카드 카운트", entryTxt);
await page.evaluate(() => document.querySelector(".screen.active .nb-entry").click());
await W(650);
await page.waitForSelector(".screen.active .nb-htitle", { timeout: 8000 });
const cardCount = await page.evaluate(() => document.querySelectorAll(".screen.active .nb-card").length);
ok(cardCount === 3, "노트 카드 3장", String(cardCount));
// 필터형(2026-07-15): 상태 탭 [다시 풀 | 해결], 과목이 하나면 세그 없음, 단원이 하나면 칩 없음
const tabTxt0 = await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-tabs button")].map((b) => ({ t: b.textContent, on: b.classList.contains("on") })));
ok(tabTxt0.length === 2 && tabTxt0[0].t === "다시 풀 문제 3" && tabTxt0[0].on && tabTxt0[1].t === "해결한 문제 0", "상태 탭(다시 풀 3 · 해결 0)", JSON.stringify(tabTxt0));
ok(await page.evaluate(() => !!document.querySelector(".screen.active .nb-card .nb-src")), "출처 라벨 표시");
ok(await page.evaluate(() => !document.querySelector(".screen.active .nb-subjseg")), "단일 과목 → 과목 세그 없음");
ok(await page.evaluate(() => !document.querySelector(".screen.active .nb-uchips")), "단일 단원 → 단원 칩 없음");
await shot("notebook-list");

// ═══════════ C. 다시 풀기 — 정답 → 극복 ═══════════
console.log("C. 다시 풀기 → 극복");
// 선택형(mcq/multi/ox) 노트 하나를 골라 정답을 노트 데이터로 계산해 맞힌다
const target = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("science-app.v1"));
  const n = Object.values(s.wrongNotes).find((x) => Array.isArray(x.answer));
  return n ? { key: n.key, q: n.q, answer: n.answer, type: n.type } : null;
});
ok(!!target, "선택형 노트 존재");
if (target) {
  const solved = await page.evaluate(async ({ q, answer, type }) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const card = [...document.querySelectorAll(".screen.active .nb-card")].find((c) => c.querySelector(".nb-q")?.innerHTML === q);
    if (!card) return "no-card";
    card.querySelector(".nb-retry")?.click();
    await sleep(120);
    const opts = [...card.querySelectorAll(".nb-opt")];
    if (!opts.length) return "no-opts";
    for (const i of answer) { opts[i].click(); await sleep(60); }
    if (type === "multi") { [...card.querySelectorAll(".nb-retry")].find((b) => b.textContent === "확인하기")?.click(); await sleep(120); }
    await sleep(200);
    return card.classList.contains("overcome") ? "overcome" : "not-overcome";
  }, target);
  ok(solved === "overcome", "정답 → 카드 극복 상태", solved);
  st = await store();
  ok(st.wrongNotes[target.key]?.overcome === true, "store에 극복 반영");
}
await W(1600); // 목록 재렌더 대기
const tabAfter = await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-tabs button")].map((b) => b.textContent));
ok(tabAfter[0] === "다시 풀 문제 2" && tabAfter[1] === "해결한 문제 1", "탭 카운트 갱신(2/1)", JSON.stringify(tabAfter));
// 해결한 문제 탭 = 라이브러리(탭을 눌렀을 때만 보인다)
await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-tabs button")][1].click());
await W(350);
const lib = await page.evaluate(() => ({
  cards: document.querySelectorAll(".screen.active .nb-card").length,
  overcome: document.querySelectorAll(".screen.active .nb-card.overcome").length,
  chip: [...document.querySelectorAll(".screen.active .nb-chip.ok")].some((c) => c.textContent === "해결"),
}));
ok(lib.cards === 1 && lib.overcome === 1 && lib.chip, "해결 탭 = 라이브러리 1장(해결 칩)", JSON.stringify(lib));
await shot("notebook-overcome");
await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-tabs button")][0].click()); // 다시 풀 탭 복귀
await W(350);

// ═══════════ D. 다시 풀기 — 오답 → 해설 공개 + 횟수 누적 ═══════════
console.log("D. 다시 틀리면 해설 + 횟수 누적");
const target2 = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("science-app.v1"));
  const n = Object.values(s.wrongNotes).find((x) => Array.isArray(x.answer) && !x.overcome);
  return n ? { key: n.key, q: n.q, answer: n.answer, type: n.type } : null;
});
ok(!!target2, "미극복 선택형 노트 존재");
if (target2) {
  const res = await page.evaluate(async ({ q, answer, type }) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const card = [...document.querySelectorAll(".screen.active .nb-card")].find((c) => c.querySelector(".nb-q")?.innerHTML === q);
    if (!card) return "no-card";
    card.querySelector(".nb-retry")?.click();
    await sleep(120);
    const opts = [...card.querySelectorAll(".nb-opt")];
    const wrong = opts.map((_, i) => i).find((i) => !answer.includes(i));
    opts[wrong].click();
    await sleep(60);
    if (type === "multi") { [...card.querySelectorAll(".nb-retry")].find((b) => b.textContent === "확인하기")?.click(); }
    await sleep(250);
    return {
      explain: !!card.querySelector(".nb-explain"),
      overcome: card.classList.contains("overcome"),
      badMarked: !!card.querySelector(".nb-opt.bad"),
      goodShown: !!card.querySelector(".nb-opt.good"),
    };
  }, target2);
  ok(res.explain === true, "해설 박스 공개", JSON.stringify(res));
  ok(res.overcome === false, "극복 아님 유지");
  ok(res.badMarked && res.goodShown, "오답 빨강 + 정답 초록 표시");
  st = await store();
  ok(st.wrongNotes[target2.key]?.wrongCount === 2, "wrongCount 2로 누적", String(st.wrongNotes[target2.key]?.wrongCount));
}
await shot("notebook-wrong-again");

// ═══════════ E. 레슨 퀴즈 훅 불변식 ═══════════
console.log("E. 레슨 퀴즈 훅(첫 퀴즈에 아무 보기나 답)");
await seed({ ...BASE, lessons: { u3l1: { done: true, acc: 100, bestXp: 30 } } });
await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("열"))?.click());
await W(650);
await page.evaluate(() => [...document.querySelectorAll(".screen.active .gm-node")].find((n) => n.getAttribute("aria-label")?.includes("완료"))?.click());
await W(900);
// 자유 모드 앞으로 가기로 첫 quiz 스텝까지 전진
let foundQuiz = false;
for (let i = 0; i < 30; i++) {
  const hasOpts = await page.evaluate(() => !!document.querySelector(".screen.active .opts .opt"));
  if (hasOpts) { foundQuiz = true; break; }
  const moved = await page.evaluate(() => {
    const b = document.querySelector(".screen.active .xbtn.fwd");
    if (!b || b.style.visibility === "hidden") return false;
    b.click();
    return true;
  });
  if (!moved) break;
  await W(420);
}
ok(foundQuiz, "quiz 스텝 도달(자유 모드)");
if (foundQuiz) {
  await page.evaluate(() => document.querySelector('.screen.active .opts .opt[data-oi="0"]').click());
  await W(200);
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click()); // 확인하기
  await W(700);
  const sheetBad = await page.evaluate(() => document.querySelector(".sheet.open")?.classList.contains("bad") ?? null);
  st = await store();
  const lessonNotes = Object.values(st.wrongNotes ?? {}).filter((n) => n.kind === "lesson" && n.srcId === "u3l1");
  if (sheetBad === true) ok(lessonNotes.length === 1 && !lessonNotes[0].overcome, "오답 → 레슨 노트 기록", JSON.stringify(lessonNotes));
  else if (sheetBad === false) ok(lessonNotes.length === 0, "정답 → 노트 없음");
  else ok(false, "채점 시트 상태 확인 불가");
  console.log(`  (이번 시도는 ${sheetBad ? "오답" : "정답"} 경로를 검증)`);
}

// ═══════════ F. 빈 상태 ═══════════
console.log("F. 빈 상태");
await seed(BASE);
await openNotebook();
ok(await page.evaluate(() => !!document.querySelector(".screen.active .nb-empty")), "빈 상태 안내 표시");
await shot("notebook-empty");

// ═══════════ G. 필터형 탐색(2026-07-15) — 과학+수학+원문 소실 노트를 시딩 ═══════════
console.log("G. 과목 세그 + 상태 탭 + 단원 칩 필터");
const note = (key, lessonId, overcome = false) => ({
  key, kind: "lesson", srcId: lessonId, lessonId, type: "mcq",
  q: `시딩 문항 ${key}`, opts: ["보기1", "보기2", "보기3"], answer: [0],
  explain: "시딩 해설", hasFigure: false, wrongCount: 1, overcome, ts: Date.now(),
});
await seed({
  ...BASE,
  wrongNotes: {
    "l:u3l1:t1": note("l:u3l1:t1", "u3l1"), // 과학 · 중1 III 열
    "l:u3l2:t2": note("l:u3l2:t2", "u3l2", true), // 과학 · 해결(라이브러리 탭)
    "l:u9l9:t3": note("l:u9l9:t3", "u9l9"), // 원문 소실 → 지난 콘텐츠(sci)
    "l:m1u1l1:t4": note("l:m1u1l1:t4", "m1u1l1"), // 수학 · 중1 I 수와 연산
  },
});
await openNotebook();
const segInfo = await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-subjseg .gseg")].map((b) => ({ t: b.textContent, on: b.classList.contains("on") })));
ok(segInfo.length === 2 && segInfo[0].t === "과학 2" && segInfo[1].t === "수학 1", "과목 세그(과학 2 · 수학 1)", JSON.stringify(segInfo));
ok(segInfo[0]?.on === true, "기본 선택 = viewSubject(과학)");
const gTabs = await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-tabs button")].map((b) => b.textContent));
ok(gTabs[0] === "다시 풀 문제 2" && gTabs[1] === "해결한 문제 1", "과학 탭 카운트(2/1)", JSON.stringify(gTabs));
const readChips = () => page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-uchip")].map((c) => ({ t: c.querySelector("span")?.textContent, n: c.querySelector("i")?.textContent, on: c.classList.contains("on") })));
const chips = await readChips();
ok(chips.length === 3 && chips[0].t === "전체" && chips[0].n === "2" && chips[0].on, "단원 칩(전체 2 기본 선택)", JSON.stringify(chips));
ok(chips[1].t === "열" && chips[1].n === "1" && chips[2].t === "지난 콘텐츠" && chips[2].n === "1", "칩 = 열 1 · 지난 콘텐츠 1", JSON.stringify(chips));
const srcAll = await page.evaluate(() => document.querySelector(".screen.active .nb-card .nb-src")?.textContent ?? "");
ok(srcAll.startsWith("열 · "), "전체 보기 = 카드 라벨에 단원 병기", srcAll);
await shot("notebook-filter-all");
// 단원 칩 필터 — 그 단원 카드만, 라벨은 레슨부터
await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-uchip")].find((c) => c.querySelector("span")?.textContent === "열")?.click());
await W(350);
const heatView = await page.evaluate(() => ({
  cards: document.querySelectorAll(".screen.active .nb-card").length,
  src: document.querySelector(".screen.active .nb-card .nb-src")?.textContent ?? "",
}));
ok(heatView.cards === 1 && !heatView.src.startsWith("열 · "), "열 칩 = 그 단원 1장 · 라벨 단원 생략", JSON.stringify(heatView));
await shot("notebook-filter-unit");
// 지난 콘텐츠 칩 — 안내 문구 + 소실 노트만
await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-uchip")].find((c) => c.querySelector("span")?.textContent === "지난 콘텐츠")?.click());
await W(350);
const lostView = await page.evaluate(() => ({ cards: document.querySelectorAll(".screen.active .nb-card").length, hint: !!document.querySelector(".screen.active .nb-unit-hint") }));
ok(lostView.cards === 1 && lostView.hint, "지난 콘텐츠 칩 = 안내 + 1장", JSON.stringify(lostView));
// 해결 탭 — 단원이 하나뿐이라 칩 생략, 해결 카드만
await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-tabs button")][1].click());
await W(350);
const doneView = await page.evaluate(() => ({
  cards: document.querySelectorAll(".screen.active .nb-card").length,
  overcome: document.querySelectorAll(".screen.active .nb-card.overcome").length,
  chips: !!document.querySelector(".screen.active .nb-uchips"),
}));
ok(doneView.cards === 1 && doneView.overcome === 1 && !doneView.chips, "해결 탭 = 1장 · 칩 생략", JSON.stringify(doneView));
// 수학 전환 — 탭 유지(해결 0 = 빈 라이브러리 안내) → 다시 풀 탭에 1장
await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-subjseg .gseg")].find((b) => b.textContent.startsWith("수학"))?.click());
await W(350);
ok(await page.evaluate(() => !!document.querySelector(".screen.active .nb-libempty")), "수학 해결 탭 = 빈 라이브러리 안내");
await page.evaluate(() => [...document.querySelectorAll(".screen.active .nb-tabs button")][0].click());
await W(350);
const mathView = await page.evaluate(() => ({
  tabs: [...document.querySelectorAll(".screen.active .nb-tabs button")].map((b) => b.textContent),
  cards: document.querySelectorAll(".screen.active .nb-card").length,
  src: document.querySelector(".screen.active .nb-card .nb-src")?.textContent ?? "",
}));
ok(mathView.tabs[0] === "다시 풀 문제 1" && mathView.cards === 1 && mathView.src.includes("수와 연산"), "수학 = 1장(수와 연산 병기)", JSON.stringify(mathView));
await shot("notebook-filter-math");

console.log(`\n결과: PASS ${PASS} / FAIL ${FAIL} / pageError ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
