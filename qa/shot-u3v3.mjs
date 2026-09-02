// 중1 Ⅲ v3 — 눈검수 스크린샷(주요 화면 14장 → qa/shots/u3v3-*.png).
//   PORT=5453 node qa/shot-u3v3.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  sessionStorage.setItem("ss.u3v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
const still = () => page.evaluate(() => document.getAnimations().forEach((a) => { try { a.cancel(); } catch { /* */ } }));
const W = (ms) => page.waitForTimeout(ms);

const open = (i) =>
  page.evaluate(async (idx) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { UNIT3_V3 } = await import("/src/content/unit3v3.ts");
    nav.go(createLessonPlayer(UNIT3_V3.lessons[idx], { onExit: () => {}, onComplete: () => {} }));
  }, i);
const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(460); };
const clickSel = async (sel) => { await page.evaluate((s) => { document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ s, i }) => { document.querySelectorAll(`.screen.active ${s}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { s: sel, i }); };
const pick = async (scope, text) => {
  await page.evaluate(({ scope, text }) => {
    [...document.querySelectorAll(`.screen.active ${scope} .hook-choice`)].filter((b) => !b.disabled).find((b) => b.textContent.includes(text))?.click();
  }, { scope, text });
  await W(450);
};
const setSlider = async (sel, v) => {
  await page.evaluate(({ s, v }) => { const sl = document.querySelector(`.screen.active ${s}`); if (!sl) return; sl.value = String(v); sl.dispatchEvent(new Event("input", { bubbles: true })); }, { s: sel, v });
  await W(150);
};
const shot = async (name, keepAnim = false) => { if (!keepAnim) await still(); await page.screenshot({ path: `qa/shots/u3v3-${name}.png`, fullPage: false }); console.log("SHOT", name); };
const scrollTop = () => page.evaluate(() => document.querySelector(".screen.active .scroll")?.scrollTo(0, 0));

// L1
await open(0); await W(900);
for (let i = 0; i < 3; i++) { await clickSel(".hk3-rh"); await W(450); }
await W(600); await scrollTop(); await W(200);
await shot("l1-hook-rubhands");
await pick("", "입자들의 움직임"); await cta();
await scrollTop(); await W(300);
await shot("l1-concept");
await cta();
await setSlider(".pdl-slider", 90); await W(500);
await scrollTop(); await W(200);
await shot("l1-particledial-hot", true);
await cta(); await W(300);
await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card, .screen.active .recap-card")[0]?.click());
await W(450);
await shot("l1-recap-more");

// L2
await open(1); await W(900);
await clickSel(".hk3-bt"); await W(4000);
await scrollTop(); await W(200);
await shot("l2-hook-beep");
await pick("", "같아졌다"); await cta(); await cta();
await clickSel(".cgl-btn"); await W(6600);
await scrollTop(); await W(200);
await shot("l2-contactgraph", true);

// L3
await open(2); await W(900);
await shot("l3-comic");
for (let i = 0; i < 7; i++) await cta();
await scrollTop(); await W(300);
await shot("l3-concept-conduct");
await cta();
await clickSel(".rrl-btn"); await W(5600);
await scrollTop(); await W(200);
await shot("l3-rodrace", true);
await pick(".rrl-q", "구리"); await W(1500); await pick(".rrl-q", "제자리에서"); await cta(); await cta();
await clickNth(".apl-choice", 1); await W(1600);
await scrollTop(); await W(200);
await shot("l3-acplace-heater", true);
await W(2200); await clickNth(".apl-choice", 0); await W(1600);
await scrollTop(); await W(200);
await shot("l3-acplace-ac", true);

// L4
await open(3); await W(900);
await clickNth(".hk3-btn", 0); await W(500); await clickNth(".hk3-btn", 1); await W(1000);
await scrollTop(); await W(200);
await shot("l4-hook-hotsand");
await pick("", "잘 변하지 않는"); await cta();
await clickSel(".hrl-btn"); await W(5400);
await scrollTop(); await W(200);
await shot("l4-heatrace", true);
await pick(".hrl-q", "식용유"); await W(400); await clickSel(".hrl-btn"); await W(5000); await pick(".hrl-q", "물"); await cta();
await scrollTop(); await W(300);
await shot("l4-concept-bars");

// L5
await open(4); await W(900);
await clickSel(".hk3-lw"); await W(1400);
await scrollTop(); await W(200);
await shot("l5-hook-livingwall");
await pick("", "늘어나기 때문"); await cta(); await cta();
await clickNth(".seg button", 1); await W(400);
await shot("l5-figtabs-flask");
await cta(); await W(800);
await pick(".bml-q", "종이 쪽으로"); await clickSel(".bml-btn"); await W(1800);
await scrollTop(); await W(200);
await shot("l5-bimetal-tape", true);
await W(1800); await clickSel(".bml-btn"); await W(1300);
await scrollTop(); await W(200);
await shot("l5-bimetal-hot", true);

console.log("DONE");
await browser.close();
