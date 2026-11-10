// 코드로 그린 스틱맨 그림이 실제 화면에 들어간 모습을 폰 크기 두 가지로 찍는다.
// 스플래시, 과목 탭, 만화 컷과 말풍선, 정리 화면, 둘째 레슨의 도입, 로그인 화면, 계정 관리 화면.
// 실행: PORT=5537 node qa/shot-sketch.mjs [출력 폴더]   (dev 서버 필요. ONLY=390x700 처럼 한 크기만 찍을 수 있다)
//       COMIC="u1l1:과학적 탐구 방법" 처럼 레슨 id와 지도 노드 이름을 주면 그 만화를 찍는다(기본 u1l1).
import { chromium } from "playwright-core";
import { mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const PORT = process.env.PORT || "5537";
const OUT = process.argv[2] ?? "qa/shots/sketch";
mkdirSync(OUT, { recursive: true });
const BASE = `http://localhost:${PORT}`;
const VPS = [{ name: "390x700", width: 390, height: 700 }, { name: "375x812", width: 375, height: 812 }].filter((v) => !process.env.ONLY || process.env.ONLY === v.name);
const MODES = [{ key: "now", q: "" }];
const [COMIC_ID, COMIC_LABEL] = (process.env.COMIC || "u1l1:과학적 탐구 방법").split(":");
const UNIT_TAB = process.env.UNIT || "I."; // 지도의 단원 탭 머리글자(예: "II.", "III.")

const browser = await chromium.launch({ channel: "chrome", headless: true });

// 중1 Ⅰ 완료 상태(둘째 레슨의 훅까지 열어 보려고). 날짜는 고정값이라 화면에 영향이 없다.
const seed = () => {
  const lessons = {};
  // 중1 과학 전 레슨을 완료 상태로(어느 단원의 만화든 바로 열 수 있게)
  for (let u = 1; u <= 7; u++) for (let l = 1; l <= 12; l++) lessons[`u${u}l${l}`] = { done: true, acc: 95, bestXp: 60 };
  for (let l = 1; l <= 12; l++) lessons[`u2v3l${l}`] = { done: true, acc: 95, bestXp: 60 };
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "중1", goalMin: 10, streak: 2,
    lastStudyDay: "2026-11-10", totalXp: 300, lessons, minigame: {}, premium: true, // 프리미엄 레슨의 만화도 찍으려고
  }));
};

async function run(vp, mode) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(seed);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
  const freeze = () => page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
  const shot = async (name) => { await freeze(); await page.screenshot({ path: join(OUT, `${name}-${vp.name}-${mode.key}.png`) }); };
  const clickText = (re) => page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent || ""));
    if (b) b.click();
    return !!b;
  }, re);
  // 문서 전체가 아니라 레슨의 스크롤 영역만 움직인다(문서가 밀리면 화면 밖 시트가 딸려 올라온다)
  const scrollTo = (sel, pos = "start") => page.evaluate(([sel, pos]) => {
    const el = document.querySelector(sel);
    let sc = el?.parentElement;
    while (sc && !/auto|scroll/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
    if (!el || !sc) return;
    const r = el.getBoundingClientRect(), s = sc.getBoundingClientRect();
    sc.scrollTop += pos === "end" ? r.bottom - s.bottom + 12 : r.top - s.top - 10;
  }, [sel, pos]);
  const imgsReady = (sel) => page.waitForFunction((sel) => {
    const im = [...document.querySelectorAll(sel)];
    return im.length > 0 && im.every((i) => i.complete && i.naturalWidth > 0);
  }, sel, { timeout: 15000 });

  // 1) 스플래시: 플립북 도중 한 장 + 정착
  await page.goto(`${BASE}/${mode.q}`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.waitForFunction(() => document.querySelector(".flipbook")?.classList.contains("settled"), null, { timeout: 15000 });
  await page.waitForTimeout(2200); // 워드마크와 버튼이 다 떠오를 때까지(여기서는 애니메이션을 끊지 않는다)
  await page.screenshot({ path: join(OUT, `splash-${vp.name}-${mode.key}.png`) });

  // 2) 홈 → 중1 Ⅰ 첫 레슨 만화
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /둘러보기|이어가기/.test(b.textContent))?.click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(700);
  const openLesson = async (label) => {
    await page.evaluate((u) => [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.trim().startsWith(u))?.click(), UNIT_TAB);
    await page.waitForTimeout(600);
    await page.evaluate((label) => [...document.querySelectorAll(".screen.active .gm-node")].find((x) => (x.getAttribute("aria-label") || "").includes(label))?.click(), label);
    await page.waitForTimeout(900);
  };
  const exit = async () => { await page.evaluate(() => document.querySelector(".screen.active .xbtn[aria-label='닫기']")?.click()); await page.waitForTimeout(700); };

  await openLesson(COMIC_LABEL);
  await page.waitForTimeout(3400); // "완료한 레슨이에요" 안내가 사라질 때까지
  const nCuts = await page.evaluate(() => document.querySelectorAll(".screen.active .comic-dots i").length);
  for (let i = 0; i < nCuts; i++) {
    await imgsReady(".screen.active .comic-img");
    await page.waitForTimeout(250);
    // 두 상태가 같은 자리에서 시작하도록 컷 번호 점을 화면 위에 맞춘다
    await scrollTo(".screen.active .comic-dots");
    await page.waitForTimeout(150);
    await shot(`${COMIC_ID}-cut${i + 1}`);
    await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
    await page.waitForTimeout(500);
  }
  // 3) 정리 화면: 원형 스틱맨(웃음)과 끝인사(만세)
  await page.waitForTimeout(400);
  await shot("recap-top");
  await scrollTo(".screen.active .rc-outro", "end");
  await page.waitForTimeout(300);
  await shot("recap-outro");
  await exit();

  // 4) 둘째 레슨의 훅: 원형 스틱맨이 반응에 따라 표정을 바꾼다 (Ⅰ단원을 찍을 때만)
  if (COMIC_ID === "u1l1") {
    await openLesson("직접 탐구하기");
    await page.waitForTimeout(3400);
    await shot("hook-start");
    await clickText("검은색 컵");
    await page.waitForTimeout(2200);
    await scrollTo(".screen.active .comic-narrator");
    await page.waitForTimeout(200);
    await shot("hook-after");
    await exit();
  }

  // 과목 탭: 과목 카드 그림
  await page.evaluate(() => { location.hash = "#/subjects"; });
  await page.waitForSelector("#sc-subjects", { timeout: 10000 }).catch(() => {});
  await imgsReady("#sc-subjects .subj-ava img").catch(() => console.log("  ! 과목 카드 그림을 찾지 못했다"));
  await page.waitForTimeout(500);
  await shot("subjects");

  // 5) 로그인 화면(비로그인)
  await page.evaluate(() => { location.hash = "#/login"; });
  await page.waitForSelector("#sc-login", { timeout: 10000 });
  await imgsReady("#sc-login .login-study img");
  await page.waitForTimeout(500);
  await shot("login");
  await ctx.close();

  // 6) 계정 관리 화면: 이 워크트리에는 로그인 백엔드 설정이 없어서, 검수용으로만 가짜 사용자를 심는다
  //    (dev 서버가 내주는 auth 모듈의 초기값만 바꿔 끼운다. 앱 코드는 그대로다)
  const ctx2 = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx2.addInitScript(seed);
  await ctx2.addInitScript(() => { window.__skFakeUser = { id: "qa-user", email: "stick@example.com", name: "스틱 친구", provider: "google" }; });
  await ctx2.route("**/src/core/auth.ts*", async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace("let user = null;", "let user = window.__skFakeUser ?? null;");
    await route.fulfill({ response: res, body });
  });
  const p2 = await ctx2.newPage();
  p2.on("pageerror", (e) => console.log("PAGEERROR(account):", e.message));
  await p2.goto(`${BASE}/${mode.q}#/login`, { waitUntil: "networkidle" });
  await p2.waitForSelector("#sc-login", { timeout: 15000 });
  await p2.waitForFunction(() => { const i = document.querySelector("#sc-login .login-study img"); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 10000 }).catch(() => console.log("  ! 계정 화면 그림을 찾지 못했다"));
  await p2.waitForTimeout(500);
  await p2.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
  await p2.screenshot({ path: join(OUT, `account-${vp.name}-${mode.key}.png`) });
  await ctx2.close();
  console.log("SAVED", vp.name, mode.key);
}

// 스플래시 플립북을 실제 박자 그대로 녹화한다(390×700)
async function record(mode) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, recordVideo: { dir: OUT, size: { width: 390, height: 700 } } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${mode.q}`, { waitUntil: "commit" });
  await page.waitForFunction(() => document.querySelector(".flipbook")?.classList.contains("settled"), null, { timeout: 20000 });
  await page.waitForTimeout(1600);
  const v = page.video();
  await ctx.close();
  const to = join(OUT, `splash-flip-${mode.key}.webm`);
  renameSync(await v.path(), to);
  console.log("VIDEO", to);
}

for (const vp of VPS) for (const mode of MODES) await run(vp, mode);
if (!process.env.NOVIDEO) for (const mode of MODES) await record(mode);
await browser.close();
console.log("DONE");
