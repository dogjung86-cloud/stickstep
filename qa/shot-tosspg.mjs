// 토스PG 심사 결제경로 캡처 — 실크롬 창(주소창 도메인)+윈도우 작업표시줄(PC 시계)이 함께 나오는
// **전체 화면 캡처**(가이드 요건 2·3: 도메인 노출 + 시간 흐름). 산출물 = output/toss-pg/shots/*.png
// 실행: node qa/shot-tosspg.mjs  (기본 대상 = 프로덕션 https://stickstep.com — dev 서버 불필요)
// 흐름: 메인(스플래시+사업자정보) → 로그인(이메일 폼 → 완료) → 환불 정책 → 상품(#/pricing)
//       → 주문 확인 시트 → 토스 결제창(카드) → NH농협 → 비씨 각 인증 직전(가이드 요건 8).
// **결제는 완료하지 않는다** — 심사 계정(toss-review@…)을 비프리미엄으로 유지해야 심사역이
// 결제 플로우를 직접 밟을 수 있다. 중단된 주문은 orders에 pending으로 남고 무해(PAYMENTS.md).
import { chromium } from "playwright-core";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const BASE = process.env.BASE || "https://stickstep.com";
const OUT = process.env.OUT || "D:/Brilliant Science/output/toss-pg/shots";
const EMAIL = process.env.TOSS_TEST_ID || "toss-review@stickstep.com";
const PW = process.env.TOSS_TEST_PW || "20262026";
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function snap(name) {
  const ps =
    "Add-Type -AssemblyName System.Windows.Forms,System.Drawing; " +
    "$b=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds; " +
    "$bmp=New-Object System.Drawing.Bitmap($b.Width,$b.Height); " +
    "$g=[System.Drawing.Graphics]::FromImage($bmp); " +
    "$g.CopyFromScreen($b.Location,[System.Drawing.Point]::Empty,$b.Size); " +
    `$bmp.Save('${OUT}/${name}.png'); $g.Dispose(); $bmp.Dispose()`;
  const r = spawnSync("powershell.exe", ["-NoProfile", "-Command", ps], { timeout: 30000 });
  console.log(`SNAP ${name}${r.status === 0 ? "" : " FAIL"}`);
}

const browser = await chromium.launch({
  channel: "chrome",
  headless: false,
  ignoreDefaultArgs: ["--enable-automation"], // "자동화 소프트웨어" 인포바 제거(심사 문서 청결)
  // 작업영역 전체를 덮는다 — 뒤에 열린 다른 창(개인 화면)이 캡처에 섞이지 않게. 작업표시줄(시계)만 남긴다.
  args: ["--window-position=0,0", "--window-size=1920,1032", "--lang=ko-KR"],
});
const ctx = await browser.newContext({ viewport: null, locale: "ko-KR" });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

async function tryClick(target, sels, timeout = 2500) {
  for (const s of sels) {
    try {
      await target.click(s, { timeout });
      return s;
    } catch {
      /* 다음 후보 */
    }
  }
  return null;
}

/** 해시 라우트 이동 — Playwright goto는 해시만 다른 같은 문서 이동에서 hashchange를 안 쏜다
 *  (실브라우저 주소창 수정은 정상 발동). 앱 안이면 location.hash 주입(인앱 hashchange 경로),
 *  앱 밖(정적 문서)·실패 시엔 전체 로드/리로드(부팅 딥링크 경로 — e2e-route 검증됨). */
async function gotoRoute(hash, sel) {
  const inApp = await page.evaluate(() => !!document.getElementById("frame")).catch(() => false);
  if (inApp) {
    await page.evaluate((x) => {
      location.hash = x;
    }, hash);
  } else {
    await page.goto(`${BASE}/${hash}`, { waitUntil: "networkidle" });
  }
  const ok = await page
    .waitForSelector(sel, { timeout: 6000 })
    .then(() => true)
    .catch(() => false);
  if (!ok) {
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector(sel, { timeout: 25000 });
  }
  await sleep(600);
}

// ── 1. 메인(스플래시) — 하단 사업자 정보까지 한 화면 ──
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForSelector("#sc-splash", { timeout: 30000 });
const settled = await page
  .waitForSelector(".splash-foot.done", { timeout: 8000 })
  .then(() => true)
  .catch(() => false);
if (!settled) {
  await page.mouse.click(800, 420); // 플립북 스킵 탭
  await page.waitForSelector(".splash-foot.done", { timeout: 8000 }).catch(() => {});
}
await sleep(900);
snap("01-main");
// 사업자 정보 요소 단독 샷(선명 인셋용 — 본 캡처는 전체 화면이 정본)
await page.locator(".splash-business").screenshot({ path: `${OUT}/inset-biz.png` }).catch(() => {});

// ── 2. 로그인 — 이메일 폼 입력 상태 → 로그인 완료 ──
await gotoRoute("#/login", "#sc-login");
await page.click("#sc-login .login-email-toggle");
await sleep(300);
await page.locator("#sc-login .login-email-form input").nth(0).fill(EMAIL);
await page.locator("#sc-login .login-email-form input").nth(1).fill(PW);
await sleep(300);
snap("02-login-form");
await page.click("#sc-login .login-btn.email");
await page.waitForFunction((em) => (document.querySelector("#sc-login")?.textContent ?? "").includes(em), EMAIL, {
  timeout: 25000,
});
await sleep(800);
snap("03-login-done");

// ── 3. 환불 정책(정적 정본 — 주소창에 /refund.html) ──
await page.goto(`${BASE}/refund.html`, { waitUntil: "networkidle" });
await sleep(600);
snap("04-refund");
await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find((x) => x.textContent.includes("10."));
  h?.scrollIntoView({ block: "start" });
  window.scrollBy(0, -12);
});
await sleep(500);
snap("05-refund-period");

// ── 4. 상품(#/pricing) — 상단·플랜·가격/파인프린트 ──
async function gotoPricing() {
  // 토스 결제창 오버레이(딤)가 떠 있으면 리로드로 정리 — 해시(#/pricing)가 남아 부팅 딥링크로 재진입.
  const dimmed = await page
    .evaluate(() => !!document.getElementById("__tosspayments_payment-gateway_dimmer__"))
    .catch(() => false);
  if (dimmed) await page.reload({ waitUntil: "networkidle" });
  await gotoRoute("#/pricing", "#sc-paywall");
  await sleep(900); // 등장 연출 완료
}
await gotoPricing();
snap("06-pricing");
await page.evaluate(() => document.querySelector(".pwx-plans")?.scrollIntoView({ block: "center" }));
await sleep(500);
snap("07-pricing-plans");
await page.evaluate(() => document.querySelector(".pwx-fine")?.scrollIntoView({ block: "center" }));
await sleep(500);
snap("08-pricing-price");

// ── 5. 주문 확인 시트 → 토스 결제창(카드사 선택 → 인증 직전) ──
async function openSheetAndPay() {
  await page.evaluate(() => document.querySelector("#sc-paywall .btn.cta")?.scrollIntoView({ block: "end" }));
  await page.click("#sc-paywall .btn.cta");
  await page.waitForSelector(".pwx-scrim.on .pwx-sheet", { timeout: 8000 });
  await page.click(".pwx-consent input");
  await sleep(400);
}
async function openPayWindow() {
  const popupP = ctx.waitForEvent("page", { timeout: 25000 }).catch(() => null);
  await page.click(".pwx-paybtn");
  let pay = await popupP;
  if (pay) {
    await pay.waitForLoadState("domcontentloaded").catch(() => {});
    await sleep(3500);
    return pay;
  }
  // 팝업이 아니면 같은 탭 리다이렉트/오버레이 — 토스 도메인 프레임을 찾는다
  await sleep(5000);
  if (page.url().includes("tosspayments")) return page;
  const fr = page.frames().find((f) => f.url().includes("tosspayments"));
  return fr ?? page;
}

await openSheetAndPay();
snap("09-order-sheet");
let pay = await openPayWindow();
await sleep(1500);
snap("10-toss-window");

/** 약관 체크 — 게이트웨이 프레임 DOM 직접 클릭(프레임이 카드 상세로 내비게이트한 직후라
 *  텍스트 셀렉터는 타이밍에 취약 — [필수] 리프에서 조상으로 올라가며 체크박스를 찾는다). */
async function consentInFrame(target) {
  return target
    .evaluate(() => {
      const leaf = [...document.querySelectorAll("*")].find(
        (n) => n.childElementCount === 0 && (n.textContent ?? "").includes("[필수]"),
      );
      let t = leaf;
      for (let i = 0; i < 5 && t; i++) {
        const box = t.querySelector?.('input[type="checkbox"], [role="checkbox"]');
        if (box) {
          box.click();
          return true;
        }
        t = t.parentElement;
      }
      leaf?.click();
      return !!leaf;
    })
    .catch(() => false);
}

/** 카드사 한 곳의 인증 화면까지 — 타일 선택 → [필수] 약관 체크 → 다음(가이드 요건 8).
 *  샌드박스에서도 실제 카드사 인증 페이지(vbv.nonghyup.com 등)까지 도달한다 — 결제는 안 한다. */
async function cardRound(label, tileSels, prefix) {
  const picked = await tryClick(pay, tileSels, 6000);
  console.log(`${label} pick:`, picked);
  await sleep(2600); // 게이트웨이 프레임이 카드 상세 화면으로 내비게이트
  const consent = await consentInFrame(pay);
  console.log(`${label} consent:`, consent);
  await sleep(500);
  snap(`${prefix}-pick`);
  await tryClick(pay, ['button:has-text("다음")', "text=다음", 'button:has-text("결제하기")'], 5000);
  await sleep(6500); // 카드사 인증 페이지 로드
  snap(`${prefix}-auth`);
  // 인증이 별도 팝업이면 정리(메인 페이지는 유지)
  for (const p of ctx.pages()) {
    if (p !== page) await p.close().catch(() => {});
  }
}

// 농협(NH) 인증 직전
await cardRound("NH", ['text=농협(NH페이)', "text=농협"], "11-toss-nh");

// 결제창 리로드 정리 후 비씨 라운드(창 내 뒤로가기보다 재진입이 안정적)
await gotoPricing();
await openSheetAndPay();
pay = await openPayWindow();
await sleep(1200);
await cardRound("BC", ['text=비씨(페이북)', "text=비씨"], "13-toss-bc");

// 결제 미완료로 종료(심사 계정 비프리미엄 유지 — 중단 주문은 pending으로 남고 무해)
await browser.close();
console.log("DONE — shots:", fs.readdirSync(OUT).join(", "));
