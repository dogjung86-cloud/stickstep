// m1u4 기본 도형 시험 E2E: 수학 중1 지도 진입, 20문항 응답, num 넘패드, 채점, 진단, 리뷰.
// PORT=5204 node qa/e2e-exam-m1u4.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5204";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR", e.message); });

let PASS = 0, FAIL = 0;
const ok = (cond, name, extra = "") => {
  if (cond) { PASS++; console.log(" ok ", name); }
  else { FAIL++; console.log("FAIL", name, extra); }
};
const wait = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {},
};

// addInitScript 시드 + 스플래시(상시 메인) 통과 — 정본 = qa/e2e-exam-m2u5.mjs seed.
await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), BASE);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await wait(1200);
await page.mouse.click(210, 300);
await wait(500);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기"))?.click();
});
await wait(1100);

await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((el) => el.textContent?.includes("기본 도형"))?.click());
await wait(600);
const examNode = await page.$(".screen.active .gm-node.exam");
ok(!!examNode, "기본 도형 지도에 시험 노드 표시");
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam")?.click());
await wait(750);
await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
const intro = await page.evaluate(() => ({
  title: document.querySelector(".screen.active .ex-title")?.textContent,
  eyebrow: document.querySelector(".screen.active .ex-eyebrow")?.textContent,
  rules: [...document.querySelectorAll(".screen.active .ex-rule-s")].map((el) => el.textContent).join(" | "),
}));
ok(intro.title === "단원 종합 평가", "시험 인트로 제목");
ok(intro.eyebrow?.includes("IV") && intro.eyebrow?.includes("기본 도형"), "인트로 단원 표기", intro.eyebrow ?? "");
ok(/13|열세/.test(intro.rules), "13레슨 진단 안내", intro.rules);
await shot("exam-m1u4-intro");

// 재현 가능한 추출 순서. 앱 로직은 건드리지 않고 이 페이지의 Math.random만 고정한다.
await page.evaluate(() => {
  let seed = 20260713;
  Math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
});
await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
await wait(550);

const seen = [];
let numDeleteChecks = 0;
for (let i = 0; i < 20; i++) {
  await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
  const before = await page.evaluate(() => {
    const a = document.querySelector(".screen.active");
    const q = a?.querySelector(".ex-q");
    return {
      qid: q?.dataset.qid, type: q?.dataset.type,
      ans: q?.dataset.ans ? JSON.parse(q.dataset.ans) : null,
      numberedBadges: a?.querySelectorAll(".ex-opts .opt-num, .ex-opts .number-badge, .ex-opts .choice-number").length ?? -1,
      diffVisible: (a?.textContent ?? "").includes("난이도"),
      svgOk: !q?.querySelector(".q-figure") || !!q.querySelector(".q-figure svg"),
      keypad: a?.querySelectorAll(".mnp-k").length ?? 0,
    };
  });
  if (i === 0) {
    ok(before.numberedBadges === 0, "객관식 별도 번호 배지 없음");
    ok(!before.diffVisible, "난이도 태그 미노출");
  }
  ok(before.svgOk, `${before.qid} figure는 SVG`);

  const correct = i !== 0;
  const interaction = await page.evaluate(async ({ correct }) => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const a = document.querySelector(".screen.active");
    const q = a.querySelector(".ex-q");
    const type = q.dataset.type;
    const ans = JSON.parse(q.dataset.ans);
    let deleted = false;
    if (type === "mcq") {
      const opts = [...a.querySelectorAll(".ex-opts .opt")];
      (correct ? opts.find((el) => +el.dataset.oi === ans) : opts.find((el) => +el.dataset.oi !== ans)).click();
    } else if (type === "multi") {
      const opts = [...a.querySelectorAll(".ex-opts .opt")];
      const picks = correct ? ans : [opts.map((el) => +el.dataset.oi).find((v) => !ans.includes(v))];
      for (const pick of picks) { opts.find((el) => +el.dataset.oi === pick).click(); await sleep(35); }
    } else if (type === "num") {
      const keys = [...a.querySelectorAll(".mnp-k")];
      const value = String(correct ? ans : 999);
      const first = value[0] === "." ? "·" : value[0];
      keys.find((el) => el.textContent.trim() === first)?.click();
      await sleep(30);
      const del = keys.find((el) => el.textContent.includes("⌫") || el.getAttribute("aria-label")?.includes("지우"));
      if (del) { del.click(); deleted = true; await sleep(30); }
      for (const ch of value) {
        const key = ch === "." ? "·" : ch;
        keys.find((el) => el.textContent.trim() === key)?.click();
        await sleep(30);
      }
    } else {
      const chips = [...a.querySelectorAll(".ex-chip")];
      (correct ? chips.find((el) => el.dataset.w === String(ans)) : chips.find((el) => el.dataset.w !== String(ans))).click();
    }
    return { type, deleted };
  }, { correct });
  if (interaction.deleted) numDeleteChecks++;
  seen.push(before);
  await wait(100);
  const enabled = await page.evaluate(() => !document.querySelector(".screen.active .btn.cta")?.disabled);
  ok(enabled, `${before.qid} 응답 후 CTA 활성`);
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
  await wait(260);
}

await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
await wait(700);
const result = await page.evaluate(() => {
  const a = document.querySelector(".screen.active");
  return {
    score: a.querySelector(".ex-score-hero")?.dataset.score,
    review: a.querySelectorAll(".xr-row").length,
    wrong: a.querySelectorAll(".xr-row.bad").length,
    diag: [...a.querySelectorAll(".ex-diag-row")].map((el) => ({ lesson: el.dataset.lesson, total: +el.dataset.t })),
  };
});
ok(seen.length === 20 && new Set(seen.map((x) => x.qid)).size === 20, "20문항 중복 없이 출제");
const typeCount = seen.reduce((acc, x) => ((acc[x.type] = (acc[x.type] ?? 0) + 1), acc), {});
ok((typeCount.num ?? 0) > 0, "num 문항 실제 출제", JSON.stringify(typeCount));
ok(numDeleteChecks === (typeCount.num ?? 0), "num 넘패드 입력·삭제 확인", `${numDeleteChecks}/${typeCount.num ?? 0}`);
ok(result.score === "95", "한 문항 오답 뒤 95점 일괄 채점", result.score ?? "");
ok(result.review === 20 && result.wrong === 1, "전 문항 리뷰와 오답 수");
ok(result.diag.length === 13, "13레슨 진단 행", JSON.stringify(result.diag));
ok(result.diag.every((x) => x.total === 1 || x.total === 2) && result.diag.filter((x) => x.total === 2).length === 7, "13레슨 균형 추출 1×6+2×7", JSON.stringify(result.diag.map((x) => x.total)));
await shot("exam-m1u4-result");

await page.evaluate(() => document.querySelector(".screen.active .xr-row.bad .xr-head")?.click());
await wait(350);
const review = await page.evaluate(() => {
  const row = document.querySelector(".screen.active .xr-row.bad.open");
  return {
    open: !!row,
    explain: (row?.querySelector(".xr-expl-body")?.textContent?.length ?? 0) >= 250,
    core: !!row?.querySelector(".xr-core"),
    answer: !!row?.querySelector(".opt.ok, .xr-pair-cell.ok"),
    lesson: row?.querySelector(".xr-lesson-btn")?.textContent ?? "",
  };
});
ok(review.open && review.explain && review.core && review.answer, "오답 리뷰 정답·해설·핵심 렌더");
ok(review.lesson.includes("복습하기"), "오답 리뷰 레슨 바로가기");
await shot("exam-m1u4-review");

await page.evaluate(() => document.querySelector(".screen.active .xr-row.bad.open .xr-lesson-btn")?.click());
await wait(850);
ok(await page.evaluate(() => !!document.querySelector(".screen.active.lesson-screen")), "무료 L1 리뷰에서 레슨 진입");

console.log(`\nRESULT PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors} / types ${JSON.stringify(typeCount)}`);
await browser.close();
process.exit(FAIL || pageErrors ? 1 : 0);
