// m1u2 문자와 식 단원 종합 평가 E2E: 무료 첫 응시, 채점·리뷰, 재응시 게이트,
// 프리미엄 만점 재응시까지 실제 UI로 확인한다.
// PORT=5202 node qa/e2e-exam-m1u2.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5202";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (error) => {
  pageErrors += 1;
  console.log("PAGEERROR", error.message);
});
let passed = 0;
let failed = 0;
const check = (condition, name, extra = "") => {
  if (condition) {
    passed += 1;
    console.log(" ok ", name);
  } else {
    failed += 1;
    console.log("FAIL", name, extra);
  }
};
const wait = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });

const BASE = {
  version: 1,
  onboarded: true,
  grade: "g1",
  viewGrade: "g1",
  viewSubject: "math",
  premium: false,
  reviewMode: false,
  goalMin: 10,
  streak: 0,
  lastStudyDay: null,
  totalXp: 0,
  lessons: {},
  minigame: {},
  exams: {},
};

async function seed(state) {
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((value) => localStorage.setItem("science-app.v1", JSON.stringify(value)), state);
  await page.reload({ waitUntil: "networkidle" });
  await wait(1200);
}

async function gotoExamIntro() {
  await page.waitForSelector(".unit-tab", { timeout: 12000 });
  const clicked = await page.evaluate(() => {
    const tab = [...document.querySelectorAll(".unit-tab")].find((node) => node.textContent.includes("문자와 식"));
    tab?.click();
    return !!tab;
  });
  if (!clicked) throw new Error("문자와 식 단원 탭을 찾지 못함");
  await wait(650);
  await page.waitForSelector(".screen.active .gm-node.exam", { timeout: 8000 });
  await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
  await wait(800);
  await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
}

async function answerCurrent(correct) {
  return page.evaluate(async (shouldBeCorrect) => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const active = document.querySelector(".screen.active");
    const question = active.querySelector(".ex-q");
    const type = question?.dataset.type;
    const answer = JSON.parse(question?.dataset.ans ?? "null");
    if (!question || !type) return { error: "no question" };
    if (type === "mcq") {
      const options = [...active.querySelectorAll(".opts .opt")];
      (shouldBeCorrect
        ? options.find((node) => +node.dataset.oi === answer)
        : options.find((node) => +node.dataset.oi !== answer)
      ).click();
    } else if (type === "multi") {
      const options = [...active.querySelectorAll(".opts .opt")];
      if (shouldBeCorrect) {
        for (const index of answer) {
          options.find((node) => +node.dataset.oi === index).click();
          await sleep(35);
        }
      } else {
        const wrong = options.find((node) => !answer.includes(+node.dataset.oi));
        wrong.click();
      }
    } else if (type === "num") {
      const value = shouldBeCorrect ? String(answer) : "999";
      for (const char of value) {
        const label = char === "." ? "·" : char === "-" ? "+/−" : char;
        [...active.querySelectorAll(".mnp-k")].find((node) => node.textContent.trim() === label)?.click();
        await sleep(30);
      }
    } else {
      const chips = [...active.querySelectorAll(".ex-chip")];
      (shouldBeCorrect
        ? chips.find((node) => node.dataset.w === String(answer))
        : chips.find((node) => node.dataset.w !== String(answer))
      ).click();
    }
    return {
      id: question.dataset.qid,
      type,
      visibleDifficulty: question.textContent.includes("난이도"),
      figureOk: !question.querySelector(".q-figure") || !!question.querySelector(".q-figure svg"),
    };
  }, correct);
}

async function play(pattern) {
  const seen = [];
  for (let index = 0; index < 20; index += 1) {
    await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
    const result = await answerCurrent(pattern(index));
    if (result.error) throw new Error(result.error);
    seen.push(result);
    await wait(100);
    const disabled = await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.disabled);
    if (disabled) throw new Error(`문항 ${index + 1} 응답 뒤 CTA 잠김`);
    await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
    await wait(280);
  }
  await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
  await wait(700);
  return seen;
}

console.log("A. 무료 첫 응시");
await seed(BASE);
await gotoExamIntro();
const intro = await page.evaluate(() => ({
  title: document.querySelector(".screen.active .ex-title")?.textContent,
  eyebrow: document.querySelector(".screen.active .ex-eyebrow")?.textContent ?? "",
  rules: [...document.querySelectorAll(".screen.active .ex-rule-s")].map((node) => node.textContent).join(" "),
  cta: document.querySelector(".screen.active .btn.cta")?.textContent,
}));
check(intro.title === "단원 종합 평가", "시험 인트로 진입", JSON.stringify(intro));
check(intro.eyebrow.includes("문자와 식"), "인트로 단원명");
check(intro.rules.includes("아홉 파트"), "9레슨 안내 문구", intro.rules);
check(intro.cta === "시험 시작하기", "첫 응시 CTA");
await shot("exam-m1u2-a-intro");
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await wait(600);
const seenA = await play((index) => index >= 2);
check(seenA.length === 20 && new Set(seenA.map((item) => item.id)).size === 20, "20문항 중복 없이 출제");
check(seenA.every((item) => !item.visibleDifficulty), "학생 화면에 난이도 태그 미노출");
check(seenA.every((item) => item.figureOk), "선택된 그림은 모두 SVG");
const resultA = await page.evaluate(() => {
  const active = document.querySelector(".screen.active");
  return {
    score: active.querySelector(".ex-score-hero")?.dataset.score,
    diag: [...active.querySelectorAll(".ex-diag-row")].map((row) => ({ c: +row.dataset.c, t: +row.dataset.t })),
    review: active.querySelectorAll(".xr-row").length,
    wrong: active.querySelectorAll(".xr-row.bad").length,
  };
});
check(resultA.score === "90", "18/20 채점 90점", resultA.score);
check(resultA.diag.length === 9, "9레슨 진단 행");
check(resultA.diag.every((row) => row.t === 2 || row.t === 3) && resultA.diag.filter((row) => row.t === 3).length === 2, "9레슨 균형 추출 2×7+3×2", JSON.stringify(resultA.diag));
check(resultA.review === 20 && resultA.wrong === 2, "전 문항 리뷰와 오답 수");
await page.evaluate(() => document.querySelector(".screen.active .xr-row.bad .xr-head").click());
await wait(300);
const review = await page.evaluate(() => {
  const row = document.querySelector(".screen.active .xr-row.bad.open");
  return {
    explain: (row?.querySelector(".xr-expl-body")?.textContent.length ?? 0) > 150,
    core: !!row?.querySelector(".xr-core"),
    lesson: row?.querySelector(".xr-lesson-btn")?.textContent ?? "",
  };
});
check(review.explain && review.core && review.lesson.includes("복습하기"), "m1u6 동일 정답·풀이·복습 형식", JSON.stringify(review));
await shot("exam-m1u2-a-review");
await page.evaluate(() => document.querySelector(".screen.active .xr-row.bad.open .xr-lesson-btn").click());
await wait(850);
check(await page.evaluate(() => !!document.querySelector(".screen.active.lesson-screen")), "무료 L1 복습 진입");
await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']").click());
await wait(850);
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
await wait(700);
check((await page.textContent(".screen.active .btn.cta")) === "프리미엄으로 다시 풀기", "무료 재응시 게이트");

console.log("B. 정복·프리미엄 만점 재응시");
const lessons = {};
for (let index = 1; index <= 9; index += 1) lessons[`m1u2l${index}`] = { done: true, acc: 95, bestXp: 120 };
await seed({ ...BASE, premium: true, lessons, totalXp: 90, exams: { m1u2exam: { attempts: 1, best: 90, conquered: false } } });
await gotoExamIntro();
await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await wait(600);
await play(() => true);
const resultB = await page.evaluate(() => ({
  score: document.querySelector(".screen.active .ex-score-hero")?.dataset.score,
  badge: !!document.querySelector(".screen.active .ex-conq"),
  xp: document.querySelector(".screen.active .ex-xp")?.textContent ?? "",
  state: JSON.parse(localStorage.getItem("science-app.v1")),
}));
check(resultB.score === "100", "전 유형 만점 응시");
check(resultB.badge, "정복 인증 배지");
check(resultB.xp.includes("+10 스텝"), "신기록 차액 XP 10");
check(resultB.state.exams.m1u2exam.best === 100 && resultB.state.exams.m1u2exam.conquered, "시험 상태 저장");
await shot("exam-m1u2-b-conquered");

fs.writeFileSync(
  "qa/shots/e2e-m1u2-result.json",
  JSON.stringify({ passed, failed, pageErrors, firstScore: resultA.score, finalScore: resultB.score }, null, 2),
);
console.log(`결과: PASS ${passed} / FAIL ${failed} / pageErrors ${pageErrors}`);
await browser.close();
process.exitCode = failed > 0 || pageErrors > 0 ? 1 : 0;
