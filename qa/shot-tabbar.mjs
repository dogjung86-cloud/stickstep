// 하단 탭바 눈검수: 일반 사용자(공개 뷰)의 탭 구성을 폰과 넓은 화면에서 찍는다.
// 과목 탭은 지금 닫혀 있다(store.hasSubjectChoice, 2026-11-11). 일반 사용자와 운영 계정의 탭은 넷이고,
// 검토 모드와 dev에서만 과목 탭이 더해져 다섯이다.
// 실행: BASE=<주소> node qa/shot-tabbar.mjs [출력 폴더] [파일 접두]
//   BASE는 프로덕션 번들을 띄운 주소(vite preview 등)다. 번들은 그 자체로 공개 뷰라 따로 줄 것이 없다.
//   dev 서버를 찍을 때는 PUB=1을 함께 준다(sessionStorage "ss.pub"="1"로 공개 뷰를 강제한다).
//   PORT만 주면 BASE는 http://localhost:<PORT>가 된다.
// 산출물: <접두>-phone.png(폰 학습 탭) · <접두>-phone-<탭>.png(탭마다 탭바) · <접두>-desktop.png(넓은 화면 사이드바)
//         과목 탭이 서 있는 빌드라면 <접두>-phone-hub.png(과목 허브)도 남긴다.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const BASE = (process.env.BASE || `http://localhost:${process.env.PORT || "5173"}`).replace(/\/$/, "");
const PUB = process.env.PUB === "1";
const OUT = process.argv[2] || "qa/shots";
const PRE = process.argv[3] || "tabbar";
fs.mkdirSync(OUT, { recursive: true });
const file = (name) => path.join(OUT, `${PRE}-${name}.png`);

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
  totalXp: 0,
  lessons: {},
  minigame: {},
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
let errors = 0;

/** 스플래시 → 둘러보기 → 학습 탭까지(정본 부팅부). */
async function open(ctxOpts, seed) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => {
    errors += 1;
    console.log("  PAGEERROR:", e.message);
  });
  await page.addInitScript(
    ({ seed, pub }) => {
      if (seed) localStorage.setItem("science-app.v1", JSON.stringify(seed));
      if (pub) sessionStorage.setItem("ss.pub", "1");
    },
    { seed, pub: PUB },
  );
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  // 플립북이 끝나 버튼이 나타난 뒤에 누른다(그 전에 누르면 배포본에서는 넘어가지 않는 일이 있었다)
  await page.waitForSelector(".splash-foot.done", { timeout: 25000, state: "attached" });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
  });
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(1100);
  return { ctx, page };
}

// 탭바는 "탭바를 가진 맨 위 화면"에서 찾는다. 로그인 설정이 있는 배포본은 비로그인으로 마이 탭을 열면
// 로그인 화면이 위에 얹혀서, 보이는 화면(.screen.active)에는 탭바가 없다.
const labels = (page) =>
  page.evaluate(() => {
    const host = [...document.querySelectorAll(".screen")].reverse().find((s) => s.querySelector(".gnav"));
    return host ? [...host.querySelectorAll(".gnav-tx")].map((e) => e.textContent) : [];
  });
const tapTab = async (page, label) => {
  await page.evaluate((label) => {
    const host = [...document.querySelectorAll(".screen")].reverse().find((s) => s.querySelector(".gnav"));
    [...(host?.querySelectorAll(".gnav-item") ?? [])].find((b) => b.querySelector(".gnav-tx")?.textContent === label)?.click();
  }, label);
  await page.waitForTimeout(700);
};

// ── 폰(390×760, 터치 기기) ──
{
  const { ctx, page } = await open(
    { viewport: { width: 390, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    SEED,
  );
  const tabs = await labels(page);
  console.log(`폰 탭 구성(${tabs.length}개): ${tabs.join(" · ")}`);
  await page.screenshot({ path: file("phone") });
  for (const t of tabs.filter((t) => t !== "학습")) {
    await tapTab(page, t);
    const here = await labels(page);
    const same = here.join() === tabs.join();
    console.log(`  ${t} 탭: ${here.join(" · ")}${same ? "" : "  (학습 탭과 다름!)"}`);
    if (!same) errors += 1;
    if (t === "과목") await page.screenshot({ path: file("phone-hub") });
    else {
      const bar = await page.$(".screen.active .gnav");
      if (bar) await bar.screenshot({ path: file(`phone-${t}`) });
      else console.log(`    (${t} 탭 위에 다른 화면이 얹혀 탭바 캡처는 건너뜀)`);
    }
    await tapTab(page, "학습");
  }
  // 탭 칸 너비가 고른지(탭 수가 달라져도 균등 분할이어야 한다)
  const widths = await page.evaluate(() =>
    [...document.querySelectorAll(".screen.active .gnav-item")].map((b) => Math.round(b.getBoundingClientRect().width)),
  );
  const even = widths.length > 0 && Math.max(...widths) - Math.min(...widths) <= 1;
  console.log(`  탭 칸 너비: ${widths.join(", ")}px ${even ? "(고름)" : "(고르지 않음!)"}`);
  if (!even) errors += 1;
  await ctx.close();
}

// ── 넓은 화면(1440×900, 데스크톱 셸 옵트인) ──
{
  const { ctx, page } = await open({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, { ...SEED, desktopMode: true });
  const tabs = await labels(page);
  console.log(`넓은 화면 사이드바(${tabs.length}개): ${tabs.join(" · ")}`);
  await page.screenshot({ path: file("desktop") });
  await ctx.close();
}

await browser.close();
console.log(errors ? `\n탭바 눈검수: 문제 ${errors}건` : `\n탭바 눈검수: 캡처 완료(${OUT})`);
process.exit(errors ? 1 : 0);
