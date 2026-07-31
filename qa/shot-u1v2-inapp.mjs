// u1 v2 파일럿 인앱 확인 — 실제 시험 화면(인트로·문항 렌더·채점·리뷰)을 캡처한다.
// PORT=5291 node qa/shot-u1v2-inapp.mjs → qa/shots/u1v2-inapp/*.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const PORT = process.env.PORT || 5291;
const OUT = "qa/shots/u1v2-inapp";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
const W = (ms) => page.waitForTimeout(ms);
const shot = async (n) => { await W(350); await page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true }); console.log("shot", n); };

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {},
};
await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), BASE);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForSelector("#sc-splash", { timeout: 25000 });
await page.mouse.click(210, 300);
await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
await page.waitForSelector("#sc-home", { timeout: 15000 });
await W(700);

await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((t) => t.textContent.includes("지속가능"))?.click());
await W(750);
await shot("01-home-map");

await page.waitForSelector(".screen.active .gm-node.exam", { timeout: 8000 });
await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
await W(900);
await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
await shot("02-exam-intro");

await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
await W(700);

// 문항을 순회하며 캡처(정답 선택 후 다음). 자료 유형이 다양한 앞 8문항을 담는다.
for (let i = 0; i < 8; i++) {
  await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
  const meta = await page.evaluate(() => {
    const a = document.querySelector(".screen.active");
    const q = a.querySelector(".ex-q");
    return { qid: q.dataset.qid, type: q.dataset.type, fig: !!q.querySelector(".q-figure") };
  });
  await shot(`q${String(i + 1).padStart(2, "0")}-${meta.qid}${meta.fig ? "-fig" : ""}`);
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const a = document.querySelector(".screen.active");
    const q = a.querySelector(".ex-q");
    const ans = JSON.parse(q.dataset.ans);
    const opts = [...a.querySelectorAll(".opts .opt")];
    if (q.dataset.type === "multi") { for (const oi of ans) { opts.find((o) => +o.dataset.oi === oi).click(); await sleep(45); } }
    else opts.find((o) => +o.dataset.oi === ans).click();
  });
  await W(220);
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
  await W(330);
}
// 남은 문항은 빠르게 답하고 제출 → 결과·리뷰
for (let i = 8; i < 20; i++) {
  await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const a = document.querySelector(".screen.active");
    const q = a.querySelector(".ex-q");
    const ans = JSON.parse(q.dataset.ans);
    const opts = [...a.querySelectorAll(".opts .opt")];
    if (q.dataset.type === "multi") { for (const oi of ans) { opts.find((o) => +o.dataset.oi === oi).click(); await sleep(45); } }
    else opts.find((o) => +o.dataset.oi !== ans).click();
  });
  await W(150);
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
  await W(300);
}
await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
await W(900);
await shot("30-result");
// 리뷰 펼치기
await page.evaluate(() => {
  const cards = [...document.querySelectorAll(".screen.active .ex-rv")];
  cards.slice(0, 3).forEach((c) => c.querySelector("summary")?.click() ?? c.click());
});
await W(700);
await shot("31-review");
await browser.close();
console.log("완료 →", OUT);
