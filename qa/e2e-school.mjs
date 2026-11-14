// 내 학교 등록 E2E: 마이 탭 프로필 카드의 학교 줄 → "내 학교" 시트 → 검색(두 글자, 디바운스) →
// 동명 학교 지역 구분 → 등록 → 변경 → 해제, 결과 없음, 네트워크 실패와 다시 시도까지 실플레이.
// DEV 서버 필요(검색 스텁과 window.__ssSchoolPush가 DEV 전용). 폰 한 화면(390×700)에서 돈다.
// PORT=<포트> node qa/e2e-school.mjs [스크린샷 폴더]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5173";
const SHOTS = process.argv[2] || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => {
  pageErrors += 1;
  console.log("PAGEERROR:", e.message);
});
// 동시 세션 HMR 면역: @vite/client를 스텁으로 대체(웹소켓 제거, updateStyle 유지)
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);
await page.addInitScript(() => {
  if (localStorage.getItem("science-app.v1")) return; // 새로고침 뒤에는 저장된 상태를 그대로 쓴다
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
    }),
  );
});

const W = (ms) => page.waitForTimeout(ms);
let checks = 0;
let fails = 0;
const check = (ok, msg) => {
  checks += 1;
  console.log(`${ok ? "PASS" : "FAIL"} [${checks}] ${msg}`);
  if (!ok) fails += 1;
};
const shot = async (name) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

async function bootToMy() {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(195, 300); // 플립북 건너뛰기
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), {
    timeout: 15000,
  });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await W(500);
  await page.evaluate(() => [...document.querySelectorAll(".gnav-item")].find((b) => b.textContent.includes("마이")).click());
  await W(700);
  // .env.local이 있는 기기는 비로그인 마이 탭 위에 로그인 화면이 얹힌다. 닫고 마이에 선다.
  if (await page.$("#sc-login")) {
    await page.click("#sc-login .backbtn");
    await W(600);
  }
  await page.waitForSelector("#sc-my .mypf-school", { timeout: 10000 });
}

const SHEET = '.mysheet[aria-label="내 학교"]';
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")).school ?? null);
const listState = () => page.$eval(`${SHEET} .sch-list`, (n) => n.dataset.state);
const items = () =>
  page.$$eval(`${SHEET} .sch-item`, (ns) =>
    ns.map((n) => ({
      code: n.dataset.code,
      name: n.querySelector(".sch-item-name").textContent,
      region: n.querySelector(".sch-item-region").textContent,
    })),
  );
const inView = (sel) =>
  page.$eval(sel, (n) => {
    const r = n.getBoundingClientRect();
    return r.width > 0 && r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth;
  });
const type = async (text) => {
  await page.fill(`${SHEET} .sch-input`, "");
  await page.type(`${SHEET} .sch-input`, text, { delay: 30 });
};

// ── [A] 프로필 카드의 학교 줄 ─────────────────────────────────────────
await bootToMy();
// 게스트: 학교 줄은 로그인 권유이고, 눌러도 학교 시트가 열리지 않는다
check((await page.textContent("#sc-my .mypf-school-t")) === "로그인하고 학교 등록하기", "게스트: 학교 줄이 '로그인하고 학교 등록하기'");
check(await inView("#sc-my .mypf-school"), "게스트: 로그인 권유 줄이 잘리지 않고 화면 안에 있다");
await page.click("#sc-my .mypf-school");
await W(500);
check(!(await page.$eval(SHEET, (n) => n.classList.contains("open"))), "게스트: 눌러도 학교 시트가 열리지 않는다(로그인 화면으로 보낸다)");
await shot("00-my-guest");
// 여기부터는 로그인한 상태를 흉내 낸다(DEV 전용 표식)
await page.evaluate(() => sessionStorage.setItem("ss.schoolauth", "1"));
await bootToMy();
check((await page.textContent("#sc-my .mypf-school-t")) === "학교 등록하기", "등록 전: 학교 줄이 '학교 등록하기'");
check(await inView("#sc-my .my-prof"), "프로필 카드가 폰 한 화면(390×700) 안에 다 들어온다");
check(await inView("#sc-my .my-menu"), "학교 줄이 생긴 뒤에도 메뉴가 한 화면 안에 들어온다");
check(
  await page.$eval("#sc-my .scroll", (n) => n.scrollWidth <= n.clientWidth),
  "마이 탭에 가로 넘침이 없다",
);
await shot("01-my-empty");

// ── [B] 시트와 검색 ───────────────────────────────────────────────────
await page.click("#sc-my .mypf-school");
await W(600);
check(await page.$eval(SHEET, (n) => n.classList.contains("open")), "학교 줄을 누르면 '내 학교' 시트가 열린다");
check((await listState()) === "idle", "처음에는 안내 문구만 보인다");
check(await page.$eval(`${SHEET} .sch-cur`, (n) => n.hidden), "등록 전에는 '지금 등록한 학교' 칸이 없다");
check(await page.$eval(`${SHEET} .sch-input`, (n) => document.activeElement === n), "처음 등록이면 입력 칸에 커서가 간다");
await shot("02-sheet-idle");

await type("중");
await W(500);
check((await listState()) === "idle" && (await items()).length === 0, "한 글자로는 찾지 않는다");

await type("중앙");
await W(180); // 디바운스(0.3초)가 끝나기 전
check((await items()).length === 0, "입력 직후(0.3초 안)에는 아직 찾지 않는다");
await page.waitForSelector(`${SHEET} .sch-item`, { timeout: 4000 });
const res = await items();
check(res.length === 4, `두 글자 이상이면 엔터 없이 결과가 뜬다(중학교 4곳, 실제 ${res.length})`);
const same = res.filter((r) => r.name === "중앙중학교");
check(same.length === 3 && new Set(same.map((r) => r.region)).size === 3, "이름이 같은 학교 셋이 지역으로 구분된다");
check(res.every((r) => r.region.length > 0), "모든 결과에 지역이 붙는다");
check(!res.some((r) => /고등학교|초등학교/.test(r.name)), "기본 검색은 중학교만 찾는다");
// 학교급 세그: 초등학교, 중학교, 고등학교를 따로 찾는다
check((await page.$$eval(`${SHEET} .sch-kinds button`, (bs) => bs.map((b) => b.textContent).join(","))) === "초등학교,중학교,고등학교", "학교급 세그가 초·중·고 셋이다");
await page.click(`${SHEET} .sch-kinds button[data-kind="고등학교"]`);
await page.waitForFunction((sel) => [...document.querySelectorAll(sel)].some((n) => n.textContent.includes("중앙고등학교")), `${SHEET} .sch-item`, { timeout: 4000 });
check((await items()).every((r) => r.name.includes("고등학교")), "고등학교를 고르면 고등학교만 나온다");
await page.click(`${SHEET} .sch-kinds button[data-kind="초등학교"]`);
await page.waitForFunction((sel) => [...document.querySelectorAll(sel)].some((n) => n.textContent.includes("중앙초등학교")), `${SHEET} .sch-item`, { timeout: 4000 });
check((await items()).every((r) => r.name.includes("초등학교")), "초등학교를 고르면 초등학교만 나온다");
await page.click(`${SHEET} .sch-kinds button[data-kind="중학교"]`);
await page.waitForFunction((sel) => [...document.querySelectorAll(sel)].some((n) => n.textContent.includes("중앙중학교")), `${SHEET} .sch-item`, { timeout: 4000 });
check(await inView(`${SHEET} .sch-item`), "첫 결과가 화면 안에 보인다");
check(
  await page.$eval(SHEET, (n) => {
    const r = n.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight + 1;
  }),
  "시트가 화면 밖으로 나가지 않는다",
);
await shot("03-sheet-results");

// ── [C] 등록 ──────────────────────────────────────────────────────────
await page.click(`${SHEET} .sch-item[data-code="7501001"]`);
await W(600);
const s1 = await stored();
check(s1 && s1.code === "7501001" && s1.name === "중앙중학교" && s1.region === "경기도 안양시", "결과를 누르면 바로 등록된다(저장값 확인)");
check(Object.keys(s1 ?? {}).sort().join() === "code,kind,name,region", "저장 항목은 코드·이름·지역·학교급 넷뿐이다");
check(!(await page.$eval(SHEET, (n) => n.classList.contains("open"))), "등록하면 시트가 닫힌다");
check((await page.textContent("#sc-my .mypf-school-t")) === "중앙중학교", "프로필 카드에 학교 이름이 뜬다");
check((await page.textContent("#sc-my .snack")).includes("등록했어요"), "등록 안내가 뜬다");
const pushes1 = await page.evaluate(() => window.__ssSchoolPush ?? []);
check(pushes1.length === 1 && pushes1[0]?.code === "7501001", "서버 반영 창구가 한 번 불린다(DEV 스텁 기록)");
await shot("04-my-registered");

// 새로고침해도 남는다
await bootToMy();
check((await page.textContent("#sc-my .mypf-school-t")) === "중앙중학교", "새로고침 뒤에도 등록한 학교가 남는다");

// ── [D] 변경 ──────────────────────────────────────────────────────────
await page.click("#sc-my .mypf-school");
await W(600);
check(!(await page.$eval(`${SHEET} .sch-cur`, (n) => n.hidden)), "다시 열면 '지금 등록한 학교' 칸이 보인다");
check((await page.textContent(`${SHEET} .sch-cur-name`)) === "중앙중학교", "지금 등록한 학교 이름이 맞다");
check((await page.textContent(`${SHEET} .sch-cur-region`)) === "경기도 안양시", "지금 등록한 학교의 지역이 맞다");
await shot("05-sheet-current");
await type("시흥");
await page.waitForSelector(`${SHEET} .sch-item`, { timeout: 4000 });
await page.keyboard.press("Enter"); // 엔터로도 찾는다(이중 검색이어도 결과는 한 벌)
await W(400);
const res2 = await items();
check(res2.length === 3, `엔터를 눌러도 결과가 한 벌만 뜬다(실제 ${res2.length})`);
await page.click(`${SHEET} .sch-item[data-code="7531004"]`);
await W(600);
const s2 = await stored();
check(s2 && s2.code === "7531004" && s2.name === "시흥은행중학교", "다른 학교를 누르면 바뀐다");
check((await page.textContent("#sc-my .snack")).includes("바꿨어요"), "변경 안내가 뜬다");
check((await page.textContent("#sc-my .mypf-school-t")) === "시흥은행중학교", "프로필 카드의 이름도 바뀐다");

// ── [E] 결과 없음, 실패, 다시 시도 ────────────────────────────────────
await page.click("#sc-my .mypf-school");
await W(600);
await type("없는학교");
await page.waitForFunction((sel) => document.querySelector(sel)?.dataset.state === "empty", `${SHEET} .sch-list`, { timeout: 4000 });
check((await page.textContent(`${SHEET} .sch-note`)).includes("찾은 학교가 없어요"), "결과가 없으면 안내 문구가 뜬다");
await shot("06-sheet-empty");
await page.evaluate(() => sessionStorage.setItem("ss.schoolstub", "fail"));
await type("중앙");
await page.waitForFunction((sel) => document.querySelector(sel)?.dataset.state === "error", `${SHEET} .sch-list`, { timeout: 4000 });
check(!!(await page.$(`${SHEET} .sch-retry`)), "불러오지 못하면 안내와 '다시 시도' 버튼이 뜬다");
await shot("07-sheet-error");
await page.evaluate(() => sessionStorage.removeItem("ss.schoolstub"));
await page.click(`${SHEET} .sch-retry`);
await page.waitForSelector(`${SHEET} .sch-item`, { timeout: 4000 });
check((await items()).length === 4, "다시 시도하면 결과가 뜬다");
check((await stored())?.code === "7531004", "검색만으로는 등록한 학교가 바뀌지 않는다");

// 빠르게 고쳐 쓰면 마지막 검색어의 결과만 남는다
await type("중앙");
await type("한빛");
await W(900);
const res3 = await items();
check(res3.length === 1 && res3[0].name === "한빛중학교", "검색어를 바꾸면 마지막 검색어의 결과만 남는다");

// ── [F] 해제 ──────────────────────────────────────────────────────────
await page.click(`${SHEET} .sch-off`);
await W(400);
check((await stored()) === null, "등록 해제를 누르면 저장값이 지워진다");
check(await page.$eval(`${SHEET} .sch-cur`, (n) => n.hidden), "'지금 등록한 학교' 칸이 사라진다");
check((await page.textContent("#sc-my .mypf-school-t")) === "학교 등록하기", "프로필 카드가 '학교 등록하기'로 돌아온다");
const pushes2 = await page.evaluate(() => window.__ssSchoolPush ?? []);
check(pushes2.length === 2 && pushes2[1] === null, "해제도 서버 반영 창구로 전달된다(null)");
await page.keyboard.press("Escape");
await W(400);
check(!(await page.$eval(SHEET, (n) => n.classList.contains("open"))), "Esc로 시트가 닫힌다");

// 닉네임 시트: 자판이 화면을 덮으면(visualViewport가 줄면) 그만큼 시트가 올라와 입력이 가려지지 않는다
await page.$eval(".mypf-nick-edit", (b) => b.classList.remove("hidden")); // 연필은 로그인 전용이라 게스트 검사에서는 드러내고 누른다
await page.click(".mypf-nick-edit");
await page.waitForSelector(".mysheet.nick.open");
await W(500);
const kbLift = await page.evaluate(async () => {
  const vv = window.visualViewport;
  const full = window.innerHeight;
  Object.defineProperty(vv, "height", { configurable: true, get: () => full - 300 });
  vv.dispatchEvent(new Event("resize"));
  await new Promise((r) => setTimeout(r, 100));
  const sheet = document.querySelector(".mysheet.nick").getBoundingClientRect();
  const input = document.querySelector(".mysheet.nick .nick-input").getBoundingClientRect();
  const save = document.querySelector(".mysheet.nick .mysheet-done").getBoundingClientRect();
  delete vv.height;
  vv.dispatchEvent(new Event("resize"));
  return { sheetBottom: Math.round(sheet.bottom), inputBottom: Math.round(input.bottom), saveBottom: Math.round(save.bottom), top: Math.round(sheet.top), limit: full - 300 };
});
check(kbLift.sheetBottom <= kbLift.limit + 1 && kbLift.inputBottom < kbLift.limit && kbLift.saveBottom <= kbLift.limit && kbLift.top >= 0, `자판 300px이 올라오면 닉네임 입력과 저장 버튼이 자판 위에 있다(${JSON.stringify(kbLift)})`);
await page.keyboard.press("Escape");
await W(300);
check(pageErrors === 0, `페이지 오류 0건(실제 ${pageErrors})`);
console.log(`\n${fails === 0 ? "ALL PASS" : "FAILED"} ${checks - fails}/${checks}`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
