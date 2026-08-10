// 콩팥 정수장(라스터 무대 개편)·세포의 주문서(도로 링) 실플레이 눈검수 샷.
//   PORT=5437 node qa/shot-b6labs.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5437";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  sessionStorage.setItem("ss.g2u6v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);

const W = (ms) => page.waitForTimeout(ms);
const openLesson = (idx) =>
  page.evaluate(async (i) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { G2_UNIT6_V3 } = await import("/src/content/g2/unit6v3.ts");
    nav.go(createLessonPlayer(G2_UNIT6_V3.lessons[i], { onExit: () => {}, onComplete: () => {} }));
  }, idx);
const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(520); };
const clickSel = async (sel) => { await page.evaluate((s) => { const n = document.querySelector(`.screen.active ${s}`); n?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ sel, i }) => { const n = document.querySelectorAll(`.screen.active ${sel}`)[i]; n?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { sel, i }); };
const pickChoice = async (scope, text, tries = 18) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate(({ scope, text }) => {
      const btns = [...document.querySelectorAll(`.screen.active ${scope} .hook-choice`)].filter((b) => !b.disabled && b.offsetParent !== null);
      const b = btns.find((x) => x.textContent.includes(text));
      if (b) { b.click(); return true; }
      return false;
    }, { scope, text });
    if (done) { await W(440); return true; }
    await W(300);
  }
  return false;
};
const shotBoard = async (cls, path) => {
  const el = await page.$(`.screen.active ${cls}`);
  if (el) await el.screenshot({ path });
  else await page.screenshot({ path, fullPage: false });
  console.log("SHOT", path);
};

// ── L3 심장 펌프장(재작도 무대 — 4국면) ──
await openLesson(2);
await W(700);
for (let i = 0; i < 7; i++) await cta(); // 만화 7컷
await cta(); // concept(심장 구조) → heartPumpLab
await W(600);
await shotBoard(".hpp-board", "qa/shots/b6lab-hpp-0-start.png");
await clickNth(".hpp-seg", 0); // 이완
await W(1350);
await shotBoard(".hpp-board", "qa/shots/b6lab-hpp-1-dia.png");
await clickNth(".hpp-seg", 1); // 수축
await W(700); // 분출 중간(공이 동맥 통로를 지나는 순간)
await shotBoard(".hpp-board", "qa/shots/b6lab-hpp-2-sys.png");
await W(1500);
await clickSel(".hpp-rev"); // 거꾸로 밀기
await W(900); // 되튕김 + X 표시 순간
await shotBoard(".hpp-board", "qa/shots/b6lab-hpp-3-rev.png");

// ── L5 콩팥 정수장 ──
await openLesson(4);
await W(700);
await clickSel(".hb3-pt");
await pickChoice("", "혈액을 걸러");
await cta(); // concept①
await cta(); // concept②
await cta(); // kidneyFilterLab
await W(600);
await shotBoard(".kfl-board", "qa/shots/b6lab-kfl-0-start.png");
await clickNth(".kfl-btn", 0);
await W(1400);
await shotBoard(".kfl-board", "qa/shots/b6lab-kfl-1-fil.png");
await pickChoice(".kfl-q", "크기가 커서");
await W(1700);
await clickNth(".kfl-btn", 1);
await W(1400);
await shotBoard(".kfl-board", "qa/shots/b6lab-kfl-2-re.png");
await pickChoice(".kfl-q", "전부 재흡수되어서");
await W(1700);
await clickNth(".kfl-btn", 2);
await W(1500);
await shotBoard(".kfl-board", "qa/shots/b6lab-kfl-3-sec.png");

// ── L6 세포의 주문서 ──
await openLesson(5);
await W(700);
await clickSel(".hb3-wm");
await pickChoice("", "영양소를 분해");
await cta(); // concept①
await cta(); // bodyTeamLab
await W(600);
await shotBoard(".btm-board", "qa/shots/b6lab-btm-0-start.png");
await page.evaluate(() => {
  const st = document.querySelector('.screen.active .btm-st[data-organ="dig"]');
  st?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await W(1100); // 트럭이 소화계 정거장에 도착한 순간
await shotBoard(".btm-board", "qa/shots/b6lab-btm-1-pick.png");
await browser.close();
