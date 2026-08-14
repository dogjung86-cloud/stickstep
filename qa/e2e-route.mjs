// URL 해시 라우팅 + 이메일 로그인 UI E2E — DEV 서버 필요. PORT=<포트> node qa/e2e-route.mjs
// (2026-08-14 토스PG 심사 대응 — core/route.ts·main.ts syncHash/enterFromRoute·login.ts 이메일 폼)
// [A] 딥링크(미온보딩 방문자 = 심사역 시점): #/pricing → 페이월(제공기간 12개월 문구·'기간 제한' 0)
//     #/login → 로그인(이메일 토글 → 폼) · #/refund → 환불 정책 화면(12개월 문구 로드)
//     #/grade/g2 → 중2 홈 · #/subject/math → 수학 홈(dev 게이트 열림)
// [B] 아웃바운드 동기: 부팅(스플래시 해시 없음) → 둘러보기(#/subject/sci) → 탭 전환(#/challenge)
//     → 마이 탭(비로그인 로그인 유도 → #/login)
// [C] 뒤로가기: 하드웨어 back 1회 = 앱 내 back 1회(해시 이중 내비 없음 — #/my 복귀)
// [D] 스택 위 화면에서 해시 수정: #/login → #/pricing — 가드 반납 back()이 방금 연 화면을
//     닫아 버리던 경합(routingBurst 보류) 회귀 가드 + 이후 하드웨어 back 정상 동작
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const browser = await chromium.launch({ channel: "chrome", headless: true });

let checks = 0;
let fails = 0;
const check = (ok, msg) => {
  checks += 1;
  console.log(`${ok ? "PASS" : "FAIL"} [${checks}] ${msg}`);
  if (!ok) fails += 1;
};

const SEED = {
  version: 1,
  onboarded: true,
  grade: "g1",
  viewGrade: "g1",
  viewSubject: "sci",
  premium: false,
  reviewMode: false,
  goalMin: 10,
  streak: 1,
  lastStudyDay: null,
  totalXp: 100,
  lessons: {},
  minigame: {},
};

const HMR_STUB =
  "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}";

async function newPage({ seed = null } = {}) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => {
    fails += 1;
    console.log("PAGEERROR:", e.message);
  });
  await page.route("**/@vite/client", (route) => route.fulfill({ contentType: "application/javascript", body: HMR_STUB }));
  if (seed) await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), seed);
  return page;
}

const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1") ?? "null"));

// ───────────────────── [A] 딥링크 — 미온보딩 방문자 ─────────────────────
{
  console.log("[A] 딥링크(#/pricing · #/login · #/refund · #/grade/g2 · #/subject/math)");
  // A1. 상품(페이월) — 심사 제출 URL
  let page = await newPage();
  await page.goto(`http://localhost:${PORT}/#/pricing`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-paywall", { timeout: 25000 });
  await page.waitForTimeout(600);
  check(true, "#/pricing → 페이월 딥링크 진입(스플래시 생략)");
  const fine = await page.evaluate(() => document.querySelector("#sc-paywall .pwx-fine")?.textContent ?? "");
  check(fine.includes("12개월"), "파인프린트에 제공기간 12개월 명시");
  check(fine.includes("서비스가 제공되는 동안"), "무상 연장 예방선 문구 유지");
  const bodyText = await page.evaluate(() => document.querySelector("#sc-paywall")?.textContent ?? "");
  check(!bodyText.includes("기간 제한 없"), "'기간 제한 없음' 계열 문구 0(PG 신고 기간과 불일치 금지)");
  check(!bodyText.includes("평생"), "'평생' 워딩 0(기존 가드 유지)");
  check(bodyText.includes("제공기간 12개월+무상 연장"), "신뢰 칩·영수증에 12개월+무상 연장");
  const hash1 = await page.evaluate(() => location.hash);
  check(hash1 === "#/pricing", `주소창 해시 유지(${hash1})`);
  const st1 = await store(page);
  check(st1?.onboarded === true, "미온보딩 방문자 자동 온보딩(둘러보기와 같은 기본값)");
  await page.close();

  // A2. 로그인 — 이메일 폼(심사용 테스트 계정 진입 경로)
  page = await newPage();
  await page.goto(`http://localhost:${PORT}/#/login`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-login", { timeout: 25000 });
  await page.waitForTimeout(400);
  check(true, "#/login → 로그인 화면 딥링크 진입");
  const hasToggle = await page.evaluate(() => !!document.querySelector("#sc-login .login-email-toggle"));
  check(hasToggle, "이메일 로그인 토글 존재");
  await page.evaluate(() => document.querySelector("#sc-login .login-email-toggle").click());
  await page.waitForTimeout(200);
  const formOpen = await page.evaluate(() => {
    const f = document.querySelector("#sc-login .login-email-form");
    return !!f && getComputedStyle(f).display !== "none";
  });
  check(formOpen, "토글 → 이메일/비밀번호 폼 펼침");
  const inputs = await page.evaluate(() => document.querySelectorAll("#sc-login .login-input").length);
  check(inputs === 2, `입력 필드 2개(이메일·비밀번호), 실측 ${inputs}`);
  // 빈 제출 → 안내 스낵(네트워크 안 나감)
  await page.evaluate(() => document.querySelector("#sc-login .login-btn.email").click());
  await page.waitForTimeout(300);
  const snack = await page.evaluate(() => document.querySelector("#sc-login .snack")?.textContent ?? "");
  check(snack.includes("입력"), `빈 제출 차단 스낵: "${snack}"`);
  await page.close();

  // A3. 환불 정책 화면
  page = await newPage();
  await page.goto(`http://localhost:${PORT}/#/refund`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-policy", { timeout: 25000 });
  await page.waitForFunction(
    () => (document.querySelector("#sc-policy")?.textContent ?? "").includes("소장 이용권"),
    { timeout: 10000 },
  );
  const polText = await page.evaluate(() => document.querySelector("#sc-policy")?.textContent ?? "");
  check(polText.includes("12개월"), "#/refund → 환불 정책 문서 로드(제공기간 12개월)");
  check(await page.evaluate(() => document.querySelector("#sc-policy")?.dataset.policyFile === "refund.html"), "정책 화면 파일 판별(data-policy-file)");
  await page.close();

  // A4. 학년·과목 딥링크
  page = await newPage();
  await page.goto(`http://localhost:${PORT}/#/grade/g2`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-home", { timeout: 25000 });
  const st2 = await store(page);
  check(st2?.viewGrade === "g2", `#/grade/g2 → 중2 홈(viewGrade=${st2?.viewGrade})`);
  await page.close();

  page = await newPage();
  await page.goto(`http://localhost:${PORT}/#/subject/math`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-home", { timeout: 25000 });
  const st3 = await store(page);
  check(st3?.viewSubject === "math", `#/subject/math → 수학 홈(dev 게이트 열림, viewSubject=${st3?.viewSubject})`);
  const hash2 = await page.evaluate(() => location.hash);
  check(hash2 === "#/subject/math", `홈 아웃바운드 해시 = 현재 과목(${hash2})`);
  await page.close();
}

// ───────────────────── [B] 아웃바운드 동기 ─────────────────────
{
  console.log("[B] 아웃바운드 해시 동기(스플래시 → 홈 → 탭 → 마이 로그인 유도)");
  const page = await newPage({ seed: SEED });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  const h0 = await page.evaluate(() => location.hash);
  check(h0 === "", `스플래시는 해시 없음(실측 "${h0}")`);
  await page.mouse.click(210, 300);
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
    { timeout: 15000 },
  );
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
  });
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(400);
  const h1 = await page.evaluate(() => location.hash);
  check(h1 === "#/subject/sci", `홈 진입 해시(${h1})`);

  await page.evaluate(() => [...document.querySelectorAll(".gnav button")].find((b) => b.textContent.includes("도전"))?.click());
  await page.waitForTimeout(600);
  const h2 = await page.evaluate(() => location.hash);
  check(h2 === "#/challenge", `도전 탭 해시(${h2})`);

  await page.evaluate(() => [...document.querySelectorAll(".gnav button")].find((b) => b.textContent.includes("마이"))?.click());
  await page.waitForTimeout(900);
  const h3 = await page.evaluate(() => location.hash);
  const loginShown = await page.evaluate(() => !!document.querySelector("#sc-login"));
  // .env.local이 있는 dev에선 비로그인 마이 탭이 로그인 화면을 얹는다(#/login) — 스텁 모드면 #/my.
  check(
    (loginShown && h3 === "#/login") || (!loginShown && h3 === "#/my"),
    `마이 탭 해시(로그인 유도 ${loginShown ? "있음" : "없음"} → ${h3})`,
  );

  // ── [C] 뒤로가기 = 앱 내 back 1회(이중 내비 없음) ──
  if (loginShown) {
    await page.evaluate(() => history.back());
    await page.waitForTimeout(800);
    const h4 = await page.evaluate(() => location.hash);
    const backToMy = await page.evaluate(() => !document.querySelector("#sc-login"));
    check(backToMy && h4 === "#/my", `뒤로가기 → 마이 탭 복귀 + 해시 동기(${h4})`);
  } else {
    check(true, "스텁 모드 — 뒤로가기 케이스 생략(로그인 오버레이 없음)");
  }
  await page.close();
}

// ───────────────────── [D] 스택 위 화면에서 해시 수정(가드 경합 회귀) ─────────────────────
{
  console.log("[D] #/login 위에서 location.hash=#/pricing — 라우팅 버스트 가드");
  const page = await newPage();
  await page.goto(`http://localhost:${PORT}/#/login`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-login", { timeout: 25000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    location.hash = "#/pricing";
  });
  await page.waitForSelector("#sc-paywall", { timeout: 8000 });
  await page.waitForTimeout(1600); // 경합이 있으면 popstate가 이 사이에 화면을 닫는다
  const still = await page.evaluate(() => ({
    paywall: !!document.querySelector("#sc-paywall"),
    login: !!document.querySelector("#sc-login"),
    hash: location.hash,
  }));
  check(still.paywall && still.hash === "#/pricing", `페이월 유지 + 해시(${still.hash})`);
  check(!still.login, "이전 화면(로그인)은 스택에서 정리됨");
  // 이후 하드웨어 back → 페이월 닫힘 + 홈 복귀(가드 정상)
  await page.evaluate(() => history.back());
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({
    paywall: !!document.querySelector("#sc-paywall"),
    home: !!document.querySelector("#sc-home"),
    hash: location.hash,
  }));
  check(!after.paywall && after.home && after.hash === "#/subject/sci", `back → 홈 복귀 + 해시(${after.hash})`);
  await page.close();
}

await browser.close();
console.log(`\n${fails === 0 ? "ALL PASS" : "FAILED"} — ${checks - fails}/${checks}`);
process.exit(fails === 0 ? 0 : 1);
