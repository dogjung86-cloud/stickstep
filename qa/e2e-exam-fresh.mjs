// 단원 종합 평가 무중복 순환 출제 E2E(2026-08-22) — drawFreshExamItems 계약을 실플레이로 검증.
// ① 연속 응시 2회의 시험지가 완전히 다르다(핵심 요구) ② 출제 이력은 제출 완료 때만 저장(중도
// 이탈 미기록) ③ 은행 한 바퀴(seen 150/160) 후 리셋 — 직전 응시분(꼬리 20)은 계속 제외.
// PORT=<포트> node qa/e2e-exam-fresh.mjs — dev 서버 필수(data-qid/data-ans가 dev 전용).
// 부팅부·응답 헬퍼는 qa/e2e-exam-u3.mjs 관례를 그대로 계승한다.
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
const store = () => page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {},
};

async function seed(state) {
  await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), state);
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await W(1200);
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(210, 300);
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
    { timeout: 15000 },
  );
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
  });
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await W(600);
}

async function gotoU3ExamIntro() {
  await page.waitForSelector(".unit-tab", { timeout: 12000 });
  await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("열"))?.click());
  await W(650);
  await page.waitForSelector(".screen.active .gm-node.exam", { timeout: 8000 });
  await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
  await W(850);
  await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
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

/** 20문항 완주 — qid 목록 반환. 제출 후 결과 화면 대기. */
async function playExam(correctCount = 5) {
  const qids = [];
  for (let i = 0; i < 20; i++) {
    await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
    const r = await answerCurrent(i < correctCount);
    if (r.err) throw new Error(`${r.err} at q${i + 1}`);
    qids.push(r.qid);
    await W(120);
    await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
    await W(300);
  }
  await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
  await W(900);
  return qids;
}

const uniq = (arr) => new Set(arr).size === arr.length;
const overlap = (a, b) => { const s = new Set(a); return b.filter((x) => s.has(x)); };

// ═══════════ A. 연속 응시 2회 = 완전히 다른 시험지 ═══════════
console.log("A. 연속 응시 무중복");
await seed(BASE);
await gotoU3ExamIntro();
ok(
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .ex-rule-s")].some((s) => s.textContent.includes("새 문제부터"))),
  "인트로 규칙에 무중복 안내 문구",
);
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(650);
const A1 = await playExam();
ok(A1.length === 20 && uniq(A1), "1회차 20문항·중복 없음");
const st1 = await store();
ok(
  Array.isArray(st1.exams?.u3exam?.seen) && st1.exams.u3exam.seen.length === 20 && overlap(st1.exams.u3exam.seen, A1).length === 20,
  "제출 후 출제 이력 20개 = 1회차 시험지",
  JSON.stringify(st1.exams?.u3exam?.seen?.length),
);

await page.evaluate(() => document.querySelector(".screen.active .ex-retake").click());
await W(700);
const A2 = await playExam();
ok(A2.length === 20 && uniq(A2), "2회차 20문항·중복 없음");
const dup = overlap(A1, A2);
ok(dup.length === 0, "1·2회차 시험지 완전 무중복", JSON.stringify(dup));
const st2 = await store();
ok(st2.exams.u3exam.seen.length === 40, "이력 누적 40개", String(st2.exams.u3exam.seen.length));

// ═══════════ B. 중도 이탈은 이력 미기록 ═══════════
console.log("B. 중도 이탈");
await page.evaluate(() => document.querySelector(".screen.active .ex-retake").click());
await W(700);
await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
await answerCurrent(false);
await W(150);
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(400);
await page.evaluate(() => document.querySelector(".screen.active .xbtn").click());
await W(400);
await page.evaluate(() => document.querySelector(".screen.active .ex-quit-leave").click());
await W(900);
const stQuit = await store();
ok(stQuit.exams.u3exam.seen.length === 40 && stQuit.exams.u3exam.attempts === 2, "그만두기 후 이력·응시 수 불변", JSON.stringify({ seen: stQuit.exams.u3exam.seen.length, att: stQuit.exams.u3exam.attempts }));

// ═══════════ C. 레슨 은행 리셋 경계 — 균형·미출제 우선·직전 응시 제외가 함께 성립 ═══════════
console.log("C. 리셋 경계");
const poolMeta = await page.evaluate(async () => {
  const { examForUnit } = await import("/src/content/exams/index.ts");
  const def = examForUnit("u3");
  return { ids: def.pool.map((it) => it.id), lessonOf: Object.fromEntries(def.pool.map((it) => [it.id, it.lessonId])) };
});
const poolIds = poolMeta.ids;
ok(poolIds.length >= 60, `u3 풀 크기 ${poolIds.length}`);
const preSeen = poolIds.slice(0, 150); // 풀 순서 = 레슨 블록 순 — 앞 레슨들은 전부 소진, 마지막 레슨만 10개 미출제
const unseen10 = poolIds.slice(150);
const tail20 = preSeen.slice(-20);
await seed({ ...BASE, exams: { u3exam: { attempts: 1, best: 10, conquered: false, seen: preSeen } } });
await gotoU3ExamIntro();
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(650);
const C1 = await playExam();
ok(C1.length === 20 && uniq(C1), "리셋 응시 20문항·중복 없음");
const cCnt = {};
for (const id of C1) cCnt[poolMeta.lessonOf[id]] = (cCnt[poolMeta.lessonOf[id]] || 0) + 1;
ok(Object.values(cCnt).length === 5 && Object.values(cCnt).every((n) => n === 4), "은행 바닥 상태에서도 레슨 균형 4×5 불변", JSON.stringify(cCnt));
// 미출제 우선 — 각 레슨 쿼터(4)가 허용하는 만큼 미출제 문항이 전부 출제돼야 한다
const unseenCnt = {};
for (const id of unseen10) unseenCnt[poolMeta.lessonOf[id]] = (unseenCnt[poolMeta.lessonOf[id]] || 0) + 1;
const expectFresh = Object.values(unseenCnt).reduce((s, n) => s + Math.min(4, n), 0);
ok(overlap(unseen10, C1).length === expectFresh, `미출제 우선(가능한 미출제 ${expectFresh}개 전부 출제)`, JSON.stringify(overlap(unseen10, C1)));
const tailHit = overlap(tail20, C1);
ok(tailHit.length === 0, "리셋 후에도 직전 응시분(꼬리 20)은 제외", JSON.stringify(tailHit));
ok(overlap(preSeen.slice(0, 130), C1).length > 0, "리셋 확인(한 바퀴 돈 문항이 다시 후보로)");
// 저장 이력 정밀 대조 — 유지분(직전 시험지 + 리셋 안 된 레슨의 이력, 이번 출제분 제외) ++ 새 시험지
const stC = await store();
const nonReset = new Set(Object.entries(unseenCnt).filter(([, n]) => n >= 4).map(([l]) => l));
const drawnSet = new Set(C1);
const tailSet = new Set(tail20);
const expectSeen = [
  ...preSeen.filter((id) => !drawnSet.has(id) && (tailSet.has(id) || nonReset.has(poolMeta.lessonOf[id]))),
  ...C1,
];
ok(
  JSON.stringify(stC.exams.u3exam.seen) === JSON.stringify(expectSeen),
  "저장 이력 = 유지분 + 새 시험지(리셋 레슨 옛 이력 정리)",
  `${stC.exams.u3exam.seen?.length} vs ${expectSeen.length}`,
);
await page.evaluate(() => document.querySelector(".screen.active .ex-retake").click());
await W(700);
const C2 = await playExam();
ok(overlap(C1, C2).length === 0, "리셋 직후 연속 응시도 무중복", JSON.stringify(overlap(C1, C2)));

// ═══════════ D. 사이클 전 구간 불변식 — 풀 구성이 다른 시험 3종 모듈 시뮬레이션 ═══════════
console.log("D. 사이클 시뮬레이션(u3·g2u5·m2u5)");
const sim = await page.evaluate(async () => {
  const { examForUnit, drawFreshExamItems } = await import("/src/content/exams/index.ts");
  const out = [];
  for (const unitId of ["u3", "g2u5", "m2u5"]) {
    const def = examForUnit(unitId);
    const lessonIds = [...new Set(def.pool.map((it) => it.lessonId))];
    const per = Math.floor(def.pick / lessonIds.length);
    const maxWant = per + (def.pick - per * lessonIds.length > 0 ? 1 : 0);
    const minPool = Math.min(...lessonIds.map((l) => def.pool.filter((it) => it.lessonId === l).length));
    const freshDraws = Math.floor(minPool / maxWant); // 이만큼은 어떤 잔여 배정에서도 전 문항 무중복
    const draws = Math.floor(def.pool.length / def.pick) + 2; // 리셋 너머까지
    let balanceFail = 0, dupFail = 0, freshFail = 0, minCnt = Infinity, maxCnt = 0;
    for (let r = 0; r < 60; r++) {
      let seen = [], prev = new Set(), all = new Set();
      for (let d = 0; d < draws; d++) {
        const res = drawFreshExamItems(def, seen);
        seen = res.seen;
        const ids = res.items.map((it) => it.id);
        if (ids.some((id) => prev.has(id))) dupFail++;
        prev = new Set(ids);
        const cnt = Object.fromEntries(lessonIds.map((l) => [l, 0]));
        for (const it of res.items) cnt[it.lessonId]++;
        for (const v of Object.values(cnt)) {
          minCnt = Math.min(minCnt, v);
          maxCnt = Math.max(maxCnt, v);
          if (v < per || v > maxWant) balanceFail++;
        }
        if (d < freshDraws) for (const id of ids) { if (all.has(id)) freshFail++; all.add(id); }
      }
    }
    out.push({ unitId, per, maxWant, freshDraws, draws, balanceFail, dupFail, freshFail, minCnt, maxCnt });
  }
  return out;
});
for (const r of sim) {
  ok(r.balanceFail === 0, `${r.unitId} 전 ${r.draws}회차 레슨 균형 불변(쿼터 ${r.per}~${r.maxWant} · 실측 ${r.minCnt}~${r.maxCnt}) ×60사이클`);
  ok(r.dupFail === 0, `${r.unitId} 직전 응시 겹침 0(리셋 경계 포함)`);
  ok(r.freshFail === 0, `${r.unitId} 첫 ${r.freshDraws}응시 전 문항 완전 무중복`);
}

console.log(`\n결과: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
