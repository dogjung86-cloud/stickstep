// g2u5 v3 — "실사용 경로" 검사: 스플래시 부팅 → 지도 → 레슨 진입, 전 조작을 trusted click으로.
// 사용자 보고 3건(초록 추적 질문·증거1·증거2)을 포함해 6레슨의 판정 질문 가시성을 게이트로 검사.
//   PORT=5433 node qa/check-g2u5v3-real.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5433";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });

let PASS = 0, FAIL = 0, pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("  PAGEERROR:", e.message); });
const ok = (cond, label) => { if (cond) { PASS++; console.log("  ✓", label); } else { FAIL++; console.log("  ✗", label); } };
const A = ".screen.active";
const W = (ms) => page.waitForTimeout(ms);

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    lastUnits: { "sci:g2": "g2u5" },
  }));
  sessionStorage.setItem("ss.g2u5v3", "1");
});

/** 스플래시 → 둘러보기 → 홈(실경로 부팅). */
async function boot() {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#sc-splash", { timeout: 8000 });
  await W(500);
  await page.mouse.click(210, 300); // 플립북 스킵 탭
  const browse = page.locator("button", { hasText: "한번 둘러보기" }).first();
  await browse.waitFor({ state: "visible", timeout: 8000 });
  await browse.click();
  await page.waitForSelector("#sc-home", { timeout: 8000 });
  await W(700);
}

/** 지도에서 i번째 레슨 노드 진입(검토 모드 = 전부 해제). */
async function openLesson(i) {
  await boot();
  const nodes = page.locator("#sc-home .gm-node:not(.exam)");
  await nodes.nth(i).waitFor({ state: "visible", timeout: 8000 });
  await nodes.nth(i).click();
  await W(900);
}

/** CTA(활성)나 자유 모드 앞 화살표로 다음 스텝 — 실사용자의 전진 경로. */
async function next() {
  const adv = await page.evaluate(() => {
    const cta = document.querySelector(".screen.active .btn.cta");
    if (cta && !cta.disabled && cta.offsetParent !== null) return "cta";
    const fwd = document.querySelector(".screen.active .xbtn.fwd");
    if (fwd && fwd.offsetParent !== null) return "fwd";
    return "none";
  });
  if (adv === "cta") await page.locator(`${A} .btn.cta`).click();
  else if (adv === "fwd") await page.locator(`${A} .xbtn.fwd`).click();
  await W(520);
  return adv;
}

/** 판정 질문 가시성 게이트 — scope 안 .hook-q가 실제로 화면에 보이는지. */
async function questionVisible(scope, label) {
  try {
    await page.locator(`${A} ${scope} .hook-q`).waitFor({ state: "visible", timeout: 9000 });
    ok(true, `${label} — 질문 표시`);
    return true;
  } catch {
    ok(false, `${label} — 질문 표시 안 됨(사용자 보고 증상)`);
    return false;
  }
}
async function pickVisible(scope, text) {
  const btn = page.locator(`${A} ${scope} .hook-choice`, { hasText: text }).first();
  await btn.waitFor({ state: "visible", timeout: 6000 });
  await btn.click();
  await W(450);
}
const goalsOn = () => page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
const ctaOpen = () => page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return !!b && !b.disabled; });

// ── L1: 훅 없음(만화) → concept → greenHunt 질문 게이트 ──
console.log(`[PORT ${PORT}] L1 greenHunt 질문 게이트`);
try {
  await openLesson(0);
  for (let i = 0; i < 7; i++) await next(); // 만화
  await next(); // concept①
  await page.locator(`${A} .ghz-board`).click(); await W(650);
  await page.locator(`${A} .ghz-board`).click(); await W(1100);
  if (await questionVisible(".ghz-q", "L1 장소 판정")) {
    await pickVisible(".ghz-q", "엽록체");
    ok((await goalsOn()) === 3, "L1 목표 3 점등");
    ok(await ctaOpen(), "L1 랩 CTA 개방");
  }
} catch (e) { ok(false, `L1 진행 실패: ${String(e).slice(0, 80)}`); }

// ── L2: gasCross·starchQuest 질문 게이트 ──
console.log(`[PORT ${PORT}] L2 증거 1·2 게이트`);
try {
  await openLesson(1);
  await page.locator(`${A} .hp3-pd`).click();
  if (await questionVisible("", "L2 훅 예측")) await pickVisible("", "어떤 성분이");
  await next(); await next(); // concept → gasCross
  await page.locator(`${A} .gxc-btn`).click();
  if (await questionVisible(".gxc-q", "L2 증거1 해석")) {
    await pickVisible(".gxc-q", "이산화 탄소를 쓰고");
    await page.locator(`${A} .gxc-btn`).click(); // 전등 끄기
    await W(3600);
    ok((await goalsOn()) === 3, "L2 증거1 목표 3");
    ok(await ctaOpen(), "L2 증거1 CTA 개방");
  }
  await next(); // → starchQuest
  await page.locator(`${A} .stq-tool`).nth(0).click();
  if (await questionVisible(".stq-q", "L2 증거2 암처리 이유")) {
    await pickVisible(".stq-q", "원래 있던 녹말");
    await page.locator(`${A} .stq-tool`).nth(1).click(); await W(2600);
    await page.locator(`${A} .stq-tool`).nth(2).click();
    if (await questionVisible(".stq-q", "L2 증거2 예측")) {
      await pickVisible(".stq-q", "햇빛을 받은 잎만");
      await W(2100);
      ok((await goalsOn()) === 3, "L2 증거2 목표 3");
      ok(await ctaOpen(), "L2 증거2 CTA 개방");
    }
  }
} catch (e) { ok(false, `L2 진행 실패: ${String(e).slice(0, 80)}`); }

// ── L3~L6: 각 랩 질문 게이트 스팟 ──
console.log(`[PORT ${PORT}] L3 곡선 판정`);
try {
  await openLesson(2);
  await page.locator(`${A} .hp3-wb`).click();
  if (await questionVisible("", "L3 훅 예측")) await pickVisible("", "알맞게 맞춰");
  await next(); await next();
  const scrub = async () => {
    const sl = page.locator(`${A} .fct-slider`);
    const box = await sl.boundingBox();
    if (!box) throw new Error("slider box 없음");
    for (let f = 0; f <= 10; f++) {
      await page.mouse.click(box.x + 6 + ((box.width - 12) * f) / 10, box.y + box.height / 2);
      await W(60);
    }
  };
  await scrub(); await W(2700);
  await scrub(); await W(2700);
  await scrub(); await W(1500);
  if (await questionVisible(".fct-q", "L3 요인 판정")) {
    await pickVisible(".fct-q", "온도");
    ok((await goalsOn()) === 3, "L3 목표 3");
  }
} catch (e) { ok(false, `L3 진행 실패: ${String(e).slice(0, 80)}`); }

console.log(`[PORT ${PORT}] L4 항상 판정`);
try {
  await openLesson(3);
  await page.locator(`${A} .hp3-vb`).click();
  if (await questionVisible("", "L4 훅 예측")) await pickVisible("", "숨을 쉬기 때문");
  await next(); await next();
  await page.locator(`${A} .fpe-btn`).click(); await W(1200);
  await page.locator(`${A} .fpe-bolt`).click({ force: true, position: { x: 34, y: 34 } }); await W(700); // force는 안정성 대기만 생략 — 지정 좌표에 실제 히트테스트로 이벤트를 쏜다(반짝 애니 때문)
  await page.locator(`${A} .fpe-seg`).nth(1).click(); await W(500);
  await page.locator(`${A} .fpe-seg`).nth(0).click();
  if (await questionVisible(".fpe-q", "L4 언제 판정")) {
    await pickVisible(".fpe-q", "항상");
    ok((await goalsOn()) === 3, "L4 목표 3");
  }
} catch (e) { ok(false, `L4 진행 실패: ${String(e).slice(0, 80)}`); }

console.log(`[PORT ${PORT}] L5 한밤 판정`);
try {
  await openLesson(4);
  await page.locator(`${A} .hp3-tn`).click();
  if (await questionVisible("", "L5 훅 예측")) await pickVisible("", "숨쉬기로 양분");
  await next(); await next();
  const sl = page.locator(`${A} .sgg-slider`);
  const box = await sl.boundingBox();
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height / 2); await W(500);
  await page.mouse.click(box.x + box.width * 0.96, box.y + box.height / 2); await W(600);
  if (await questionVisible(".sgg-q", "L5 방향 판정")) {
    await pickVisible(".sgg-q", "산소를 흡수");
    ok((await goalsOn()) === 3, "L5 목표 3");
  }
} catch (e) { ok(false, `L5 진행 실패: ${String(e).slice(0, 80)}`); }

console.log(`[PORT ${PORT}] L6 방향 판정·배송`);
try {
  await openLesson(5);
  await page.locator(`${A} .hp3-sp`).click();
  if (await questionVisible("", "L6 훅 예측")) await pickVisible("", "차곡차곡");
  await next(); await next();
  await page.locator(`${A} .sfr-btn`).click();
  if (await questionVisible(".sfr-q", "L6 방향 판정")) {
    await pickVisible(".sfr-q", "위로도 아래로도");
    for (let i = 0; i < 3; i++) { await page.locator(`${A} .sfr-ship`).nth(i).click(); await W(2500); }
    ok((await goalsOn()) === 3, "L6 목표 3");
  }
} catch (e) { ok(false, `L6 진행 실패: ${String(e).slice(0, 80)}`); }

console.log(`\n[PORT ${PORT}] RESULT: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(0);
