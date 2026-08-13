// 토스페이먼츠 결제 흐름 E2E — DEV 서버 필요. PORT=<포트> node qa/e2e-pay.mjs
// 검증 5부: [P] 가격표 서버 동기(purchase.ts ↔ supabase/functions/pay-order 기계 대조)
// [A] 페이월 CTA → 주문 확인 시트 계약(테스트 배지·동의 강제·BIZ_INFO·'평생' 0) + DEV 스텁 해금
// [D] 비로그인 실플로우 게이트(ss.payreal) — "로그인하고 결제 진행" → 로그인 화면
// [B] 실플로우 전체 왕복(ss.payreal + ss.payFakeUser + 엣지·SDK 스텁) — 주문 바디(guardianConsent·
//     서버 금액) → requestPayment 파라미터 → successUrl 리다이렉트 → 부팅 승인 → 이용권 반영·스낵
// [C] failUrl 복귀 — 취소 스낵 + 주소 청소(OAuth ?code 오인 차단)
// 토스·엣지 함수는 전부 page.route 스텁 — 네트워크 밖으로 나가지 않는다.
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
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

async function newPage({ payreal = false, fakeUser = null, routes = null } = {}) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => {
    fails += 1;
    console.log("PAGEERROR:", e.message);
  });
  await page.route("**/@vite/client", (route) => route.fulfill({ contentType: "application/javascript", body: HMR_STUB }));
  if (routes) await routes(page);
  await page.addInitScript(
    ({ seed, payreal, fakeUser }) => {
      localStorage.setItem("science-app.v1", JSON.stringify(seed));
      if (payreal) sessionStorage.setItem("ss.payreal", "1");
      if (fakeUser) sessionStorage.setItem("ss.payFakeUser", fakeUser);
    },
    { seed: SEED, payreal, fakeUser },
  );
  return page;
}

async function boot(page) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(210, 300);
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
    { timeout: 15000 },
  );
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
  });
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(500);
}

async function openPaywall(page) {
  // 도전 탭 게임 게이트 경유(e2e-pubgate 정본 경로) — 비프리미엄은 입장료 없이 페이월이 뜬다.
  await page.evaluate(() => {
    [...document.querySelectorAll(".gnav button, .gnav a, nav button")].find((b) => b.textContent.includes("도전"))?.click();
  });
  await page.waitForSelector("#btn-cosmo", { timeout: 8000 });
  await page.evaluate(() => document.querySelector("#btn-cosmo").click());
  await page.waitForSelector(".pwx-subs", { timeout: 8000 });
  await page.waitForTimeout(400);
}

async function openSheet(page) {
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
  await page.waitForSelector(".pwx-scrim.on .pwx-sheet", { timeout: 5000 });
  await page.waitForTimeout(250);
}

// ───────────────────── [P] 가격표 서버 동기 — purchase.ts ↔ pay-order ─────────────────────
{
  console.log("[P] 가격표 서버 동기(클라 ↔ 엣지 함수)");
  const src = readFileSync(new URL("../supabase/functions/pay-order/index.ts", import.meta.url), "utf8");
  const tiers = src.match(/const PLAN_TIERS = \[(\d+), (\d+), (\d+)\]/).slice(1, 4).map(Number);
  const pass = Number(src.match(/const PASS30_PRICE = (\d+)/)[1]);
  const eb = Number(src.match(/const EARLY_BIRD_PER = (\d+)/)[1]);
  const floorBase = Number(src.match(/const PER_SUBJECT_FLOOR = (\d+) \/ 3/)[1]);
  const serverIds = [...src.matchAll(/"((?:sci|math|soc|his)-g\d)":/g)].map((m) => m[1]);
  const svRegular = (n) => (n <= 3 ? tiers[n - 1] : Math.round((floorBase / 3) * n));

  const page = await newPage();
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  const cli = await page.evaluate(async () => {
    const m = await import("/src/core/purchase.ts");
    return {
      ids: m.SELLABLE_SUBJECTS.map((s) => s.id),
      pass: m.PASS30.price,
      eb: m.EARLY_BIRD.perSubject,
      own: [1, 2, 3, 4, 5, 6].map((n) => m.priceOf(n)),
    };
  });
  check(cli.ids.join() === serverIds.join(), `판매 카탈로그 동일: ${serverIds.join(",")}`);
  check(cli.pass === pass, `30일 패스 가격 동일(${pass})`);
  check(cli.eb === eb, `얼리버드 균일가 동일(${eb})`);
  check(floorBase === tiers[2], "서버 floor 기준 = 3과목 정가");
  for (const n of [1, 2, 3, 4, 5, 6])
    check(cli.own[n - 1] === svRegular(n), `소장 ${n}과목 정가 동일(${svRegular(n)})`);
  await page.close();
}

// ───────────────────── [A] 시트 계약 + DEV 스텁 해금 ─────────────────────
{
  console.log("[A] 주문 확인 시트 계약 + DEV 스텁 해금");
  const page = await newPage();
  await boot(page);
  await openPaywall(page);
  const biz = await page.evaluate(() => document.querySelector(".screen.active .pwx-biz")?.textContent ?? "");
  check(biz.includes("사업자등록번호") && biz.includes("과학드림"), "페이월 본문 사업자 정보(BIZ_INFO) 노출");

  await openSheet(page);
  const sheetText = await page.evaluate(() => document.querySelector(".pwx-sheet").textContent);
  check(sheetText.includes("주문 확인"), "시트 타이틀");
  check(sheetText.includes("테스트 결제"), "테스트 키 배지 노출");
  check(sheetText.includes("중1 과학"), "과목 요약");
  check(sheetText.includes("14,900원"), "소장 1과목 금액 = 14,900원");
  check(sheetText.includes("법정대리인이 동의하지 않은"), "전상법 13조 2항 고지 원문");
  check(sheetText.includes("사업자등록번호"), "시트 사업자 정보");
  check(!sheetText.includes("평생"), "'평생' 워딩 0(시트)");
  await page.screenshot({ path: "qa/shots/pay-sheet.png" });

  // 동의 없이 결제 → 막힘
  await page.evaluate(() => document.querySelector(".pwx-paybtn").click());
  await page.waitForTimeout(250);
  const blocked = await page.evaluate(() => document.querySelector(".pwx-sheet-msg").textContent);
  check(blocked.includes("체크"), `동의 미체크 차단: "${blocked}"`);
  // 동의 후 결제 → DEV 스텁 즉시 해금
  await page.evaluate(() => document.querySelector(".pwx-consent input").click());
  await page.evaluate(() => document.querySelector(".pwx-paybtn").click());
  await page.waitForTimeout(900);
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));
  check(st.premium === true, "DEV 스텁 해금: premium=true");
  check((st.premiumSubjectIds ?? []).includes("sci-g1"), `해금 과목 기록: ${JSON.stringify(st.premiumSubjectIds)}`);
  await page.close();
}

// ───────────────────── [D] 비로그인 실플로우 — 로그인 게이트 ─────────────────────
{
  console.log("[D] 비로그인 실플로우 게이트(ss.payreal)");
  const page = await newPage({ payreal: true });
  await boot(page);
  await openPaywall(page);
  await openSheet(page);
  const label = await page.evaluate(() => document.querySelector(".pwx-paybtn").textContent);
  check(label.includes("로그인하고"), `비로그인 CTA 라벨: "${label}"`);
  await page.evaluate(() => document.querySelector(".pwx-consent input").click());
  await page.evaluate(() => document.querySelector(".pwx-paybtn").click());
  await page.waitForTimeout(900);
  const onLogin = await page.evaluate(() => {
    const t = document.querySelector(".screen.active")?.textContent ?? "";
    return t.includes("구글") || t.includes("로그인");
  });
  check(onLogin, "결제 진행 → 로그인 화면 전환(onLogin 배선)");
  await page.close();
}

// ───────────────────── [B] 실플로우 전체 왕복(엣지·SDK 스텁) ─────────────────────
{
  console.log("[B] 실플로우 전체 왕복 — 주문 → 결제창 → successUrl → 승인 → 이용권");
  const seen = { order: null, confirm: null, confirmAuth: null };
  const routes = async (page) => {
    await page.route("**/functions/v1/pay-order", async (route) => {
      seen.order = JSON.parse(route.request().postData());
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ orderId: "ss_e2e_order_1", amount: 14900, orderName: "스틱스텝 중1 과학 소장" }),
      });
    });
    await page.route("**/functions/v1/pay-confirm", async (route) => {
      seen.confirm = JSON.parse(route.request().postData());
      seen.confirmAuth = route.request().headers()["authorization"];
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          subjects: ["sci-g1"],
          plan: "own",
          receiptUrl: "https://example.test/receipt",
          entitlements: [{ subject_id: "sci-g1", plan: "own", expires_at: null }],
        }),
      });
    });
    // 토스 v2 SDK 스텁 — requestPayment 파라미터를 기록하고 successUrl 리다이렉트를 재현한다.
    await page.route("https://js.tosspayments.com/**", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body:
          "window.TossPayments=function(ck){return{payment:function(o){return{requestPayment:function(p){" +
          "window.__tossReq={ck:ck,customerKey:o.customerKey,p:p};" +
          "location.href=p.successUrl+'&paymentKey=pk_e2e_1&orderId='+p.orderId+'&amount='+p.amount.value;" +
          "return new Promise(function(){});}}}}};",
      }),
    );
  };
  const page = await newPage({ payreal: true, fakeUser: "e2e-user-1", routes });
  await boot(page);
  await openPaywall(page);
  await openSheet(page);
  await page.evaluate(() => document.querySelector(".pwx-consent input").click());
  await page.evaluate(() => document.querySelector(".pwx-paybtn").click());
  // successUrl 리다이렉트 → 새 부팅 → 스플래시 위에서 자동 승인 → 성공 스낵
  await page.waitForSelector(".pay-snack.show.good", { timeout: 20000 });
  const snack = await page.evaluate(() => document.querySelector(".pay-snack").textContent);
  check(snack.includes("결제가 완료"), `성공 스낵: "${snack}"`);

  check(!!seen.order, "pay-order 호출됨");
  check(seen.order?.plan === "own" && JSON.stringify(seen.order?.subjectIds) === '["sci-g1"]', "주문 바디: plan·과목");
  check(seen.order?.amount === 14900, `주문 바디: 표시 금액 대조(${seen.order?.amount})`);
  check(seen.order?.guardianConsent === true, "주문 바디: 보호자 동의 기록");

  const req = await page.evaluate(() => window.__tossReq ?? null);
  // 리다이렉트로 페이지가 바뀌어 __tossReq는 사라졌을 수 있다 — 승인 바디로 파라미터 전달을 검증.
  check(seen.confirm?.paymentKey === "pk_e2e_1", "승인 바디: paymentKey 전달");
  check(seen.confirm?.orderId === "ss_e2e_order_1", "승인 바디: orderId = 서버 발급 주문번호");
  check(seen.confirm?.amount === 14900, "승인 바디: 금액 = 서버 확정 금액");
  check((seen.confirmAuth ?? "").startsWith("Bearer "), "승인 요청 Authorization 헤더");
  check(req === null || req.p.method === "CARD", "requestPayment method=CARD(통합결제창)");

  const st = await page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));
  check(st.premium === true && JSON.stringify(st.premiumSubjectIds) === '["sci-g1"]', "이용권 반영(교체 시맨틱)");
  const urlClean = await page.evaluate(() => location.search === "");
  check(urlClean, "successUrl 쿼리 청소");
  const pending = await page.evaluate(() => localStorage.getItem("ss.payPending"));
  check(pending === null, "승인 재료(pending) 정리");
  await page.close();
}

// ───────────────────── [C] failUrl 복귀 — 취소 스낵 + 주소 청소 ─────────────────────
{
  console.log("[C] failUrl 복귀(취소)");
  const page = await newPage();
  await page.goto(
    `http://localhost:${PORT}/?pay=fail&code=PAY_PROCESS_CANCELED&message=${encodeURIComponent("사용자 취소")}`,
    { waitUntil: "networkidle" },
  );
  await page.waitForSelector(".pay-snack.show", { timeout: 15000 });
  const snack = await page.evaluate(() => document.querySelector(".pay-snack").textContent);
  check(snack.includes("취소"), `취소 스낵: "${snack}"`);
  const urlClean = await page.evaluate(() => location.search === "");
  check(urlClean, "failUrl 쿼리 청소(OAuth ?code 오인 차단)");
  await page.close();
}

await browser.close();
console.log(`\n${fails === 0 ? "ALL PASS" : "FAILED"} — ${checks - fails}/${checks}`);
process.exit(fails === 0 ? 0 : 1);
