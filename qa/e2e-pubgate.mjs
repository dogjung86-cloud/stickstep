// 과목 공개 게이트(2026-08-11) E2E — 일반 사용자에게는 과학만, 운영 계정·검토 모드·dev는 전 과목.
// 검증 4구획: [A] dev 기본(게이트 열림 — 기존 e2e 계약 불변 증명: 수학 홈·허브 4카드)
//            [B] dev + ss.pub=1(실사용자 시점 강제 — 신규 유저 둘러보기 → 설문 없이 중1 과학 홈 직행,
//                허브 1카드, 페이월 과학 SKU 2종, 저장된 viewSubject=math도 과학으로 클램프)
//            [C] dev + ss.pub=1 + premium(취약 드릴 피커 — 과목 세그 없음·중1 과학 헤더)
//            [D] 프로덕션 번들(vite preview — DEV 게이트가 실제로 닫히는지: 신규 유저 과학 직행·허브 1카드·페이월)
// 실행: PORT=<dev포트> PPORT=<preview포트> node qa/e2e-pubgate.mjs (PPORT 없으면 [D] 생략)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
const PPORT = process.env.PPORT || "";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

let pass = 0;
let fail = 0;
const ok = (cond, label) => {
  if (cond) {
    pass += 1;
    console.log(`  ok ${label}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${label}`);
  }
};

/** 정본 부팅부(e2e-soc7 하드닝판) — 스플래시 → 플립북 스킵 → 둘러보기 → #sc-home. */
async function boot(page, port) {
  await page.goto(`http://localhost:${port}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
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
  await page.waitForTimeout(600);
}

async function newPage({ seed, pub, dev }) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => {
    fail += 1;
    console.log("  PAGEERROR:", e.message);
  });
  if (dev) {
    // 동시 세션 HMR 면역 — @vite/client 스텁(웹소켓 제거, updateStyle 유지). preview엔 불필요.
    await page.route("**/@vite/client", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
      }),
    );
  }
  await page.addInitScript(
    ({ seed, pub }) => {
      if (seed) localStorage.setItem("science-app.v1", JSON.stringify(seed));
      if (pub) sessionStorage.setItem("ss.pub", "1");
    },
    { seed, pub },
  );
  return page;
}

const SEED_BASE = {
  version: 1,
  onboarded: true,
  grade: "g1",
  viewGrade: "g1",
  premium: false,
  reviewMode: false,
  goalMin: 10,
  streak: 1,
  lastStudyDay: null,
  totalXp: 0,
  lessons: {},
  minigame: {},
};

const bandTitle = (page) => page.evaluate(() => document.querySelector(".unit-band.on .ub-title, .unit-band .ub-title")?.textContent?.trim());
/** 하단 탭바 전환 — .gnav-item의 .gnav-tx 라벨로 집는다(gnav.ts e2e 계약). */
const tapTab = async (page, label) => {
  await page.evaluate((label) => {
    [...document.querySelectorAll(".gnav-item")].find((b) => b.querySelector(".gnav-tx")?.textContent === label)?.click();
  }, label);
  await page.waitForTimeout(500);
};
const openSubjectsTab = async (page) => {
  await tapTab(page, "과목");
  await page.waitForSelector("#sc-subjects", { timeout: 8000 });
  await page.waitForTimeout(350);
};
const subjCards = (page) =>
  page.evaluate(() => [...document.querySelectorAll("#sc-subjects .subj-card")].map((c) => c.querySelector(".subj-name")?.textContent?.trim()));

// ───────────────────────── [A] dev 기본 — 게이트 열림(기존 QA 계약 불변) ─────────────────────────
{
  console.log("[A] dev 기본(전 과목 노출 — e2e 계약 불변)");
  const page = await newPage({ seed: { ...SEED_BASE, viewSubject: "math", premium: true }, pub: false, dev: true });
  await boot(page, PORT);
  ok((await bandTitle(page)) === "수와 연산", `홈 = 수학 지도(시드 viewSubject 존중): ${await bandTitle(page)}`);
  await openSubjectsTab(page);
  const cards = await subjCards(page);
  ok(cards.length === 4 && cards.join() === "과학,수학,사회,역사", `과목 허브 4카드: ${cards.join(",")}`);
  await page.close();
}

// ───────────────────── [B] dev + ss.pub — 실사용자 시점(신규 유저 직행·과학만) ─────────────────────
{
  console.log("[B] dev + ss.pub=1 — 신규 유저 둘러보기 직행 + 과학만 노출");
  const page = await newPage({ seed: null, pub: true, dev: true }); // 저장 없음 = 진짜 신규 유저
  await boot(page, PORT); // 설문 없이 #sc-home 도달 자체가 직행 증명(boot가 스플래시 → 홈만 거친다)
  const survey = await page.evaluate(() => document.body.textContent.includes("몇 학년이에요"));
  ok(!survey, "설문(학년·과목·학습량) 미등장");
  ok((await bandTitle(page)) === "과학과 인류의 지속가능한 삶", `홈 = 중1 과학 Ⅰ 지도: ${await bandTitle(page)}`);
  const grade = await page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")).grade);
  const onb = await page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")).onboarded);
  ok(grade === "g1" && onb === true, `기본값 저장(onboarded·g1): grade=${grade}`);
  await openSubjectsTab(page);
  const cards = await subjCards(page);
  ok(cards.length === 1 && cards[0] === "과학", `과목 허브 과학 1카드: ${cards.join(",")}`);
  const noOthers = await page.evaluate(() => {
    const t = document.querySelector("#sc-subjects").textContent;
    return !t.includes("수학") && !t.includes("사회") && !t.includes("역사");
  });
  ok(noOthers, "허브에 수학·사회·역사 문구 없음");
  await page.screenshot({ path: "qa/shots/pubgate-hub.png" });

  // 페이월(도전 탭 게임 게이트 경유 — 비프리미엄) — 판매 SKU도 과학 2종만
  await tapTab(page, "도전");
  await page.evaluate(() => document.querySelector("#btn-cosmo")?.click());
  await page.waitForSelector(".pwx-subs", { timeout: 8000 });
  await page.waitForTimeout(350);
  const skus = await page.evaluate(() => [...document.querySelectorAll(".pwx-sub")].map((b) => b.textContent.trim()));
  ok(skus.length === 2 && skus.every((s) => s.includes("과학")) && !skus.some((s) => s.includes("수학")), `페이월 SKU = 과학 2종: ${skus.join(" | ")}`);
  await page.screenshot({ path: "qa/shots/pubgate-paywall.png" });
  await page.close();
}

// [B2] 저장된 viewSubject=math(운영 계정이 쓰던 기기에서 로그아웃한 상황) → 과학으로 클램프
{
  console.log("[B2] dev + ss.pub=1 + 시드 viewSubject=math — 과학으로 클램프");
  const page = await newPage({ seed: { ...SEED_BASE, viewSubject: "math" }, pub: true, dev: true });
  await boot(page, PORT);
  ok((await bandTitle(page)) === "과학과 인류의 지속가능한 삶", `홈 = 과학 지도(클램프): ${await bandTitle(page)}`);
  await page.close();
}

// ─────────────── [C] dev + ss.pub + premium — 취약 드릴 피커도 과학만 ───────────────
{
  console.log("[C] dev + ss.pub=1 + premium — 취약 단원 문제 뽑기 피커");
  const page = await newPage({ seed: { ...SEED_BASE, viewSubject: "sci", premium: true }, pub: true, dev: true });
  await boot(page, PORT);
  await tapTab(page, "복습");
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.textContent.includes("취약 단원 문제 뽑기"))?.click();
  });
  await page.waitForSelector(".wd-sec", { timeout: 8000 });
  await page.waitForTimeout(350);
  const noMathSeg = await page.evaluate(() => !document.body.textContent.includes("수학"));
  ok(noMathSeg, "피커에 수학 없음(과목 세그 생략)");
  const firstSec = await page.evaluate(() => document.querySelector(".wd-sec")?.textContent?.trim());
  ok(!!firstSec && firstSec.includes("과학"), `피커 첫 섹션 = 과학: ${firstSec}`);
  await page.screenshot({ path: "qa/shots/pubgate-drill.png" });
  await page.close();
}

// ───────────── [D] 프로덕션 번들(vite preview) — DEV 게이트가 실제로 닫힘 ─────────────
if (PPORT) {
  console.log("[D] 프로덕션 번들(preview) — 신규 유저 실동작");
  const page = await newPage({ seed: null, pub: false, dev: false }); // ss.pub 없이 — 번들 자체가 공개 모드
  await boot(page, PPORT);
  ok((await bandTitle(page)) === "과학과 인류의 지속가능한 삶", `홈 = 중1 과학 지도: ${await bandTitle(page)}`);
  await openSubjectsTab(page);
  const cards = await subjCards(page);
  ok(cards.length === 1 && cards[0] === "과학", `과목 허브 과학 1카드: ${cards.join(",")}`);
  await tapTab(page, "도전");
  await page.evaluate(() => document.querySelector("#btn-cosmo")?.click());
  await page.waitForSelector(".pwx-subs", { timeout: 8000 });
  const skus = await page.evaluate(() => [...document.querySelectorAll(".pwx-sub")].map((b) => b.textContent.trim()));
  ok(skus.length === 2 && skus.every((s) => s.includes("과학")), `페이월 SKU = 과학 2종: ${skus.join(" | ")}`);
  await page.screenshot({ path: "qa/shots/pubgate-prod-home.png", fullPage: false });
  await page.close();
} else {
  console.log("[D] 생략 — PPORT 미지정(프로덕션 preview 검증은 PPORT=<포트>로)");
}

await browser.close();
console.log(`\npubgate 결과: ${pass} ok / ${fail} fail`);
process.exit(fail ? 1 : 0);
