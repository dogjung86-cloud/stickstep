// 버그·건의 접수함 E2E — 마이 탭 행 → 시트(유형 칩·글자 수·전송 게이트) → DEV 스텁 전송
// (window.__ssReports 훅) → 컨텍스트 자동 첨부 → 일일 상한 5건 차단까지 실플레이.
// DEV 서버 필요(스텁·__ssReports가 DEV 전용). PORT=<포트> node qa/e2e-report.mjs
// 주의: .env.local이 있는 기기는 비로그인 마이 탭 진입 시 로그인 화면이 위에 얹힌다(설계) —
// 부팅 후 닫기(.backbtn)로 마이에 착지하는 분기를 포함한다(env 없는 기기에선 자동 생략).
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => {
  pageErrors += 1;
  console.log("PAGEERROR:", e.message);
});
// 동시 세션 HMR 면역 — @vite/client를 스텁으로 대체(웹소켓 제거, updateStyle 유지)
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);

await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
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
      totalXp: 0,
      lessons: {},
      minigame: {},
      lastUnits: { "sci:g1": "u3" },
      recentUnitId: "u3", // 접수 컨텍스트 unit 검증용(최근에 연 단원)
    }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
// 공개 진입 플로우: 부팅은 항상 스플래시 — 플립북 스킵 탭 → "둘러보기" 조건 대기 → 홈(정본 = e2e-soc7 부팅부)
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
await page.waitForTimeout(600);

const W = (ms) => page.waitForTimeout(ms);
let checks = 0;
let fails = 0;
const check = (ok, msg) => {
  checks += 1;
  console.log(`${ok ? "PASS" : "FAIL"} [${checks}] ${msg}`);
  if (!ok) fails += 1;
};

const SHEET = '.mysheet[aria-label="버그·건의 보내기"]';
const openReportSheet = async () => {
  await page.evaluate(() => {
    [...document.querySelectorAll(".my-row")].find((r) => r.textContent.includes("버그·건의")).click();
  });
  await page.waitForFunction(
    (sel) => document.querySelector(sel)?.classList.contains("open"),
    SHEET,
    { timeout: 5000 },
  );
};
const sheetOpen = () => page.evaluate((sel) => !!document.querySelector(sel)?.classList.contains("open"), SHEET);
const sendDisabled = () => page.evaluate((sel) => document.querySelector(`${sel} .mysheet-done`).disabled, SHEET);
const snackText = () => page.evaluate(() => document.querySelector("#sc-my .snack")?.textContent ?? "");
const reports = () => page.evaluate(() => (window.__ssReports ?? []).length);

// ── 마이 탭 진입(비로그인 — env 있는 기기는 로그인 화면이 얹히므로 닫고 착지) ──
{
  await page.evaluate(() => {
    [...document.querySelectorAll(".gnav-item")].find((b) => b.textContent.includes("마이")).click();
  });
  await W(900);
  const loginOver = await page.evaluate(() => !!document.querySelector("#sc-login"));
  if (loginOver) {
    await page.evaluate(() => document.querySelector('#sc-login .backbtn[aria-label="닫기"]')?.click());
    await W(600);
  }
  await page.waitForSelector("#sc-my", { timeout: 8000 });
  check(true, `마이 탭 진입(로그인 얹힘 ${loginOver ? "있음 → 닫기" : "없음"})`);
  const row = await page.evaluate(
    () => [...document.querySelectorAll(".my-row")].some((r) => r.textContent.includes("버그·건의 보내기")),
  );
  check(row, '메뉴에 "버그·건의 보내기" 행 존재');
}

// ── 시트 열기 · 초기 상태(유형 칩 3종 + 기본 bug 선택 + 전송 잠김) ──
{
  await openReportSheet();
  check(await sheetOpen(), "접수 시트 열림");
  const kinds = await page.evaluate(
    (sel) => [...document.querySelectorAll(`${sel} .rep-kind`)].map((b) => `${b.textContent}:${b.getAttribute("aria-checked")}`),
    SHEET,
  );
  check(kinds.length === 3, `유형 칩 3종 (실제 ${kinds.length})`);
  check(kinds[0] === "버그 신고:true", `기본 선택 = 버그 신고 (실제 ${kinds[0]})`);
  check(await sendDisabled(), "빈 내용 전송 버튼 잠김");
  await page.fill(`${SHEET} .rep-text`, "짧다");
  check(await sendDisabled(), "5자 미만 전송 버튼 잠김");
}

// ── 유형 전환 + 전송(DEV 스텁) → 시트 닫힘·스낵·__ssReports 페이로드 검증 ──
{
  await page.evaluate((sel) => {
    [...document.querySelectorAll(`${sel} .rep-kind`)].find((b) => b.textContent.includes("오탈자")).click();
  }, SHEET);
  const typoOn = await page.evaluate(
    (sel) => [...document.querySelectorAll(`${sel} .rep-kind`)].find((b) => b.textContent.includes("오탈자")).getAttribute("aria-checked"),
    SHEET,
  );
  check(typoOn === "true", "유형 칩 오탈자 전환");
  const body = "중1 과학 열 단원 레슨에서 그림이 안 보여요(e2e 검증용)";
  await page.fill(`${SHEET} .rep-text`, body);
  const count = await page.evaluate((sel) => document.querySelector(`${sel} .rep-count`).textContent, SHEET);
  check(count === `${body.length} / 800`, `글자 수 카운터 갱신 (실제 ${count})`);
  check(!(await sendDisabled()), "유효 내용 전송 버튼 해제");
  await page.evaluate((sel) => document.querySelector(`${sel} .mysheet-done`).click(), SHEET);
  await W(400);
  check(!(await sheetOpen()), "전송 성공 시 시트 닫힘");
  check((await snackText()).includes("접수했어요"), `접수 스낵 (실제 "${await snackText()}")`);
  const r = await page.evaluate(() => window.__ssReports?.[0] ?? null);
  check((await reports()) === 1, `DEV 스텁 접수 1건 (실제 ${await reports()})`);
  check(r?.kind === "typo", `kind = typo (실제 ${r?.kind})`);
  check(r?.body === body, "body 원문 일치");
  check(r?.user_id === null, "비로그인 접수 user_id = null");
  check(r?.context?.subject === "sci" && r?.context?.grade === "g1", `컨텍스트 과목·학년 (실제 ${r?.context?.subject}·${r?.context?.grade})`);
  check(r?.context?.unit === "u3", `컨텍스트 최근 단원 = u3 (실제 ${r?.context?.unit})`);
  check(typeof r?.context?.ua === "string" && r.context.ua.length > 0, "컨텍스트 기기(UA) 첨부");
  const cleared = await page.evaluate((sel) => document.querySelector(`${sel} .rep-text`).value, SHEET);
  check(cleared === "", "전송 후 입력 비움");
}

// ── 일일 상한 5건 — 4건 더 접수 후 6번째는 차단(스낵 + 훅 불변) ──
{
  for (let i = 2; i <= 5; i += 1) {
    await openReportSheet();
    await page.fill(`${SHEET} .rep-text`, `상한 검증용 접수 ${i}번째예요`);
    await page.evaluate((sel) => document.querySelector(`${sel} .mysheet-done`).click(), SHEET);
    await W(300);
  }
  check((await reports()) === 5, `상한까지 접수 5건 (실제 ${await reports()})`);
  await openReportSheet();
  await page.fill(`${SHEET} .rep-text`, "여섯 번째는 막혀야 해요");
  await page.evaluate((sel) => document.querySelector(`${sel} .mysheet-done`).click(), SHEET);
  await W(400);
  check((await snackText()).includes("내일"), `상한 스낵 (실제 "${await snackText()}")`);
  check((await reports()) === 5, `상한 초과 접수 차단 (실제 ${await reports()})`);
  check(await sheetOpen(), "차단 시 시트 유지(내용 보존)");
}

check(pageErrors === 0, `페이지 에러 0 (실제 ${pageErrors})`);
console.log(`\n버그·건의 접수함 E2E: ${checks - fails}/${checks} PASS${fails ? ` · ${fails} FAIL` : ""}`);
await browser.close();
process.exit(fails ? 1 : 0);
