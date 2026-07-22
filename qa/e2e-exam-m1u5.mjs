// m1u5 수학 단원 종합 평가 핵심 실플레이: 지도 진입, 20문항 응답, num 패드, 채점, 14파트 진단, 리뷰.
// PORT=<포트> node qa/e2e-exam-m1u5.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (error) => { pageErrors++; console.log("PAGEERROR", error.message); });
let pass = 0;
let fail = 0;
const ok = (condition, name, extra = "") => {
  if (condition) { pass++; console.log("  ok  ", name); }
  else { fail++; console.log("  FAIL", name, extra); }
};
const wait = (ms) => page.waitForTimeout(ms);

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {},
};

// addInitScript 시드 + 스플래시(상시 메인) 통과 — 정본 = qa/e2e-exam-m2u5.mjs seed.
await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), BASE);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await wait(1300);
await page.mouse.click(210, 300);
await wait(500);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기"))?.click();
});
await wait(1100);
await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((tab) => tab.textContent.includes("평면도형과 입체도형"))?.click());
await wait(600);

const nodeInfo = await page.evaluate(() => {
  const node = document.querySelector(".screen.active .gm-node.exam");
  return node ? { aria: node.getAttribute("aria-label"), disabled: node.getAttribute("aria-disabled") } : null;
});
ok(!!nodeInfo, "m1u5 지도에 평가 노드 존재");
ok(nodeInfo?.disabled == null, "평가 노드 항상 입장 가능");
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
await wait(700);

const intro = await page.evaluate(() => ({
  eyebrow: document.querySelector(".screen.active .ex-eyebrow")?.textContent ?? "",
  title: document.querySelector(".screen.active .ex-title")?.textContent ?? "",
  rule: [...document.querySelectorAll(".screen.active .ex-rule-s")].map((el) => el.textContent).join(" | "),
  cta: document.querySelector(".screen.active .btn.cta")?.textContent ?? "",
}));
ok(intro.eyebrow.includes("V") && intro.eyebrow.includes("평면도형과 입체도형"), "인트로 단원 표기", intro.eyebrow);
ok(intro.title === "단원 종합 평가" && intro.cta === "시험 시작하기", "인트로 제목과 CTA");
ok(intro.rule.includes("14 파트"), "14레슨 동적 파트 문구", intro.rule);
await page.screenshot({ path: "qa/shots/exam-m1u5-intro.png" });
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await wait(550);

async function answerCurrent(correct, testDelete) {
  return page.evaluate(async ({ correct, testDelete }) => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const active = document.querySelector(".screen.active");
    const q = active.querySelector(".ex-q");
    const type = q?.dataset.type;
    const answer = JSON.parse(q?.dataset.ans ?? "null");
    if (!q) return { error: "no-question" };
    if (type === "mcq") {
      const options = [...active.querySelectorAll(".opts .opt")];
      (correct ? options.find((el) => +el.dataset.oi === answer) : options.find((el) => +el.dataset.oi !== answer))?.click();
    } else if (type === "multi") {
      const options = [...active.querySelectorAll(".opts .opt")];
      const picks = correct ? answer : [options.map((el) => +el.dataset.oi).find((idx) => !answer.includes(idx))];
      for (const idx of picks) { options.find((el) => +el.dataset.oi === idx)?.click(); await sleep(30); }
    } else if (type === "num") {
      const value = correct ? String(answer) : "999";
      const press = async (character) => {
        const label = character === "." ? "·" : character;
        [...active.querySelectorAll(".mnp-k")].find((key) => key.textContent.trim() === label)?.click();
        await sleep(25);
      };
      if (testDelete) {
        await press(value[0]);
        [...active.querySelectorAll(".mnp-k")].find((key) => key.textContent.trim() === "⌫")?.click();
        await sleep(25);
      }
      for (const character of value) await press(character);
    } else {
      const chips = [...active.querySelectorAll(".ex-chip")];
      (correct ? chips.find((chip) => chip.dataset.w === String(answer)) : chips.find((chip) => chip.dataset.w !== String(answer)))?.click();
    }
    return {
      id: q.dataset.qid,
      type,
      hasFigure: !!q.querySelector(".q-figure"),
      figureOk: !q.querySelector(".q-figure") || !!q.querySelector(".q-figure svg"),
      optionNumberBadges: q.querySelectorAll(".option-number,.choice-number,.opt-num").length,
      diffVisible: /난이도\s*[123]|diff\s*[:=]/i.test(q.innerText),
      numPad: type === "num" ? q.querySelectorAll(".mnp-k").length : 0,
    };
  }, { correct, testDelete });
}

const seen = [];
let deleteTested = false;
for (let i = 0; i < 20; i++) {
  await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
  const type = await page.evaluate(() => document.querySelector(".screen.active .ex-q")?.dataset.type);
  const testDelete = type === "num" && !deleteTested;
  const result = await answerCurrent(i % 5 !== 0, testDelete);
  if (testDelete) deleteTested = true;
  seen.push(result);
  const enabled = await page.evaluate(() => !document.querySelector(".screen.active .btn.cta").disabled);
  if (!enabled) throw new Error(`CTA disabled after ${result.id}`);
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
  await wait(250);
}

await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
await wait(650);
ok(seen.length === 20 && new Set(seen.map((item) => item.id)).size === 20, "20문항 중복 없이 출제");
ok(seen.every((item) => item.figureOk), "figure 문항 SVG 렌더", JSON.stringify(seen.filter((item) => !item.figureOk)));
ok(seen.every((item) => item.optionNumberBadges === 0), "선택지 별도 번호 배지 없음");
ok(seen.every((item) => !item.diffVisible), "난이도 태그 비노출");
ok(seen.some((item) => item.type === "num" && item.numPad >= 12) && deleteTested, "num 숫자 패드 입력·삭제 실플레이");

const result = await page.evaluate(() => {
  const active = document.querySelector(".screen.active");
  return {
    score: active.querySelector(".ex-score-hero")?.dataset.score,
    diagnostics: [...active.querySelectorAll(".ex-diag-row")].map((row) => ({ lesson: row.dataset.lesson, correct: +row.dataset.c, total: +row.dataset.t })),
    reviews: active.querySelectorAll(".xr-row").length,
    wrong: active.querySelectorAll(".xr-row.bad").length,
  };
});
ok(result.score === "80", "일괄 채점 80점", result.score ?? "");
ok(result.reviews === 20 && result.wrong === 4, "전 문항 리뷰 20행, 오답 4행");
ok(result.diagnostics.length === 14, "14개 레슨 진단 표시", String(result.diagnostics.length));
ok(result.diagnostics.every((row) => row.total === 1 || row.total === 2) && result.diagnostics.filter((row) => row.total === 2).length === 6, "레슨 균형 추출 1×8 + 2×6", JSON.stringify(result.diagnostics));

await page.evaluate(() => document.querySelector(".screen.active .xr-row.bad .xr-head").click());
await wait(250);
const review = await page.evaluate(() => {
  const body = document.querySelector(".screen.active .xr-row.bad.open .xr-body");
  return {
    explanation: body?.querySelector(".xr-expl-body")?.textContent?.length ?? 0,
    core: !!body?.querySelector(".xr-core"),
    answerMark: !!body?.querySelector(".opt.ok,.xr-pair-cell.ok"),
  };
});
ok(review.explanation >= 250 && review.core && review.answerMark, "정답 및 풀이, 핵심, 정답 표시 렌더", JSON.stringify(review));
await page.screenshot({ path: "qa/shots/exam-m1u5-result.png", fullPage: true });

console.log(`\n결과: PASS ${pass} / FAIL ${fail} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(fail > 0 || pageErrors > 0 ? 1 : 0);
