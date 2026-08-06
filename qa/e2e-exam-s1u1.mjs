// 단원 종합 평가(s1u1 세계화 시대, 지리의 힘 — 사회 첫 시험) E2E — 응시 → 일괄 채점 → 6파트 진단 →
// 리뷰 → 레슨 바로가기 → 재응시 페이월 → (정복+프리미엄) 재응시 → 정복 인증 + 신기록 XP까지 실플레이.
// PORT=<포트> node qa/e2e-exam-s1u1.mjs — dev 서버 필수(보기 선택이 dev 전용 data-oi/data-ans/data-w를 쓴다).
// 정본 골격 = qa/e2e-exam-u1.mjs 300줄판. s1u1 차이: 사회 지도 시딩(viewSubject "soc"),
// 레슨 6개(추출 3×4+4×2 · 잔여 2), 인트로 "여섯 파트", 사진 0 대신 soc/climate.webp 자산 로드,
// word 16이라 칩 분기를 실제로 탄다, 무료 레슨이 L1~L3뿐이라 무료 응시 오답은 앞 6문항에 배치
// (시험지는 진도 순 — 리뷰 레슨 점프가 페이월이 아니라 무료 레슨으로 가는지 검증, g2u6 관례).
// HMR 면역 스텁 상설(동시 세션 리로드 면역 — qa/e2e-steprush.mjs 본문이 정본).
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });
// HMR 면역 — @vite/client 스텁(웹소켓 제거·updateStyle 유지, 불완전 스텁은 hot.prune 죽음)
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});const sheets=new Map();export function updateStyle(id,css){let s=sheets.get(id);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s);sheets.set(id,s)}s.textContent=css}export function removeStyle(id){const s=sheets.get(id);if(s){s.remove();sheets.delete(id)}}export function injectQuery(u){return u}",
  }),
);

let PASS = 0, FAIL = 0;
const ok = (cond, name, extra = "") => {
  if (cond) { PASS++; console.log("  ok  ", name); }
  else { FAIL++; console.log("  FAIL", name, extra); }
};
const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const store = () => page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {},
};

async function seed(state) {
  await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), state);
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await W(1400);
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(210, 300); // 플립북 건너뛰기
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

async function gotoExamIntro() {
  await page.waitForSelector(".unit-tab", { timeout: 12000 });
  await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("세계화"))?.click());
  await W(650);
  await page.waitForSelector(".screen.active .gm-node.exam", { timeout: 8000 });
  await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
  await W(850);
  await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
}

/** 현재 문항에 답한다 — correct=true면 data-ans의 정답, false면 고의 오답(word는 칩 클릭). */
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

/** 20문항 실플레이 — pattern(i)이 true면 정답. 제출 후 결과 화면 대기. */
async function playExam(pattern) {
  const seen = [];
  for (let i = 0; i < 20; i++) {
    await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
    if (i === 0) ok(await page.evaluate(() => document.querySelector(".screen.active .btn.cta").disabled), "문항 답 선택 전 CTA 잠김");
    const r = await answerCurrent(pattern(i));
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

// ═══════════ 0. 지도 실데이터 자산(soc/climate.webp — 기후 지도 오버레이) ═══════════
console.log("0. 기후 오버레이 자산 로드");
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
const assetW = await page.evaluate(async () => {
  return await new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im.naturalWidth);
    im.onerror = () => res(0);
    im.src = "/soc/climate.webp";
  });
});
ok(assetW > 0, "soc/climate.webp 로드(기후 지도 그림의 실데이터 오버레이)", String(assetW));

// ═══════════ A. 무료 첫 응시 — 레슨 진행 0%에서도 열려 있어야 한다 ═══════════
console.log("A. 무료 첫 응시(진행 0%)");
await seed(BASE);
await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("세계화"))?.click());
await W(650);
const nodeInfo = await page.evaluate(() => {
  const n = document.querySelector(".screen.active .gm-node.exam");
  return n ? { aria: n.getAttribute("aria-label"), disabled: n.getAttribute("aria-disabled") } : null;
});
ok(!!nodeInfo, "사회 지도에 평가 노드 존재(등록만으로 자동)");
ok(nodeInfo && nodeInfo.disabled == null, "평가 노드는 잠금 없음(항상 입장 가능)");
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
await W(850);
ok((await page.evaluate(() => document.querySelector(".screen.active .ex-title")?.textContent)) === "단원 종합 평가", "인트로 진입");
const ruleTxt = await page.evaluate(() => [...document.querySelectorAll(".screen.active .ex-rule-s")].map((x) => x.textContent).join(" | "));
ok(ruleTxt.includes("여섯 파트"), "인트로 파트 수 동적 문구(여섯 파트)", ruleTxt);
ok((await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.textContent)) === "시험 시작하기", "첫 응시 CTA = 시험 시작하기");
await shot("exam-s1u1-a-intro");
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(650);

// 오답 6을 앞 6문항(L1~L2 무료 구간)에 배치 — 리뷰 레슨 점프가 페이월이 아닌 레슨으로 가는지 검증용
const seenA = await playExam((i) => i >= 6);
ok(seenA.length === 20, "20문항 출제");
ok(new Set(seenA.map((s) => s.qid)).size === 20, "문항 중복 없음");
ok(seenA.filter((s) => s.hasFigure).every((s) => s.imgOk), "시험 중 그림 문항 이미지 로드(있다면)");
ok(seenA.some((s) => s.type === "word"), "word 문항 출제·칩 입력 경로 동작(사회 word 16 규격)");

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
ok(resultA.xp.includes("+70 스텝"), "첫 응시 신기록 스텝(+70)");
ok(resultA.diag.length === 6, "진단 6개 레슨 전부 표시", String(resultA.diag.length));
ok(resultA.diag.reduce((s, d) => s + d.c, 0) === 14 && resultA.diag.reduce((s, d) => s + d.t, 0) === 20, "진단 정오 합계 = 14/20");
const tCounts = resultA.diag.map((d) => d.t).sort((a, b) => a - b);
ok(JSON.stringify(tCounts) === JSON.stringify([3, 3, 3, 3, 4, 4]), "레슨 균형 추출(6레슨 · 3×4+4×2 · 잔여 2는 서로 다른 레슨)", JSON.stringify(tCounts));
const weakRows = resultA.diag.filter((d) => d.weak);
const worstRatio = Math.min(...resultA.diag.map((d) => d.c / d.t));
ok(weakRows.length > 0 && weakRows.every((d) => d.c / d.t === worstRatio), "최저 정답률 파트에 약점 태그");
ok(resultA.diag.filter((d) => d.c < d.t).every((d) => d.btn), "오답 있는 파트마다 복습 버튼");
ok(resultA.review === 20 && resultA.wrong === 6, "전 문항 리뷰 20행 · 오답 6행");
ok(!resultA.conqBadge, "정복 전 응시라 인증 배지 없음");
const stA = await store();
ok(stA.exams?.s1u1exam?.attempts === 1 && stA.exams?.s1u1exam?.best === 70 && stA.exams?.s1u1exam?.conquered === false, "store 기록(1회·70점·미정복)", JSON.stringify(stA.exams));
ok(stA.totalXp === 70, "XP 지급 = 점수만큼(첫 신기록)", String(stA.totalXp));
await shot("exam-s1u1-a-result");

// 오답 리뷰 펼치기 — 해설·핵심 한 줄·레슨 바로가기(무료 구간 오답이라 페이월 아님)
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
    marksOrPair: !!b?.querySelector(".opt.ok, .xr-pair-cell.ok, .ex-chip.ok"),
  };
});
ok(reviewA.open && reviewA.expl && reviewA.core, "오답 리뷰: 해설(150자+)·핵심 한 줄 렌더");
ok(reviewA.marksOrPair, "오답 리뷰: 정답 표시(ok 마크/정답 칩)");
ok(reviewA.lessonBtn.includes("복습하기"), "오답 리뷰: 레슨 바로가기 버튼");
await shot("exam-s1u1-a-review");

// 레슨 바로가기 → 레슨 플레이어(무료 레슨) → 닫기 → 홈
await page.evaluate(() => document.querySelector(".screen.active .xr-row.bad.open .xr-lesson-btn").click());
await W(1000);
ok(await page.evaluate(() => !!document.querySelector(".screen.active.lesson-screen")), "리뷰에서 무료 레슨 플레이어로 이동(페이월 아님)");
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
ok(await page.evaluate(() => document.querySelector(".screen.active .pw-title")?.textContent?.includes("프리미엄")), "페이월 화면 진입(.pw-title '프리미엄' 계약)");
await page.evaluate(() => document.querySelector(".screen.active .backbtn").click());
await W(800);
ok((await page.evaluate(() => document.querySelector(".screen.active .ex-title")?.textContent)) === "단원 종합 평가", "페이월 닫기 → 인트로 복귀");

// ═══════════ C. 정복 100% + 프리미엄 재응시 — 인증 배지·신기록 XP ═══════════
console.log("C. 정복+프리미엄 재응시");
const lessons = {};
for (let i = 1; i <= 6; i++) lessons[`s1u1l${i}`] = { done: true, acc: 95, bestXp: 120 };
await seed({ ...BASE, premium: true, lessons, totalXp: 70, exams: { s1u1exam: { attempts: 1, best: 70, conquered: false } } });
await gotoExamIntro();
const introC = await page.evaluate(() => {
  const a = document.querySelector(".screen.active");
  return { cta: a.querySelector(".btn.cta")?.textContent, hint: a.querySelector(".ex-conq-hint")?.textContent ?? "" };
});
ok(introC.cta === "시험 시작하기", "프리미엄이면 재응시 바로 가능");
ok(introC.hint.includes("지금 응시하면"), "정복 100% 상태 인증 안내");
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(650);
await playExam(() => true); // 전부 정답 → 100점
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
ok(resultC.xp.includes("+30 스텝"), "신기록 갱신분만 스텝(100−70=+30)", resultC.xp);
ok(resultC.perfect && resultC.weak === 0, "만점 진단(약점 태그 없음)");
ok(resultC.retake.includes("다시 응시하기") && !resultC.retake.includes("프리미엄"), "프리미엄 재응시 버튼(게이트 없음)");
const stC = await store();
ok(stC.exams.s1u1exam.attempts === 2 && stC.exams.s1u1exam.best === 100 && stC.exams.s1u1exam.conquered === true, "store 기록(2회·100점·정복)", JSON.stringify(stC.exams));
ok(stC.totalXp === 100, "누적 XP = 70 + 30", String(stC.totalXp));
await shot("exam-s1u1-c-conquered");

// 신기록 미갱신 재응시 — XP 0 확인(파밍 방지)
await page.evaluate(() => document.querySelector(".screen.active .ex-retake").click());
await W(700);
await playExam((i) => i < 10); // 50점 — 신기록 아님
const resultD = await page.evaluate(() => {
  const a = document.querySelector(".screen.active");
  return { score: a.querySelector(".ex-score-hero")?.dataset?.score, xp: a.querySelector(".ex-xp")?.textContent ?? "", best: a.querySelector(".ex-xp.quiet")?.textContent ?? "" };
});
const stD = await store();
ok(resultD.score === "50", "재응시 채점 50점");
ok(!resultD.xp.includes("신기록") && resultD.best.includes("최고 기록 100점"), "신기록 미갱신 시 XP 없음 + 최고 기록 표시");
ok(stD.totalXp === 100 && stD.exams.s1u1exam.best === 100 && stD.exams.s1u1exam.attempts === 3, "store: XP 불변·최고점 유지·응시 3회");

// 홈 복귀 — 정복 노드 골드 확인
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(1000);
const nodeC = await page.evaluate(() => {
  const n = document.querySelector(".screen.active .gm-node.exam");
  return { conq: n?.classList.contains("conq"), ribbon: n?.querySelector(".gm-ribbon")?.textContent, best: n?.querySelector(".gm-exam-best")?.textContent };
});
ok(nodeC.conq && nodeC.ribbon === "정복 인증" && nodeC.best === "최고 100점", "지도 노드 정복 골드 + 리본 + 최고점", JSON.stringify(nodeC));
await shot("exam-s1u1-c-map");

console.log(`\n결과: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
