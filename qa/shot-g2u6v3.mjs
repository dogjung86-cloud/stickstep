// 중2 Ⅵ v3 — 눈검수 스크린샷(주요 화면 14장 → qa/shots/g2u6v3-*.png).
// 헤드리스 실크로뮴이 확정 경로(프리뷰 하니스 캡처 프리즈 무관).
//   PORT=5437 node qa/shot-g2u6v3.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  sessionStorage.setItem("ss.g2u6v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
const still = () => page.evaluate(() => document.getAnimations().forEach((a) => { try { a.cancel(); } catch { /* */ } }));
const W = (ms) => page.waitForTimeout(ms);

const open = (i) =>
  page.evaluate(async (idx) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { G2_UNIT6_V3 } = await import("/src/content/g2/unit6v3.ts");
    nav.go(createLessonPlayer(G2_UNIT6_V3.lessons[idx], { onExit: () => {}, onComplete: () => {} }));
  }, i);
const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(460); };
const clickSel = async (sel) => { await page.evaluate((s) => { document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ sel, i }) => { document.querySelectorAll(`.screen.active ${sel}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { sel, i }); };
const pick = async (scope, text) => {
  await page.evaluate(({ scope, text }) => {
    [...document.querySelectorAll(`.screen.active ${scope} .hook-choice`)].filter((b) => !b.disabled).find((b) => b.textContent.includes(text))?.click();
  }, { scope, text });
  await W(450);
};
const shot = async (name) => { await still(); await page.screenshot({ path: `qa/shots/g2u6v3-${name}.png`, fullPage: false }); console.log("SHOT", name); };
const scrollTop = () => page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));

// 1) L1 훅(체성분 스캔 완료)
await open(0); await W(900);
await clickSel(".hb3-bs"); await W(1900);
await scrollTop(); await W(250);
await shot("l1-hook-bodyscan");
// 2) L1 색 단서 수사(아이오딘 청람)
await pick("", "물 — 몸의");
await cta(); await cta();
// binSort 건너뛰기(자유 모드 아님 — 실제 분류)
for (let i = 0; i < 24; i++) {
  const t = await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.textContent?.trim() ?? null);
  if (!t) break;
  const bi = ["탄수화물", "단백질", "지방"].some((k) => t.includes(k)) ? 0 : 1;
  await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.click());
  await W(120);
  await page.evaluate((b) => document.querySelectorAll(".screen.active .bin")[b]?.click(), bi);
  await W(130);
}
await cta(); await W(300);
await page.evaluate(() => { const sheet = [...document.querySelectorAll(".sheet")].find((s) => s.className.includes("open")); [...(sheet?.querySelectorAll("button") ?? [])].pop()?.click(); });
await W(500); await cta();
await clickNth(".clu-btn", 0); await W(1700);
await scrollTop(); await W(250);
await shot("l1-colorclue-iodine");
// 3) L1 recap 자세히
await pick(".clu-q", "녹말이 많은"); await W(1700);
await clickNth(".clu-btn", 2); await W(1700);
await pick(".clu-q", "단백질"); await W(1700);
await clickNth(".clu-btn", 1); await W(1100);
await clickSel(".clu-heat"); await W(2500);
await pick(".clu-q", "뜨거운 물에"); await W(600);
await cta();
await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card, .screen.active .recap-card")[0]?.click());
await W(450);
await shot("l1-recap-more");

// 4) L2 침 레이스(아이오딘 결과 갈라짐)
await open(1); await W(800);
await clickSel(".hb3-dp"); await W(1500);
await pick("", "훨씬 커서");
await cta(); await cta();
await clickNth(".slr-btn", 0); await W(2100);
await clickNth(".slr-btn", 1); await W(2700);
await scrollTop(); await W(250);
await shot("l2-saliva-iodine");
// 5) L2 소화계 모식도 concept
await pick(".slr-q", "다른 물질로 바꿔"); await W(1700);
await clickNth(".slr-btn", 2); await W(3400);
await pick(".slr-q", "엿당 같은 당분"); await W(1900);
await pick(".slr-q", "몸속 온도"); await W(600);
await cta();
await scrollTop(); await W(300);
await shot("l2-concept-digestmap");
// 6) L2 소화 여행(단백질 위 정거장)
await cta();
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .ftp-nut")].find((b) => b.textContent.includes("단백질"))?.click(); });
await W(500);
await clickSel(".ftp-go"); await W(1150);
await clickSel(".ftp-go"); await W(900);
await scrollTop(); await W(250);
await shot("l2-foodtrip-stomach");

// 7) L3 하비 만화 첫 컷
await open(2); await W(900);
await shot("l3-comic-harvey");
// 8) L3 심장 펌프장(수축)
for (let i = 0; i < 7; i++) await cta();
await cta();
await clickNth(".hpp-seg", 0); await W(600);
await clickNth(".hpp-seg", 1); await W(900);
await scrollTop(); await W(250);
await shot("l3-heartpump-sys");
// 9) L3 두 바퀴(온몸 도착·암적 전환)
await W(1400);
await clickSel(".hpp-rev"); await W(2600);
await pick(".hpp-q", "판막이 거꾸로"); await W(600);
await cta(); await cta();
await page.evaluate(() => { [...document.querySelectorAll(".screen.active .tlp-choice")].find((b) => b.textContent.includes("대동맥으로"))?.click(); });
await W(2200);
await scrollTop(); await W(250);
await shot("l3-twoloops-body");

// 10) L4 호흡운동 모형(막 당김·풍선 부풂)
await open(3); await W(800);
await clickSel(".hb3-hc"); await W(1400);
await pick("", "근육 막");
await cta(); await cta();
await page.evaluate(() => {
  const sl = document.querySelector(".screen.active .cms-slider");
  sl.value = "100";
  sl.dispatchEvent(new Event("input", { bubbles: true }));
});
await W(600);
await scrollTop(); await W(250);
await shot("l4-chestmodel-inhale");
// 11) L4 기체 교환 concept
await page.evaluate(() => {
  const sl = document.querySelector(".screen.active .cms-slider");
  sl.value = "0";
  sl.dispatchEvent(new Event("input", { bubbles: true }));
});
await W(1900);
for (let i = 0; i < 4; i++) { await clickNth(".cms-part", i); await W(320); }
await W(1100);
await pick(".cms-q", "압력이 낮아지자"); await W(600);
await cta();
await scrollTop(); await W(300);
await shot("l4-concept-gasexchange");

// 12) L5 콩팥 정수장(여과 직후)
await open(4); await W(800);
await clickSel(".hb3-pt"); await W(1600);
await pick("", "혈액을 걸러");
await cta(); await cta(); await cta();
await clickNth(".kfl-btn", 0); await W(2600);
await scrollTop(); await W(250);
await shot("l5-kidney-filtered");

// 13) L6 주문서(트럭 배달 중)
await open(5); await W(800);
await clickSel(".hb3-wm"); await W(1500);
await pick("", "영양소를 분해");
await cta(); await cta();
await page.evaluate(() => { document.querySelector('.screen.active .btm-st[data-organ="dig"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
await W(1300);
await scrollTop(); await W(250);
await shot("l6-bodyteam-truck");
// 14) L6 recap 통합 모식도(note)
await W(1600);
for (const o of ["resp", "resp", "excr"]) {
  await page.evaluate((k) => { document.querySelector(`.screen.active .btm-st[data-organ="${k}"]`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, o);
  await W(2700);
}
await W(1500);
await pick(".btm-q", "순환계"); await W(600);
await cta();
await page.evaluate(() => { const sc = document.querySelector(".screen.active .scroll"); sc?.scrollTo(0, sc.scrollHeight); });
await W(400);
await shot("l6-recap-teamfig");

console.log("DONE");
await browser.close();
