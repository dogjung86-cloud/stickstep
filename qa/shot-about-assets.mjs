// 부모용 소개 페이지(public/about.html) 실화면 에셋 캡처 — 지도·랩·퀴즈·3D 4샷.
// PORT=<dev포트> node qa/shot-about-assets.mjs → qa/shots/about-*.png + public/about/*.webp(640w)
// webp 변환은 process-geo.mjs 문법(헤드리스 크롬 캔버스 — sharp 불요).
// 일반 사용자가 보는 화면으로 찍는다(sessionStorage "ss.pub"="1"). dev 기본은 전 과목이 열려 있어
// 소개 페이지에 일반 사용자에게는 없는 과목 탭까지 찍힌다(2026-11-11 과목 탭 닫기 때 바로잡음).
// 일부만 다시 찍으려면 ONLY=map처럼 준다(쉼표로 여럿: map,lab,quiz,space). 나머지 파일은 건드리지 않는다.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
const ONLY = (process.env.ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const want = (name) => ONLY.length === 0 || ONLY.includes(name);
fs.mkdirSync("qa/shots", { recursive: true });
fs.mkdirSync("public/about", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

async function boot(page) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(210, 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(900);
}

function seedCtx(extra) {
  return {
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: false, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null,
    totalXp: 340, lifeXp: 340, minigame: {}, ...extra,
  };
}

async function newSeeded(extra) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  // 정본 스텁(e2e-soc7) — updateStyle은 반드시 실구현 유지(no-op이면 dev CSS가 통째로 죽는다)
  await page.route("**/@vite/client", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
    }),
  );
  await page.addInitScript((seed) => {
    localStorage.setItem("science-app.v1", JSON.stringify(seed));
    sessionStorage.setItem("ss.pub", "1"); // 일반 사용자 시점(과학만 공개, 과목 탭 없음)
  }, seedCtx(extra));
  return page;
}

/** 자유 모드 앞으로 가기(.xbtn.fwd)를 조건 충족까지 반복 — 못 찾으면 false. */
async function fwdUntil(page, cond, cap = 10, settle = 900) {
  for (let i = 0; i < cap; i++) {
    if (await page.evaluate(cond)) return true;
    const moved = await page.evaluate(() => {
      const b = document.querySelector(".xbtn.fwd");
      if (!b || b.style.visibility === "hidden") return false;
      b.click();
      return true;
    });
    if (!moved) return false;
    await page.waitForTimeout(settle);
  }
  return await page.evaluate(cond);
}

const done = { done: true, acc: 1, xp: 120 };
const shots = [];

// ── 1·2·3: 열 단원(u3) — 지도 → u3l1 랩(다크 무대) → 퀴즈 채점 시트 ──
if (want("map") || want("lab") || want("quiz")) {
  const page = await newSeeded({ lessons: { u3l1: done, u3l2: done }, lastUnits: { "sci:g1": "u3" }, recentUnitId: "u3" });
  await boot(page);
  if (want("map")) {
    await page.screenshot({ path: "qa/shots/about-map.png" });
    shots.push("about-map");
  }

  if (want("lab") || want("quiz")) {
    await page.evaluate(() => document.querySelectorAll(".gm-node:not(.exam)")[0].click());
    await page.waitForSelector(".lheader", { timeout: 10000 });
    await page.waitForTimeout(1200);
    const labOk = await fwdUntil(page, () => !!document.querySelector(".stage canvas"));
    if (!labOk) console.log("lab 스텝 미도달, 건너뜀");
    else if (want("lab")) {
      await page.waitForTimeout(1400); // 입자 애니 정착
      await page.screenshot({ path: "qa/shots/about-lab.png" });
      shots.push("about-lab");
    }

    const quizOk = await fwdUntil(page, () => !!document.querySelector(".opts .opt"), 12, 700);
    if (!quizOk) console.log("quiz 스텝 미도달, 건너뜀");
    else if (want("quiz")) {
      await page.evaluate(() => (document.querySelector('.opts .opt[data-oi="0"]') ?? document.querySelector(".opts .opt")).click());
      await page.waitForTimeout(400);
      await page.evaluate(() => { const b = document.querySelector("button.cta"); if (b && !b.disabled) b.click(); });
      await page.waitForTimeout(900);
      await page.screenshot({ path: "qa/shots/about-quiz.png" });
      shots.push("about-quiz");
    }
  }
  await page.close();
}

// ── 4: 태양계(u7) — 3D 랩 ──
if (want("space")) {
  const page = await newSeeded({ lessons: { u7l1: done }, lastUnits: { "sci:g1": "u7" }, recentUnitId: "u7" });
  await boot(page);
  await page.evaluate(() => document.querySelectorAll(".gm-node:not(.exam)")[0].click());
  await page.waitForSelector(".lheader", { timeout: 10000 });
  await page.waitForTimeout(1200);
  const ok = await fwdUntil(page, () => !!document.querySelector(".stage canvas, canvas"), 10, 1100);
  if (ok) {
    await page.waitForTimeout(2600); // three.js 텍스처 로드
    await page.screenshot({ path: "qa/shots/about-space.png" });
    shots.push("about-space");
  } else console.log("space 캔버스 미도달 — 건너뜀");
  await page.close();
}

// ── webp 변환(640w, q0.86) — process-geo.mjs의 캔버스 문법 ──
const conv = await browser.newPage();
for (const name of shots) {
  const b64 = fs.readFileSync(`qa/shots/${name}.png`).toString("base64");
  const out = await conv.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = `data:image/png;base64,${b64}`; });
    const w = 640, h = Math.round((img.height / img.width) * w);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/webp", 0.86).split(",")[1];
  }, b64);
  const file = `public/about/${name.replace("about-", "")}.webp`;
  fs.writeFileSync(file, Buffer.from(out, "base64"));
  console.log(`saved ${file} (${Math.round(fs.statSync(file).size / 1024)}KB)`);
}
await browser.close();
console.log(`done — ${shots.length}샷`);
