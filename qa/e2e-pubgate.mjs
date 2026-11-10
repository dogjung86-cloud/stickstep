// 과목 공개 게이트(2026-08-11) E2E — 일반 사용자에게는 과학만, 운영 계정·검토 모드·dev는 전 과목.
// 검증 구획: [A] dev 기본(게이트 열림. 기존 e2e 계약 불변 증명: 수학 홈·탭 5개·허브 4카드·주소 #/subjects)
//          [B] dev + ss.pub=1(실사용자 시점 강제. 신규 유저 둘러보기 → 설문 없이 중1 과학 홈 직행,
//              과목 탭 없음(탭 4개), 예전 주소 #/subjects는 학습 탭으로, 페이월 과학 SKU 2종)
//          [B2] 저장된 viewSubject=math도 과학으로 클램프
//          [B3] 부팅 딥링크 #/subjects(북마크·공유 링크)도 학습 탭으로
//          [C] dev + ss.pub=1 + premium(취약 드릴 피커: 과목 세그 없음·중1 과학 헤더)
//          [D] 프로덕션 번들(vite preview. DEV 게이트가 실제로 닫히는지: 신규 유저 과학 직행·과목 탭 없음·
//              페이월, 검토 모드를 켜면 과목 탭이 그 자리에서 열리고 끄면 닫힘, 과목을 바꾼 뒤 주소 동기)
//          [E] 운영 계정(로그인해도 탭은 4개 그대로. 다른 과목은 주소 #/subject/<과목>으로 열거나
//              검토 모드를 켜서 과목 탭으로 간다. dev 모듈 두 개를 응답 단계에서 손봐 운영 번들과
//              인증 상태를 흉내 낸다)
//          [E2] 운영 계정이 과목 주소(#/subject/math)로 새로 열 때: 로그인 복원이 화면보다 늦어도
//              복원되는 순간 학습 탭을 고른 과목으로 다시 그린다(다른 화면에 서 있으면 건드리지 않는다)
// 2026-11-11: 과목 탭을 닫았다(store.hasSubjectChoice). 일반 사용자에게는 과학 하나라 고를 것이 없고,
//            운영 계정도 같은 화면을 보도록 함께 닫았다. 탭은 검토 모드와 dev에서만 선다
//            (허브 1카드 검사는 탭 구성 검사로 바뀌었다).
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
/** 지금 화면의 탭바 라벨들(왼쪽부터). */
const tabLabels = (page) => page.evaluate(() => [...document.querySelectorAll(".screen.active .gnav-tx")].map((e) => e.textContent).join(","));
const subjCards = (page) =>
  page.evaluate(() => [...document.querySelectorAll("#sc-subjects .subj-card")].map((c) => c.querySelector(".subj-name")?.textContent?.trim()));

// ───────────────────────── [A] dev 기본 — 게이트 열림(기존 QA 계약 불변) ─────────────────────────
{
  console.log("[A] dev 기본(전 과목 노출 — e2e 계약 불변)");
  const page = await newPage({ seed: { ...SEED_BASE, viewSubject: "math", premium: true }, pub: false, dev: true });
  await boot(page, PORT);
  ok((await bandTitle(page)) === "수와 연산", `홈 = 수학 지도(시드 viewSubject 존중): ${await bandTitle(page)}`);
  ok((await tabLabels(page)) === "학습,과목,복습,도전,마이", `탭 5개(과목 탭 열림): ${await tabLabels(page)}`);
  await openSubjectsTab(page);
  const cards = await subjCards(page);
  ok(cards.length === 4 && cards.join() === "과학,수학,사회,역사", `과목 허브 4카드: ${cards.join(",")}`);
  await page.close();
  // 게이트가 열려 있으면 주소 #/subjects도 그대로 과목 허브를 연다
  const deep = await newPage({ seed: { ...SEED_BASE, viewSubject: "sci" }, pub: false, dev: true });
  await deep.goto(`http://localhost:${PORT}/#/subjects`, { waitUntil: "networkidle" });
  await deep.waitForSelector("#sc-subjects", { timeout: 20000 });
  await deep.waitForTimeout(400);
  const deepHash = await deep.evaluate(() => location.hash);
  ok(deepHash === "#/subjects", `부팅 딥링크 #/subjects → 과목 허브(${deepHash})`);
  await deep.close();
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
  // 과목 탭은 고를 과목이 둘 이상일 때만 선다. 일반 사용자에게는 탭이 넷이다
  ok((await tabLabels(page)) === "학습,복습,도전,마이", `탭 4개(과목 탭 없음): ${await tabLabels(page)}`);
  await page.screenshot({ path: "qa/shots/pubgate-tabs.png" });
  // 다른 탭 화면의 탭바도 같다
  for (const t of ["복습", "도전", "마이"]) {
    await tapTab(page, t);
    ok((await tabLabels(page)) === "학습,복습,도전,마이", `${t} 탭의 탭바도 4개`);
  }
  await tapTab(page, "학습");
  // 예전 주소(#/subjects)로 들어와도 과목 허브가 아니라 학습 탭에 선다
  await page.evaluate(() => (location.hash = "#/subjects"));
  await page.waitForTimeout(700);
  const afterLink = await page.evaluate(() => ({
    hub: !!document.querySelector("#sc-subjects"),
    home: !!document.querySelector("#sc-home.active"),
    hash: location.hash,
  }));
  ok(!afterLink.hub && afterLink.home && afterLink.hash === "#/subject/sci", `#/subjects → 학습 탭(${afterLink.hash})`);

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

// [B3] 부팅 딥링크: 예전 주소 #/subjects로 곧장 들어와도(북마크·공유 링크) 학습 탭에 선다
{
  console.log("[B3] dev + ss.pub=1 + 부팅 딥링크 #/subjects");
  const page = await newPage({ seed: { ...SEED_BASE, viewSubject: "sci" }, pub: true, dev: true });
  await page.goto(`http://localhost:${PORT}/#/subjects`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => !!document.querySelector("#sc-home.active, #sc-subjects.active"), { timeout: 20000 });
  await page.waitForTimeout(500);
  const st = await page.evaluate(() => ({
    hub: !!document.querySelector("#sc-subjects"),
    home: !!document.querySelector("#sc-home.active"),
    hash: location.hash,
  }));
  ok(!st.hub && st.home && st.hash === "#/subject/sci", `부팅 딥링크 #/subjects → 학습 탭(${st.hash})`);
  ok((await tabLabels(page)) === "학습,복습,도전,마이", `탭 4개: ${await tabLabels(page)}`);
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

/** 운영 번들과 인증 상태 흉내. dev 서버가 내주는 모듈 두 개를 응답 단계에서만 손본다(소스는 그대로다).
 *  - store.ts: dev 항을 뺀다. 운영 번들처럼 공개 게이트는 운영 계정·검토 모드에서만, 과목 탭은 검토 모드에서만 열린다.
 *  - auth.ts: 인증 상태를 바꿔 알리는 시험용 손잡이 window.__qaAuth를 단다. 운영 계정 주소는
 *    모듈 안의 표(PRIVILEGED_EMAILS)에서 꺼내 쓴다(이 파일에 주소를 적지 않는다).
 *  돌려주는 함수는 손질이 적용된 모듈 수를 알려 준다(2여야 한다). page.goto보다 먼저 불러야 한다. */
async function patchAdminModules(page) {
  let patched = 0;
  await page.route("**/src/core/store.ts*", async (route) => {
    const res = await route.fetch();
    const src = await res.text();
    const out = src.replace(/\s*\|\|\s*!!import\.meta\.env\.DEV/, "");
    if (out !== src && !/\|\|\s*!!import\.meta\.env\.DEV/.test(out)) patched += 1; // dev 항이 한 군데도 남지 않아야 한다
    await route.fulfill({ response: res, body: out });
  });
  await page.route("**/src/core/auth.ts*", async (route) => {
    const res = await route.fetch();
    const src = await res.text();
    if (/\bPRIVILEGED_EMAILS\b/.test(src) && /function emit\(/.test(src)) patched += 1;
    const hook =
      ';window.__qaAuth = (admin) => { user = admin ? { id: "qa-admin", email: [...PRIVILEGED_EMAILS][0], name: "QA", provider: "qa" } : null; emit(); };';
    await route.fulfill({ response: res, body: src + "\n" + hook + "\n" });
  });
  return () => patched;
}

// ───────────── [E] 운영 계정: 로그인해도 과목 탭은 서지 않는다 ─────────────
// 이 워크트리에는 로그인 설정이 없어 실제 로그인을 못 한다. 그래서 patchAdminModules로 운영 번들과
// 인증 상태를 흉내 낸다.
{
  console.log("[E] 운영 계정: 탭은 4개 그대로, 다른 과목은 주소와 검토 모드로");
  const page = await newPage({ seed: { ...SEED_BASE, viewSubject: "sci" }, pub: false, dev: true });
  const patched = await patchAdminModules(page);
  await boot(page, PORT);
  ok(patched() === 2, `시험용 모듈 손질 적용: ${patched()}/2`);
  const activeId = () => page.evaluate(() => document.querySelector(".screen.active")?.id ?? "");
  const setAdmin = async (on) => {
    await page.evaluate((on) => window.__qaAuth(on), on);
    await page.waitForTimeout(600);
  };
  const goHash = async (hash) => {
    await page.evaluate((hash) => (location.hash = hash), hash);
    await page.waitForTimeout(800);
  };
  const sevenTaps = async () => {
    for (let i = 0; i < 7; i++) await page.click("#sc-home .brand", { delay: 20 });
    await page.waitForTimeout(500);
  };
  const FOUR = "학습,복습,도전,마이";
  const FIVE = "학습,과목,복습,도전,마이";
  const SCI = "과학과 인류의 지속가능한 삶";
  ok((await tabLabels(page)) === FOUR, `로그인 전: 탭 4개: ${await tabLabels(page)}`);

  // 운영 계정으로 로그인해도 탭은 그대로 넷이다(일반 사용자와 같은 화면)
  await setAdmin(true);
  ok(
    (await tabLabels(page)) === FOUR && (await activeId()) === "sc-home",
    `운영 계정 로그인 뒤에도 탭 4개: ${await tabLabels(page)}`,
  );
  // 예전 주소 #/subjects는 운영 계정에게도 학습 탭이다
  await goHash("#/subjects");
  const st = await page.evaluate(() => ({
    id: document.querySelector(".screen.active")?.id,
    hub: !!document.querySelector("#sc-subjects"),
    hash: location.hash,
  }));
  ok(st.id === "sc-home" && !st.hub && st.hash === "#/subject/sci", `운영 계정: #/subjects → 학습 탭(${st.id}, ${st.hash})`);

  // 운영 계정은 주소로 다른 과목을 열 수 있다(탭은 계속 넷)
  await goHash("#/subject/math");
  ok(
    (await bandTitle(page)) === "수와 연산" && (await tabLabels(page)) === FOUR,
    `운영 계정: #/subject/math → 수학 지도, 탭 4개: ${await bandTitle(page)}`,
  );
  // 검토 모드를 켜면 과목 탭이 그 자리에서 서고, 그 탭으로 과학에 돌아온다
  await sevenTaps();
  ok((await tabLabels(page)) === FIVE, `운영 계정 + 검토 모드 ON → 과목 탭 열림: ${await tabLabels(page)}`);
  await openSubjectsTab(page);
  const cards = await subjCards(page);
  ok(cards.length === 4, `검토 모드: 과목 허브 4카드: ${cards.join(",")}`);
  await page.evaluate(() => {
    [...document.querySelectorAll("#sc-subjects .subj-card")]
      .find((c) => c.querySelector(".subj-name")?.textContent?.trim() === "과학")
      ?.click();
  });
  await page.waitForSelector("#sc-home.active", { timeout: 8000 });
  await page.waitForTimeout(500);
  ok((await bandTitle(page)) === SCI, `과목 탭에서 과학 선택 → 과학 지도: ${await bandTitle(page)}`);
  // 검토 모드를 끄면 과목 탭이 닫히고 보던 과목은 그대로다
  await sevenTaps();
  ok(
    (await tabLabels(page)) === FOUR && (await bandTitle(page)) === SCI,
    `검토 모드 OFF → 과목 탭 닫힘, 과학 지도 유지: ${await tabLabels(page)}`,
  );

  // 로그아웃하면 일반 사용자다. 주소로 수학을 불러도 과학 지도에 선다(공개 게이트 클램프)
  await setAdmin(false);
  await goHash("#/subject/math");
  ok(
    (await bandTitle(page)) === SCI && (await tabLabels(page)) === FOUR,
    `로그아웃 뒤 #/subject/math → 과학 지도, 탭 4개: ${await bandTitle(page)}`,
  );
  await page.close();
}

// ───────────── [E2] 운영 계정이 과목 주소로 새로 열 때 ─────────────
// 부팅 주소는 로그인 복원보다 먼저 적용된다. 그 순간에는 게이트가 닫혀 있어 과학 지도가 그려진다
// (고른 과목은 저장만 된다). 복원이 끝나 운영 계정으로 확인되면 학습 탭을 고른 과목으로 다시 그린다.
{
  console.log("[E2] 운영 계정 + 부팅 주소 #/subject/math: 로그인 복원 뒤 수학 지도로 다시 그림");
  const page = await newPage({ seed: { ...SEED_BASE, viewSubject: "sci" }, pub: false, dev: true });
  const patched = await patchAdminModules(page);
  await page.goto(`http://localhost:${PORT}/#/subject/math`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-home.active", { timeout: 20000 });
  await page.waitForTimeout(600);
  ok(patched() === 2, `시험용 모듈 손질 적용: ${patched()}/2`);
  const SCI = "과학과 인류의 지속가능한 삶";
  const MATH = "수와 연산";
  const FOUR = "학습,복습,도전,마이";
  const where = () =>
    page.evaluate(() => ({ id: document.querySelector(".screen.active")?.id ?? "", hash: location.hash }));
  const setAdmin = async (on) => {
    await page.evaluate((on) => window.__qaAuth(on), on);
    await page.waitForTimeout(700);
  };
  ok((await bandTitle(page)) === SCI, `로그인 복원 전: 과학 지도(게이트 닫힘): ${await bandTitle(page)}`);

  // 로그인 복원 → 학습 탭에 선 채 수학 지도로 다시 그리고, 주소도 수학이 된다
  await setAdmin(true);
  let w = await where();
  ok(
    (await bandTitle(page)) === MATH && w.id === "sc-home" && w.hash === "#/subject/math",
    `운영 계정 복원 → 수학 지도 + 주소(${await bandTitle(page)}, ${w.hash})`,
  );
  ok((await tabLabels(page)) === FOUR, `탭은 4개 그대로: ${await tabLabels(page)}`);

  // 같은 사용자로 인증 알림이 다시 와도(토큰 갱신 등) 화면을 다시 그리지 않는다
  await page.evaluate(() => document.querySelector("#sc-home.active")?.setAttribute("data-qa-mark", "1"));
  await setAdmin(true);
  const kept = await page.evaluate(() => document.querySelector("#sc-home.active")?.getAttribute("data-qa-mark") === "1");
  ok(kept, "같은 사용자 인증 알림에는 학습 탭을 다시 그리지 않음");

  // 다른 탭에 서 있을 때 로그아웃되면 화면을 옮기지 않는다. 학습 탭으로 돌아오면 과학이다
  await tapTab(page, "복습");
  await setAdmin(false);
  w = await where();
  ok(w.id === "sc-review", `복습 탭에 서 있을 때 로그아웃 → 화면 그대로(${w.id})`);
  await tapTab(page, "학습");
  ok((await bandTitle(page)) === SCI, `로그아웃 뒤 학습 탭 = 과학 지도: ${await bandTitle(page)}`);

  // 학습 탭에 선 채 다시 로그인하면 저장된 과목(수학)으로, 로그아웃하면 과학으로 다시 그린다
  await setAdmin(true);
  ok((await bandTitle(page)) === MATH, `학습 탭에서 운영 계정 로그인 → 수학 지도: ${await bandTitle(page)}`);
  await setAdmin(false);
  w = await where();
  ok(
    (await bandTitle(page)) === SCI && w.id === "sc-home" && w.hash === "#/subject/sci",
    `학습 탭에서 로그아웃 → 과학 지도 + 주소(${await bandTitle(page)}, ${w.hash})`,
  );
  await page.close();
}

// ───────────── [D] 프로덕션 번들(vite preview) — DEV 게이트가 실제로 닫힘 ─────────────
if (PPORT) {
  console.log("[D] 프로덕션 번들(preview) — 신규 유저 실동작");
  const page = await newPage({ seed: null, pub: false, dev: false }); // ss.pub 없이 — 번들 자체가 공개 모드
  await boot(page, PPORT);
  ok((await bandTitle(page)) === "과학과 인류의 지속가능한 삶", `홈 = 중1 과학 지도: ${await bandTitle(page)}`);
  ok((await tabLabels(page)) === "학습,복습,도전,마이", `탭 4개(과목 탭 없음): ${await tabLabels(page)}`);
  await page.screenshot({ path: "qa/shots/pubgate-prod-home.png", fullPage: false });
  // 검토 모드(브랜드 7연타)는 전 과목을 연다. 과목 탭이 그 자리에서 열리고, 끄면 닫힌다
  const sevenTaps = async () => {
    for (let i = 0; i < 7; i++) await page.click("#sc-home .brand", { delay: 20 });
    await page.waitForTimeout(500);
  };
  await sevenTaps();
  ok((await tabLabels(page)) === "학습,과목,복습,도전,마이", `검토 모드 ON → 과목 탭 열림: ${await tabLabels(page)}`);
  await openSubjectsTab(page);
  const cards = await subjCards(page);
  ok(cards.length === 4, `검토 모드: 과목 허브 4카드: ${cards.join(",")}`);
  // 검토 모드에서 수학을 고르면 주소도 수학이고, 새로고침해도 수학이다(가드 반납 뒤 주소 다시 쓰기, 실번들 확인)
  await page.evaluate(() => {
    [...document.querySelectorAll("#sc-subjects .subj-card")]
      .find((c) => c.querySelector(".subj-name")?.textContent?.trim() === "수학")
      ?.click();
  });
  await page.waitForSelector("#sc-home.active", { timeout: 8000 });
  await page.waitForTimeout(800);
  const afterPick = await page.evaluate(() => location.hash);
  ok(
    (await bandTitle(page)) === "수와 연산" && afterPick === "#/subject/math",
    `검토 모드: 수학 선택 → 수학 지도 + 주소(${await bandTitle(page)}, ${afterPick})`,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#sc-home.active", { timeout: 25000 });
  await page.waitForTimeout(600);
  ok((await bandTitle(page)) === "수와 연산", `새로고침 뒤에도 수학 지도: ${await bandTitle(page)}`);
  await page.evaluate(() => (location.hash = "#/subject/sci"));
  await page.waitForTimeout(900);
  const backToSci = await page.evaluate(() => location.hash);
  ok(
    (await bandTitle(page)) === "과학과 인류의 지속가능한 삶" && backToSci === "#/subject/sci",
    `주소 #/subject/sci → 과학 지도 + 주소(${await bandTitle(page)}, ${backToSci})`,
  );
  await sevenTaps();
  ok((await tabLabels(page)) === "학습,복습,도전,마이", `검토 모드 OFF → 과목 탭 닫힘: ${await tabLabels(page)}`);
  await tapTab(page, "도전");
  await page.evaluate(() => document.querySelector("#btn-cosmo")?.click());
  await page.waitForSelector(".pwx-subs", { timeout: 8000 });
  const skus = await page.evaluate(() => [...document.querySelectorAll(".pwx-sub")].map((b) => b.textContent.trim()));
  ok(skus.length === 2 && skus.every((s) => s.includes("과학")), `페이월 SKU = 과학 2종: ${skus.join(" | ")}`);
  await page.close();
} else {
  console.log("[D] 생략 — PPORT 미지정(프로덕션 preview 검증은 PPORT=<포트>로)");
}

await browser.close();
console.log(`\npubgate 결과: ${pass} ok / ${fail} fail`);
process.exit(fail ? 1 : 0);
