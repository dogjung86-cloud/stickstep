// 중1 과학 II. 생물의 구성과 다양성 전용 E2E.
// PORT=<포트> node qa/e2e-exam-u2.mjs — Vite dev 서버가 먼저 떠 있어야 한다.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
const BASE_URL = `http://localhost:${PORT}/`;
const IMAGE_FILES = [
  "cell-shapes-observation", "cheek-cells", "elodea-cells", "coverslip-bubble", "coverslip-clean",
  "ladybug-variation", "moth-variation", "beetle-species-pair", "fungi-trio", "protist-trio",
  "five-kingdom-specimens", "forest-road", "forest-corridor", "wetland-degraded", "wetland-restored", "seed-bank",
];

fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
let pass = 0, fail = 0, pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR", e.message); });
const ok = (cond, name, extra = "") => {
  if (cond) { pass++; console.log(" ok ", name); }
  else { fail++; console.log("FAIL", name, extra); }
};
const wait = (ms) => page.waitForTimeout(ms);

await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

// 실제 Vite 모듈을 브라우저에서 불러 300회 추출한다. 매번 3·3·3·3·4·4인지 확인한다.
const drawAudit = await page.evaluate(async () => {
  const { U2_EXAM } = await import("/src/content/exams/u2.ts");
  const { drawExamItems } = await import("/src/content/exams/types.ts");
  const failures = [];
  for (let n = 0; n < 300; n++) {
    const draw = drawExamItems(U2_EXAM);
    const counts = new Map();
    for (const q of draw) counts.set(q.lessonId, (counts.get(q.lessonId) ?? 0) + 1);
    const values = [...counts.values()].sort((a, b) => a - b);
    if (draw.length !== 20 || new Set(draw.map((q) => q.id)).size !== 20 || values.join(",") !== "3,3,3,3,4,4") {
      failures.push({ n, ids: draw.map((q) => q.id), values });
      break;
    }
  }
  return { pool: U2_EXAM.pool.length, failures };
});
ok(drawAudit.pool === 120, "브라우저 모듈의 u2 풀 120문항", String(drawAudit.pool));
ok(drawAudit.failures.length === 0, "300회 추출 모두 3·3·3·3·4·4 및 중복 없음", JSON.stringify(drawAudit.failures[0]));

// 신규 생성 이미지 전부가 실제 앱 URL에서 로드되는지 확인한다.
const imageAudit = await page.evaluate(async (names) => Promise.all(names.map((name) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve({ name, width: img.naturalWidth, height: img.naturalHeight });
  img.onerror = () => resolve({ name, width: 0, height: 0 });
  img.src = `/exam/u2/${name}.webp`;
}))), IMAGE_FILES);
ok(imageAudit.every((x) => x.width > 0 && x.height > 0), "신규 이미지 16장 naturalWidth/naturalHeight > 0", JSON.stringify(imageAudit.filter((x) => !x.width)));
ok(imageAudit.every((x) => x.width === x.height), "신규 이미지 16장 정사각 구도", JSON.stringify(imageAudit.filter((x) => x.width !== x.height)));

const state = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {},
};
// addInitScript 시드 + 스플래시(상시 메인) 통과 — 정본 = qa/e2e-exam-m2u5.mjs seed.
await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), state);
await page.reload({ waitUntil: "networkidle" });
await wait(1200);
await page.mouse.click(210, 300);
await wait(500);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기"))?.click();
});
await wait(1100);
await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.includes("생물의 구성과 다양성"))?.click());
await wait(600);
ok(await page.evaluate(() => !!document.querySelector(".screen.active .gm-node.exam")), "u2 지도에 종합 평가 노드 표시");
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam")?.click());
await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
ok((await page.locator(".screen.active .ex-title").textContent()) === "단원 종합 평가", "u2 평가 인트로 진입");
await page.locator(".screen.active .btn.cta").click();
await wait(500);

const seen = [];
for (let i = 0; i < 20; i++) {
  await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
  const result = await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const root = document.querySelector(".screen.active");
    const q = root.querySelector(".ex-q");
    const type = q.dataset.type;
    const answer = JSON.parse(q.dataset.ans);
    if (type === "mcq") root.querySelector(`.opt[data-oi='${answer}']`).click();
    else if (type === "multi") for (const x of answer) { root.querySelector(`.opt[data-oi='${x}']`).click(); await sleep(25); }
    else if (type === "num") for (const ch of String(answer)) { [...root.querySelectorAll(".mnp-k")].find((x) => x.textContent.trim() === ch)?.click(); await sleep(25); }
    else [...root.querySelectorAll(".ex-chip")].find((x) => x.dataset.w === String(answer)).click();
    return {
      id: q.dataset.qid,
      imagesOk: [...q.querySelectorAll("img")].every((x) => x.complete && x.naturalWidth > 0),
      clipped: q.scrollWidth > q.clientWidth + 1,
    };
  });
  seen.push(result);
  await page.locator(".screen.active .btn.cta").click();
  await wait(180);
}
await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
const liveCounts = Object.values(seen.reduce((m, q) => {
  const n = Number(q.id.replace("u2e", ""));
  const lesson = `u2l${Math.ceil(n / 20)}`;
  m[lesson] = (m[lesson] ?? 0) + 1;
  return m;
}, {})).sort((a, b) => a - b);
ok(seen.length === 20 && new Set(seen.map((q) => q.id)).size === 20, "실플레이 20문항 및 ID 중복 없음");
ok(liveCounts.join(",") === "3,3,3,3,4,4", "실플레이 레슨 균형 3·3·3·3·4·4", liveCounts.join(","));
ok(seen.every((q) => q.imagesOk), "실플레이에 등장한 이미지 로드 성공");
ok(seen.every((q) => !q.clipped), "모바일 폭에서 문항 본문 가로 잘림 없음");
ok((await page.locator(".screen.active .ex-score-hero").getAttribute("data-score")) === "100", "전 문항 정답 입력 시 100점");
await page.screenshot({ path: "qa/shots/exam-u2-result.png", fullPage: true });

console.log(`결과: PASS ${pass} / FAIL ${fail} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(fail || pageErrors ? 1 : 0);
