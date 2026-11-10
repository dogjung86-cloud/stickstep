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
// [E] 학습 탭의 과목이 바뀌면 주소가 따라온다(2026-11-11): 주소창에서 과목만 고칠 때, 과목 탭에서 고를 때,
//     다른 탭에 다녀올 때, 새로고침할 때. 가드 반납 뒤 주소를 다시 쓰지 않아 예전 과목 주소가 남던 문제의 회귀 가드
// [F] 하드웨어 뒤로가기 회귀: 레슨에서 back, 탭에서 back, 닫기 버튼으로 닫은 뒤 루트에서 back(= 앱 이탈),
//     비로그인 마이 탭에 얹힌 로그인 화면에서 back(로그인 설정이 없으면 얹는 조건을 풀어 흉내).
//     [E]의 처리가 뒤로가기 동작과 히스토리 깊이를 바꾸지 않았는지 본다
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
  // 시드는 문서가 열릴 때마다 심긴다. 앱을 떠나 about:blank로 가면 저장소를 못 쓰므로 조용히 넘긴다([F] 이탈 검사).
  if (seed)
    await page.addInitScript((s) => {
      try {
        localStorage.setItem("science-app.v1", JSON.stringify(s));
      } catch {
        /* 저장소가 없는 문서 */
      }
    }, seed);
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

/** 스플래시 → 둘러보기 → 학습 탭까지([E]·[F] 공용). */
async function bootToHome(page) {
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
/** 지금 화면: 맨 위 화면 id · 단원 띠 제목 · 주소 · 히스토리 길이. */
const snapOf = (page) =>
  page.evaluate(() => ({
    id: document.querySelector(".screen.active")?.id ?? "",
    band:
      document.querySelector(".screen.active .unit-band.on .ub-title, .screen.active .unit-band .ub-title")?.textContent?.trim() ?? "",
    hash: location.hash,
    len: history.length,
  }));
const goHashOf = async (page, h) => {
  await page.evaluate((h) => (location.hash = h), h);
  await page.waitForTimeout(900);
};
const tapTabOf = async (page, label) => {
  await page.evaluate((label) => {
    [...document.querySelectorAll(".screen.active .gnav-item")]
      .find((b) => b.querySelector(".gnav-tx")?.textContent === label)
      ?.click();
  }, label);
  await page.waitForTimeout(800);
};

// ───────────────────── [E] 학습 탭의 과목이 바뀌면 주소가 따라온다 ─────────────────────
// 과목이 바뀐 직후 가드 반납 history.back이 되돌아간 엔트리의 예전 해시를 그대로 둬서, 화면은 수학인데
// 주소는 #/subject/sci로 남았다(같은 주소를 다시 쳐도 무반응이고, 새로고침하면 과학으로 돌아갔다).
// 과목이 여럿 보이는 사람(운영 계정·검토 모드·dev)에게만 드러난다. 일반 사용자는 홈 주소가 늘 #/subject/sci다.
{
  console.log("[E] 과목 전환 뒤 주소 동기(주소창 수정 · 과목 탭 선택 · 탭 왕복 · 새로고침)");
  const page = await newPage({ seed: SEED });
  await bootToHome(page);
  const snap = () => snapOf(page);
  const goHash = (h) => goHashOf(page, h);
  const tapTab = (label) => tapTabOf(page, label);
  const SCI = "과학과 인류의 지속가능한 삶";
  const MATH = "수와 연산";

  // E1. 주소창에서 과목만 고친다 → 화면과 주소가 함께 수학
  await goHash("#/subject/math");
  let s = await snap();
  check(s.band === MATH && s.hash === "#/subject/math", `주소창 #/subject/math → 수학 지도 + 주소 일치(${s.band}, ${s.hash})`);
  const len1 = s.len;
  // E2. 다시 과학으로(예전에는 주소가 #/subject/sci로 남아 있어 아무 일도 없었다)
  await goHash("#/subject/sci");
  s = await snap();
  check(s.band === SCI && s.hash === "#/subject/sci", `주소창 #/subject/sci → 과학 지도 + 주소 일치(${s.band}, ${s.hash})`);
  check(s.len === len1, `주소 이동이 히스토리를 더 쌓지 않음(length ${len1} → ${s.len})`);
  // E3. 과목 탭에서 수학을 고른다 → 주소도 수학
  await tapTab("과목");
  await page.waitForSelector("#sc-subjects", { timeout: 8000 });
  await page.evaluate(() => {
    [...document.querySelectorAll("#sc-subjects .subj-card")]
      .find((c) => c.querySelector(".subj-name")?.textContent?.trim() === "수학")
      ?.click();
  });
  await page.waitForSelector("#sc-home.active", { timeout: 8000 });
  await page.waitForTimeout(800);
  s = await snap();
  check(s.band === MATH && s.hash === "#/subject/math", `과목 탭에서 수학 선택 → 주소 일치(${s.band}, ${s.hash})`);
  // E4. 다른 탭에 다녀와도 주소는 보고 있는 과목
  await tapTab("복습");
  await tapTab("학습");
  s = await snap();
  check(s.id === "sc-home" && s.band === MATH && s.hash === "#/subject/math", `복습 → 학습 왕복 뒤 주소 일치(${s.hash})`);
  // E5. 새로고침해도 보던 과목이 유지된다(주소가 어긋나 있으면 과학으로 돌아갔다)
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#sc-home", { timeout: 25000 });
  await page.waitForTimeout(600);
  s = await snap();
  check(s.band === MATH && s.hash === "#/subject/math", `새로고침 뒤에도 수학 지도(${s.band}, ${s.hash})`);
  // E6. 하드웨어 뒤로가기는 그대로다: 복습 탭에서 back 1회 = 학습 탭
  await tapTab("복습");
  await page.evaluate(() => history.back());
  await page.waitForTimeout(900);
  s = await snap();
  check(s.id === "sc-home" && s.band === MATH && s.hash === "#/subject/math", `복습 탭에서 back → 학습 탭 + 주소(${s.id}, ${s.hash})`);
  await page.close();
}

// ───────────────────── [F] 하드웨어 뒤로가기 회귀 ─────────────────────
// 가드 반납 뒤에 주소를 다시 쓰는 처리([E])가 뒤로가기 동작과 히스토리 깊이를 바꾸지 않았는지 본다.
{
  console.log("[F] 뒤로가기 회귀(레슨에서 back · 탭에서 back · 닫기 버튼 뒤 루트에서 back = 이탈)");
  const page = await newPage({ seed: SEED });
  await bootToHome(page);
  const snap = () => snapOf(page);
  const tapTab = (label) => tapTabOf(page, label);
  const openLesson = async () => {
    await page.evaluate(() => document.querySelector(".screen.active .gm-node:not(.exam)")?.click());
    await page.waitForSelector(".lheader", { timeout: 10000 });
    await page.waitForTimeout(600);
  };
  const lessonOpen = () => page.evaluate(() => !!document.querySelector(".screen.active .lheader"));

  // F1. 레슨을 열고 back 1회 → 레슨이 닫히고 학습 탭, 주소 그대로
  await openLesson();
  check(await lessonOpen(), "레슨 화면 진입");
  await page.evaluate(() => history.back());
  await page.waitForTimeout(900);
  let s = await snap();
  check(s.id === "sc-home" && !(await lessonOpen()) && s.hash === "#/subject/sci", `레슨에서 back 1회 → 학습 탭(${s.id}, ${s.hash})`);
  // F2. 도전 탭에서 back 1회 → 학습 탭
  await tapTab("도전");
  await page.evaluate(() => history.back());
  await page.waitForTimeout(900);
  s = await snap();
  check(s.id === "sc-home" && s.hash === "#/subject/sci", `도전 탭에서 back 1회 → 학습 탭(${s.id}, ${s.hash})`);
  // F3. 레슨을 화면 안 닫기 버튼으로 닫는다(가드 반납) → 학습 탭, 주소 그대로
  await openLesson();
  await page.evaluate(() => document.querySelector('.screen.active .lheader [aria-label="닫기"]')?.click());
  await page.waitForTimeout(900);
  s = await snap();
  check(s.id === "sc-home" && s.hash === "#/subject/sci", `닫기 버튼으로 레슨 종료 → 학습 탭(${s.id}, ${s.hash})`);
  // F4. 그 상태(루트)에서 back 1회 = 앱을 떠난다(남은 가드 엔트리가 없어야 한다)
  await page.evaluate(() => history.back());
  await page.waitForTimeout(1200);
  const url = page.url();
  check(!url.includes(`localhost:${PORT}`), `루트에서 back 1회 → 앱을 떠남(${url})`);
  await page.close();

  // F5. 비로그인 마이 탭에 얹힌 로그인 화면에서 back(운영에서 가장 흔한 뒤로가기 경로).
  //     로그인 설정이 없는 환경은 로그인 화면을 얹지 않아 [C]가 건너뛴다. 여기서는 main.ts 응답에서
  //     얹는 조건만 풀어 운영과 같은 흐름을 만든다(소스는 그대로다).
  const p = await newPage({ seed: SEED });
  let forced = false;
  await p.route("**/src/main.ts*", async (route) => {
    const res = await route.fetch();
    const src = await res.text();
    const out = src.replace(/isAuthConfigured\(\)\s*&&\s*!currentUser\(\)\s*&&\s*!hasStoredSession\(\)/, "!currentUser()");
    forced = out !== src;
    await route.fulfill({ response: res, body: out });
  });
  await bootToHome(p);
  await tapTabOf(p, "마이");
  await p.waitForTimeout(400);
  let t = await snapOf(p);
  check(forced && t.id === "sc-login" && t.hash === "#/login", `마이 탭 → 로그인 화면이 얹힘(${t.id}, ${t.hash})`);
  await p.evaluate(() => history.back());
  await p.waitForTimeout(900);
  t = await snapOf(p);
  check(t.id === "sc-my" && t.hash === "#/my", `로그인 화면에서 back 1회 → 마이 탭 + 주소(${t.id}, ${t.hash})`);
  await p.evaluate(() => history.back());
  await p.waitForTimeout(900);
  t = await snapOf(p);
  check(t.id === "sc-home" && t.hash === "#/subject/sci", `마이 탭에서 back 1회 → 학습 탭 + 주소(${t.id}, ${t.hash})`);
  await p.close();
}

await browser.close();
console.log(`\n${fails === 0 ? "ALL PASS" : "FAILED"} — ${checks - fails}/${checks}`);
process.exit(fails === 0 ? 0 : 1);
