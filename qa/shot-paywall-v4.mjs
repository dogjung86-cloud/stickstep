// 페이월 v4 눈검수 샷 — 두 판매 상태를 복습 탭 취약 드릴 게이트로 진입해 캡처한다:
// ① 얼리버드(ss.eb="1"): 정가 취소선 + 출시 기념 균일가(플랜 카드 없음 — SKU 단일화)
// ② 정가(ss.eb="0"): 플랜 카드(30일 패스 vs 소장·추천) + 30일 패스 업셀 줄
// PORT=<포트> node qa/shot-paywall-v4.mjs (dev 서버 필수). 상태 강제는 DEV 전용
// sessionStorage "ss.eb" — core/purchase.ts earlyBirdActive() 참조.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });
let fails = 0;
const ok = (cond, label) => { console.log(`${cond ? "PASS" : "FAIL"} ${label}`); if (!cond) fails++; };

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
};
await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), BASE);

const T = (sel) => page.evaluate((s) => document.querySelector(`.screen.active ${s}`)?.textContent?.trim() ?? "", sel);

async function openPaywall(ebFlag) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.evaluate((v) => sessionStorage.setItem("ss.eb", v), ebFlag);
  // 2026-07-21 공개 진입 플로우: 부팅은 항상 스플래시 — 플립북 스킵 탭 → "둘러보기" 클릭(정본 부팅부).
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(210, 300);
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
    { timeout: 15000 },
  );
  await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click(); });
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(600);
  // 복습 탭 → 취약 드릴(프리미엄 게이트) → 페이월
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .gnav-item")].find((b) => b.textContent.includes("복습"))?.click());
  await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector(".screen.active .prep-card.accent")?.click());
  await page.waitForSelector(".screen.active .pwx-mark", { timeout: 8000 });
  await page.waitForTimeout(1300); // 등장 연출 완료 대기
}

// ── 상태 ①: 얼리버드 ──
await openPaywall("1");
ok((await T(".pw-title")).includes("프리미엄"), "e2e 계약: .pw-title에 '프리미엄'");
ok((await page.$$(".screen.active .pwx-plan")).length === 0, "얼리버드: 플랜 카드 없음(SKU 단일화)");
ok((await T(".pwx-amount")) === "9,900원", `얼리버드 1과목 = 9,900원 (실측 ${await T(".pwx-amount")})`);
ok((await T(".pwx-strike")) === "14,900원", `정가 취소선 14,900원 (실측 ${await T(".pwx-strike")})`);
ok((await T(".pwx-save")).includes("출시 기념"), "출시 기념 할인 필");
// 회귀 가드(2026-07-27): 얼리버드 절약 필에 금액을 쓰면 3과목 구간에서 할인폭이 꺾여 보인다
// (정가 사다리의 3과목째만 +9,000원이라 5,000/5,100/4,200/5,600 — 계산 오류로 읽힘).
ok(!(await T(".pwx-save")).includes("아껴요"), "얼리버드 필에 절약 금액 없음(3과목 꺾임 가드)");
ok((await T(".btn.cta")).includes("소장하기"), `CTA 소장 언어 (실측 ${await T(".btn.cta")})`);
ok(!(await page.evaluate(() => document.querySelector(".screen.active .pwx-body")?.textContent?.includes("평생"))), "'평생' 워딩 0");
await page.screenshot({ path: "qa/shots/paywall-v4-eb-hero.png" });

// 4과목 전부 담기 → 가격 카드
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const b of [...document.querySelectorAll(".screen.active .pwx-sub")].slice(1)) { b.click(); await sleep(90); }
});
await page.waitForTimeout(400);
ok((await T(".pwx-amount")) === "39,600원", `얼리버드 4과목 = 39,600원 (실측 ${await T(".pwx-amount")})`);
ok((await T(".pwx-strike")) === "45,200원", `4과목 정가 취소선 45,200원 (실측 ${await T(".pwx-strike")})`);
await page.evaluate(() => document.querySelector(".screen.active .pwx-subjects")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(350);
await page.screenshot({ path: "qa/shots/paywall-v4-eb-price.png" });

// ── 상태 ②: 정가(플랜 카드 공개) ──
await openPaywall("0");
ok((await page.$$(".screen.active .pwx-plan")).length === 2, "정가: 플랜 카드 2장(30일 패스·소장)");
ok((await T(".pwx-amount")) === "14,900원", `소장 1과목 = 14,900원 (실측 ${await T(".pwx-amount")})`);
ok(await page.evaluate(() => document.querySelector(".screen.active .pwx-strike")?.style.display === "none"), "정가: 취소선 숨김");
ok((await T(".pwx-plan-badge")) === "추천", "소장 카드 추천 배지");
await page.evaluate(() => document.querySelector(".screen.active .pwx-subjects")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(350);
await page.screenshot({ path: "qa/shots/paywall-v4-plans.png" });

// 30일 패스 선택 → 업셀 줄
await page.evaluate(() => document.querySelector(".screen.active .pwx-plan")?.click());
await page.waitForTimeout(400);
ok((await T(".pwx-amount")) === "4,900원", `30일 패스 1과목 = 4,900원 (실측 ${await T(".pwx-amount")})`);
ok((await T(".pwx-up")).includes("소장 가격"), "패스 → 소장 업셀 줄");
ok((await T(".pwx-pernote")).includes("자동 연장 없어요"), "패스 자동 연장 없음 고지");
ok((await T(".btn.cta")).includes("30일 패스 시작하기"), `패스 CTA (실측 ${await T(".btn.cta")})`);
await page.screenshot({ path: "qa/shots/paywall-v4-pass30.png" });

console.log(`done · fails ${fails} · pageErrors ${pageErrors}`);
await browser.close();
process.exit(fails > 0 || pageErrors > 0 ? 1 : 0);
