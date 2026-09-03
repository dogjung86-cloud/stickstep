// 중1 Ⅳ v3 — 눈검수 스크린샷(주요 화면 18장 → qa/shots/u4v3-*.png).
// 검수 항목: 텍스트 겹침·켜진 목표 칩 색(물질 톤 틴트)·방향(병 눕힘·물 수평·병 부풂)·곡선·글자 12px 이상.
//   PORT=5463 node qa/shot-u4v3.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5463";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  sessionStorage.setItem("ss.u4v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
const still = () => page.evaluate(() => document.getAnimations().forEach((a) => { try { a.cancel(); } catch { /* */ } }));
const W = (ms) => page.waitForTimeout(ms);

const open = (i) =>
  page.evaluate(async (idx) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { UNIT4_V3 } = await import("/src/content/unit4v3.ts");
    nav.go(createLessonPlayer(UNIT4_V3.lessons[idx], { onExit: () => {}, onComplete: () => {} }));
  }, i);
const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(460); };
const clickSel = async (sel) => { await page.evaluate((s) => { document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ s, i }) => { document.querySelectorAll(`.screen.active ${s}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { s: sel, i }); };
const pick = async (scope, text, tries = 40) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate(({ scope, text }) => {
      const b = [...document.querySelectorAll(`.screen.active ${scope} .hook-choice`)].filter((b) => !b.disabled && b.offsetParent !== null).find((b) => b.textContent.includes(text));
      if (b) { b.click(); return true; }
      return false;
    }, { scope, text });
    if (done) { await W(450); return true; }
    await W(300);
  }
  return false;
};
const clickWhenEnabled = async (sel, tries = 60) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate((s) => { const b = document.querySelector(`.screen.active ${s}`); if (b && !b.disabled) { b.dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; } return false; }, sel);
    if (done) { await W(200); return true; }
    await W(300);
  }
  return false;
};
const shot = async (name, keepAnim = false) => { if (!keepAnim) await still(); await page.screenshot({ path: `qa/shots/u4v3-${name}.png`, fullPage: false }); console.log("SHOT", name); };
const scrollTop = () => page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));
const scrollTo = (sel) => page.evaluate((s) => document.querySelector(`.screen.active ${s}`)?.scrollIntoView({ block: "start" }), sel);

// L1
await open(0); await W(900);
for (let i = 0; i < 3; i++) { await clickSel(".hk4-bl"); await W(650); }
await W(700); await scrollTop(); await W(200);
await shot("l1-hook-bakerylane", true);
await pick("", "스스로 움직여"); await cta();
await scrollTop(); await W(300);
await shot("l1-concept-diffuse");
await cta();
await clickSel(".ink-btn"); await W(4700);
await scrollTop(); await W(200);
await shot("l1-inklab-spread", true);
await clickWhenEnabled(".ink-btn"); await W(300); await clickSel(".ink-btn"); await W(4200);
await scrollTop(); await W(200);
await shot("l1-inklab-vinegar", true);
await pick(".ink-q", "스스로 끊임없이"); await cta(); await cta();
await clickSel(".esl-btn"); await W(400); await clickSel(".esl-btn"); await W(4300);
await scrollTop(); await W(200);
await shot("l1-evaplab", true);
await pick(".esl-q", "표면의 입자"); await cta(); await W(300);
await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card, .screen.active .recap-card")[0]?.click());
await W(450);
await shot("l1-recap-more");

// L2
await open(1); await W(900);
await clickSel(".hk4-tb"); await W(1600);
await scrollTop(); await W(200);
await shot("l2-hook-tilted", true);
await pick("", "배열과 움직임"); await cta();
await scrollTop(); await W(300);
await shot("l2-concept-states");
await cta(); await W(600);
await clickNth(".m3s-state", 2); await W(1800);
await scrollTop(); await W(200);
await shot("l2-stateslab-gas", true);
await clickNth(".m3s-state", 1); await W(300); await clickNth(".m3s-vessel", 1); await W(2200);
await scrollTop(); await W(200);
await shot("l2-stateslab-box", true);

// L3
await open(2); await W(900);
await shot("l3-comic");
for (let i = 0; i < 7; i++) await cta();
await scrollTop(); await W(300);
await shot("l3-concept-phases");
await cta();
await clickSel(".wgl-btn"); await W(4800);
await scrollTop(); await W(200);
await shot("l3-watchglass", true);
await pick(".wgl-q", "수증기가 차가운 접시"); await clickWhenEnabled(".wgl-btn"); await W(2600);
await pick(".wgl-q", "성질은 변하지 않는다"); await cta();
await clickSel(".dil-btn"); await clickWhenEnabled(".dil-btn"); await W(4300);
await scrollTop(); await W(200);
await shot("l3-dryice-bulge", true);

// L4
await open(3); await W(900);
await clickSel(".hk4-fb"); await W(3600);
await scrollTop(); await W(200);
await shot("l4-hook-frozen", true);
await pick("", "그대로 500"); await cta();
await clickSel(".ofl-btn"); await W(4600);
await scrollTop(); await W(200);
await shot("l4-olive-frozen", true);
await clickWhenEnabled(".ofl-btn"); await pick(".ofl-q", "그대로 12.60"); await pick(".ofl-q", "가까워지고 규칙적"); await cta();
await clickSel(".abl-btn"); await W(4800);
await scrollTop(); await W(200);
await shot("l4-acetone-inflated", true);
await pick(".abl-q", "거리가 크게 멀어져"); await pick(".abl-q", "종류도 개수도 그대로"); await cta();
await scrollTop(); await W(300);
await shot("l4-concept-arrange");

// L5
await open(4); await W(900);
for (let i = 0; i < 3; i++) { await clickSel(".hk4-iw"); await W(750); }
await W(900); await scrollTop(); await W(200);
await shot("l5-hook-icewatch", true);
await pick("", "모두 쓰여서"); await cta(); await cta(); await W(500);
await clickSel(".mbl-btn"); await W(12600);
await scrollTop(); await W(200);
await shot("l5-meltboil-curve", true);

// L6
await open(5); await W(900);
for (let i = 0; i < 7; i++) await cta();
await scrollTop(); await W(300);
await shot("l6-concept-release");
await cta();
await clickSel(".frz-btn"); await W(9200);
await scrollTop(); await W(200);
await shot("l6-freeze-curve", true);
await pick(".frz-q", "일정하게 유지"); await pick(".frz-q", "방출하기 때문"); await cta();
await pick(".stl-q", "낮아진다"); await W(1500);
await scrollTop(); await W(200);
await shot("l6-surround-spray", true);
await clickWhenEnabled(".stl-btn"); await pick(".stl-q", "높아진다"); await W(1500);
await scrollTop(); await W(200);
await shot("l6-surround-paraffin", true);

console.log("DONE");
await browser.close();
