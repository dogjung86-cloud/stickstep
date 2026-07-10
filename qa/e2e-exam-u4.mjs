// 단원 종합 평가(u4 물질의 상태 변화) E2E — 응시 → 일괄 채점 → 6파트 진단 → 리뷰 → 레슨 바로가기 →
// 재응시 페이월 → (정복+프리미엄) 재응시 → 정복 인증 + 신기록 XP + 발주 사진 로드까지 실플레이.
// PORT=<포트> node qa/e2e-exam-u4.mjs — dev 서버 필수(보기 선택이 dev 전용 data-oi/data-ans를 쓴다).
// u3판과의 차이: 레슨 6개(추출은 3·3·3·3·3·3+잔여 2 = t가 3 또는 4), 인트로 "여섯 파트" 동적 문구, exam/u4 사진 8장 로드 검증.
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
  totalXp: 0, lessons: {}, minigame: {}, exams: {},
};

async function seed(state) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), state);
  await page.reload({ waitUntil: "networkidle" });
  await W(1500);
}

async function gotoU4ExamIntro() {
  await page.waitForSelector(".unit-tab", { timeout: 12000 });
  await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("상태 변화"))?.click());
  await W(650);
  await page.waitForSelector(".screen.active .gm-node.exam", { timeout: 8000 });
  await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
  await W(850);
  await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
}

/** 현재 문항에 답한다 — correct=true면 data-ans의 정답, false면 고의 오답. */
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
    return { qid: q.dataset.qid, type, hasFigure: !!q.querySelector(".q-figure"), imgOk: [...q.querySelectorAll("img")].every((im) => im.complete && im.naturalWidth > 0) };
  }, correct);
}

/** 20문항 실플레이 — 앞 correctCount개 정답, 나머지 오답. 제출 후 결과 화면 대기. */
async function playExam(correctCount) {
  const seen = [];
  for (let i = 0; i < 20; i++) {
    await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
    if (i === 0) ok(await page.evaluate(() => document.querySelector(".screen.active .btn.cta").disabled), "문항 답 선택 전 CTA 잠김");
    const r = await answerCurrent(i < correctCount);
    if (r.err) throw new Error(`${r.err} at q${i + 1}`);
    seen.push(r);
    await W(150);
    const disabled = await page.evaluate(() => document.querySelector(".screen.active .btn.cta").disabled);
    if (disabled) throw new Error(`CTA still disabled at q${i + 1} (${r.qid})`);
    await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
    await W(330);
  }
  await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
  await W(900);
  return seen;
}

// ═══════════ 0. 발주 사진 8장 로드(exam/u4) ═══════════
console.log("0. 발주 사진 로드");
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
const PHOTOS = ["squid-dry", "dew-grass", "frost-leaf", "fog-mirror", "dryice-cup", "candle-wax", "window-frost", "kettle-steam"];
const photoRes = await page.evaluate(async (names) => {
  const out = [];
  for (const n of names) {
    const r = await new Promise((res) => {
      const im = new Image();
      im.onload = () => res(im.naturalWidth);
      im.onerror = () => res(0);
      im.src = `/exam/u4/${n}.webp`;
    });
    out.push({ n, w: r });
  }
  return out;
}, PHOTOS);
ok(photoRes.every((p) => p.w > 0), "exam/u4 사진 8장 전부 로드", JSON.stringify(photoRes.filter((p) => !p.w)));

// ═══════════ A. 무료 첫 응시 — 레슨 진행 0%에서도 열려 있어야 한다 ═══════════
console.log("A. 무료 첫 응시(진행 0%)");
await seed(BASE);
await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("상태 변화"))?.click());
await W(650);
const nodeInfo = await page.evaluate(() => {
  const n = document.querySelector(".screen.active .gm-node.exam");
  return n ? { aria: n.getAttribute("aria-label"), disabled: n.getAttribute("aria-disabled") } : null;
});
ok(!!nodeInfo, "지도에 평가 노드 존재");
ok(nodeInfo && nodeInfo.disabled == null, "평가 노드는 잠금 없음(항상 입장 가능)");
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
await W(850);
ok((await page.evaluate(() => document.querySelector(".screen.active .ex-title")?.textContent)) === "단원 종합 평가", "인트로 진입");
const ruleTxt = await page.evaluate(() => [...document.querySelectorAll(".screen.active .ex-rule-s")].map((x) => x.textContent).join(" | "));
ok(ruleTxt.includes("여섯 파트"), "인트로 파트 수 동적 문구(여섯 파트)", ruleTxt);
ok((await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.textContent)) === "시험 시작하기", "첫 응시 CTA = 시험 시작하기");
await shot("exam-u4-a-intro");
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(650);

const seenA = await playExam(14); // 14개 정답 → 70점
ok(seenA.length === 20, "20문항 출제");
ok(new Set(seenA.map((s) => s.qid)).size === 20, "문항 중복 없음");
ok(seenA.filter((s) => s.hasFigure).every((s) => s.imgOk), "시험 중 그림 문항 이미지 로드(있다면)");

const resultA = await page.evaluate(() => {
  const a = document.querySelector(".screen.active");
  return {
    score: a.querySelector(".ex-score-hero")?.dataset?.score,
    sub: a.querySelector(".ex-score-sub")?.textContent,
    xp: a.querySelector(".ex-xp")?.textContent ?? "",
    diag: [...a.querySelectorAll(".ex-diag-row")].map((x) => ({ lesson: x.dataset.lesson, c: +x.dataset.c, t: +x.dataset.t, weak: x.classList.contains("weak"), btn: !!x.querySelector(".ex-diag-btn") })),
    review: a.querySelectorAll(".xr-row").length,
    wrong: a.querySelectorAll(".xr-row.bad").length,
    conqBadge: !!a.querySelector(".ex-conq"),
  };
});
ok(resultA.score === "70", "일괄 채점 점수 70점", JSON.stringify(resultA.score));
ok(resultA.sub?.includes("14개 정답"), "정답 수 표기");
ok(resultA.xp.includes("+70 XP"), "첫 응시 신기록 XP(+70)");
ok(resultA.diag.length === 6, "진단 6개 레슨 전부 표시", String(resultA.diag.length));
ok(resultA.diag.reduce((s, d) => s + d.c, 0) === 14 && resultA.diag.reduce((s, d) => s + d.t, 0) === 20, "진단 정오 합계 = 14/20");
ok(resultA.diag.every((d) => d.t === 3 || d.t === 4) && resultA.diag.filter((d) => d.t === 4).length === 2, "레슨 균형 추출(6레슨 — 3문항×4 + 4문항×2)", JSON.stringify(resultA.diag.map((d) => d.t)));
const weakRows = resultA.diag.filter((d) => d.weak);
const worstRatio = Math.min(...resultA.diag.map((d) => d.c / d.t));
ok(weakRows.length > 0 && weakRows.every((d) => d.c / d.t === worstRatio), "최저 정답률 파트에 약점 태그");
ok(resultA.diag.filter((d) => d.c < d.t).every((d) => d.btn), "오답 있는 파트마다 복습 버튼");
ok(resultA.review === 20 && resultA.wrong === 6, "전 문항 리뷰 20행 · 오답 6행");
ok(!resultA.conqBadge, "정복 전 응시라 인증 배지 없음");
const stA = await store();
ok(stA.exams?.u4exam?.attempts === 1 && stA.exams?.u4exam?.best === 70 && stA.exams?.u4exam?.conquered === false, "store 기록(1회·70점·미정복)", JSON.stringify(stA.exams));
ok(stA.totalXp === 70, "XP 지급 = 점수만큼(첫 신기록)", String(stA.totalXp));
await shot("exam-u4-a-result");

// 오답 리뷰 펼치기 — 해설·핵심 한 줄·레슨 바로가기 + 그림 재렌더
await page.evaluate(() => document.querySelector(".screen.active .xr-row.bad .xr-head").click());
await W(400);
const reviewA = await page.evaluate(() => {
  const row = document.querySelector(".screen.active .xr-row.bad.open");
  const b = row?.querySelector(".xr-body");
  return {
    open: !!row,
    expl: (b?.querySelector(".xr-expl-body")?.textContent?.length ?? 0) > 150,
    core: !!b?.querySelector(".xr-core"),
    lessonBtn: b?.querySelector(".xr-lesson-btn")?.textContent ?? "",
    marksOrPair: !!b?.querySelector(".opt.ok, .xr-pair-cell.ok"),
  };
});
ok(reviewA.open && reviewA.expl && reviewA.core, "오답 리뷰: 해설(150자+)·핵심 한 줄 렌더");
ok(reviewA.marksOrPair, "오답 리뷰: 정답 표시(ok 마크/정답 카드)");
ok(reviewA.lessonBtn.includes("복습하기"), "오답 리뷰: 레슨 바로가기 버튼");
await shot("exam-u4-a-review");

// 레슨 바로가기 → 레슨 플레이어 → 닫기 → 홈
await page.evaluate(() => document.querySelector(".screen.active .xr-row.bad.open .xr-lesson-btn").click());
await W(1000);
ok(await page.evaluate(() => !!document.querySelector(".screen.active.lesson-screen")), "리뷰에서 레슨 플레이어로 이동");
await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']").click());
await W(1000);
ok(await page.evaluate(() => !!document.querySelector(".screen.active .gamemap")), "레슨 닫기 → 홈 복귀");

// ═══════════ B. 재응시 잠금 → 페이월 ═══════════
console.log("B. 재응시 페이월");
const nodeBest = await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam .gm-exam-best")?.textContent);
ok(nodeBest === "최고 70점", "지도 노드에 최고 점수 필", nodeBest ?? "none");
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
await W(850);
const introB = await page.evaluate(() => {
  const a = document.querySelector(".screen.active");
  return { cta: a.querySelector(".btn.cta")?.textContent, gold: a.querySelector(".btn.cta")?.classList.contains("gold"), stats: [...a.querySelectorAll(".ex-stat")].map((s) => s.textContent) };
});
ok(introB.cta === "프리미엄으로 다시 풀기" && introB.gold, "무료 소진 후 재응시 CTA = 페이월 골드");
ok(introB.stats.some((s) => s.includes("최고 70점")) && introB.stats.some((s) => s.includes("1회 응시")), "인트로 응시 기록 칩");
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(900);
ok(await page.evaluate(() => document.querySelector(".screen.active .pw-title")?.textContent?.includes("프리미엄")), "페이월 화면 진입");
await page.evaluate(() => document.querySelector(".screen.active .backbtn").click());
await W(800);
ok((await page.evaluate(() => document.querySelector(".screen.active .ex-title")?.textContent)) === "단원 종합 평가", "페이월 닫기 → 인트로 복귀");

// ═══════════ C. 정복 100% + 프리미엄 재응시 — 인증 배지·신기록 XP ═══════════
console.log("C. 정복+프리미엄 재응시");
const lessons = {};
for (let i = 1; i <= 6; i++) lessons[`u4l${i}`] = { done: true, acc: 95, bestXp: 120 };
await seed({ ...BASE, premium: true, lessons, totalXp: 70, exams: { u4exam: { attempts: 1, best: 70, conquered: false } } });
await gotoU4ExamIntro();
const introC = await page.evaluate(() => {
  const a = document.querySelector(".screen.active");
  return { cta: a.querySelector(".btn.cta")?.textContent, hint: a.querySelector(".ex-conq-hint")?.textContent ?? "" };
});
ok(introC.cta === "시험 시작하기", "프리미엄이면 재응시 바로 가능");
ok(introC.hint.includes("지금 응시하면"), "정복 100% 상태 인증 안내");
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(650);
await playExam(20); // 전부 정답 → 100점
const resultC = await page.evaluate(() => {
  const a = document.querySelector(".screen.active");
  return {
    score: a.querySelector(".ex-score-hero")?.dataset?.score,
    conqBadge: !!a.querySelector(".ex-conq"),
    conqTitle: a.querySelector(".ex-conq-t")?.textContent ?? "",
    xp: a.querySelector(".ex-xp")?.textContent ?? "",
    perfect: !!a.querySelector(".ex-diag-perfect"),
    weak: a.querySelectorAll(".ex-diag-row.weak").length,
    retake: a.querySelector(".ex-retake")?.textContent ?? "",
  };
});
ok(resultC.score === "100", "만점 채점", resultC.score ?? "");
ok(resultC.conqBadge && resultC.conqTitle.includes("정복 인증"), "정복 인증 배지");
ok(resultC.xp.includes("+30 XP"), "신기록 갱신분만 XP(100−70=+30)", resultC.xp);
ok(resultC.perfect && resultC.weak === 0, "만점 진단(약점 태그 없음)");
ok(resultC.retake.includes("다시 응시하기") && !resultC.retake.includes("프리미엄"), "프리미엄 재응시 버튼(게이트 없음)");
const stC = await store();
ok(stC.exams.u4exam.attempts === 2 && stC.exams.u4exam.best === 100 && stC.exams.u4exam.conquered === true, "store 기록(2회·100점·정복)", JSON.stringify(stC.exams));
ok(stC.totalXp === 100, "누적 XP = 70 + 30", String(stC.totalXp));
await shot("exam-u4-c-conquered");

// 신기록 미갱신 재응시 — XP 0 확인(파밍 방지)
await page.evaluate(() => document.querySelector(".screen.active .ex-retake").click());
await W(700);
await playExam(10); // 50점 — 신기록 아님
const resultD = await page.evaluate(() => {
  const a = document.querySelector(".screen.active");
  return { score: a.querySelector(".ex-score-hero")?.dataset?.score, xp: a.querySelector(".ex-xp")?.textContent ?? "", best: a.querySelector(".ex-xp.quiet")?.textContent ?? "" };
});
const stD = await store();
ok(resultD.score === "50", "재응시 채점 50점");
ok(!resultD.xp.includes("신기록") && resultD.best.includes("최고 기록 100점"), "신기록 미갱신 시 XP 없음 + 최고 기록 표시");
ok(stD.totalXp === 100 && stD.exams.u4exam.best === 100 && stD.exams.u4exam.attempts === 3, "store: XP 불변·최고점 유지·응시 3회");

// 홈 복귀 — 정복 노드 골드 확인
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(1000);
const nodeC = await page.evaluate(() => {
  const n = document.querySelector(".screen.active .gm-node.exam");
  return { conq: n?.classList.contains("conq"), ribbon: n?.querySelector(".gm-ribbon")?.textContent, best: n?.querySelector(".gm-exam-best")?.textContent };
});
ok(nodeC.conq && nodeC.ribbon === "정복 인증" && nodeC.best === "최고 100점", "지도 노드 정복 골드 + 리본 + 최고점", JSON.stringify(nodeC));
await shot("exam-u4-c-map");

console.log(`\n결과: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
