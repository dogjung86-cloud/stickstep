// 중1 Ⅳ v3 — "실사용 경로" 검사: 스플래시 부팅 → 지도 → 레슨 노드 진입(trusted click).
// ① 토글 없이 = 현행 unit4(구판 훅 .hook-meal) ② ss.u4v3=1 = v3(훅 .hk4-bl)가 지도에서 열리는지,
// ③ v3 L1·L2·L4 훅 예측과 L1 랩 b4Ask 판정 질문 가시성(.hook-q visible) 게이트.
//   PORT=5463 node qa/check-u4v3-real.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5463";
const browser = await chromium.launch({ channel: "chrome", headless: true });
let PASS = 0, FAIL = 0, pageErrors = 0;
const ok = (cond, label) => { if (cond) { PASS++; console.log("  ✓", label); } else { FAIL++; console.log("  ✗", label); } };
const A = ".screen.active";

async function newPage(v3) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => { pageErrors++; console.log("  PAGEERROR:", e.message); });
  await page.addInitScript((on) => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
      lastUnits: { "sci:g1": "u4" },
    }));
    if (on) sessionStorage.setItem("ss.u4v3", "1");
  }, v3);
  return page;
}
const W = (page, ms) => page.waitForTimeout(ms);

async function boot(page) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#sc-splash", { timeout: 8000 });
  await W(page, 500);
  await page.mouse.click(210, 300);
  const browse = page.locator("button", { hasText: "한번 둘러보기" }).first();
  await browse.waitFor({ state: "visible", timeout: 8000 });
  await browse.click();
  await page.waitForSelector("#sc-home", { timeout: 8000 });
  await W(page, 700);
}
async function openNode(page, i) {
  const nodes = page.locator("#sc-home .gm-node:not(.exam)");
  await nodes.nth(i).waitFor({ state: "visible", timeout: 8000 });
  await nodes.nth(i).click();
  await W(page, 900);
}
async function questionVisible(page, scope, label) {
  try {
    await page.locator(`${A} ${scope} .hook-q`).waitFor({ state: "visible", timeout: 9000 });
    ok(true, `${label} 질문 표시`);
    return true;
  } catch {
    ok(false, `${label} 질문 표시 안 됨`);
    return false;
  }
}

// ① 토글 없음 → 구판
console.log(`[PORT ${PORT}] 토글 없음 = 현행 unit4`);
{
  const page = await newPage(false);
  try {
    await boot(page);
    const band = await page.evaluate(() => document.querySelector("#sc-home .unit-band")?.textContent ?? "");
    ok(band.length > 0, `단원 밴드 렌더(${band.slice(0, 20).trim()})`);
    await openNode(page, 0);
    const oldHook = await page.evaluate(() => !!document.querySelector(".screen.active .hook-meal"));
    const newHook = await page.evaluate(() => !!document.querySelector(".screen.active .hk4-bl"));
    ok(oldHook && !newHook, "구판 L1 훅(.hook-meal) 렌더, v3 훅 없음");
  } catch (e) { ok(false, `구판 경로 실패: ${String(e).slice(0, 90)}`); }
  await page.close();
}

// ② 토글 = v3 L1·L2·L4 실경로
console.log(`[PORT ${PORT}] ss.u4v3=1 = v3`);
{
  const page = await newPage(true);
  try {
    await boot(page);
    await openNode(page, 0);
    ok(await page.evaluate(() => !!document.querySelector(".screen.active .hk4-bl")), "v3 L1 훅(.hk4-bl) 렌더");
    for (let i = 0; i < 3; i++) { await page.locator(`${A} .hk4-bl`).click(); await W(page, 650); }
    if (await questionVisible(page, "", "L1 훅 예측")) {
      await page.locator(`${A} .hook-choice`, { hasText: "스스로 움직여" }).first().click();
      await W(page, 400);
      ok(await page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return !!b && !b.disabled; }), "L1 훅 CTA 개방(trusted)");
      await page.locator(`${A} .btn.cta`).click(); await W(page, 500); // concept
      await page.locator(`${A} .btn.cta`).click(); await W(page, 600); // inkSpreadLab
      await page.locator(`${A} .ink-btn`).click(); // 잉크 넣기
      await W(page, 4600);
      await page.locator(`${A} .ink-btn`).click(); await W(page, 300); // 접시 실험으로
      await page.locator(`${A} .ink-btn`).click(); // 식초 떨어뜨리기
      ok(await questionVisible(page, ".ink-q", "L1 잉크 랩 판정(랩 b4Ask)"), "L1 랩 판정 질문 게이트");
    }
  } catch (e) { ok(false, `v3 L1 실패: ${String(e).slice(0, 90)}`); }
  try {
    await boot(page);
    await openNode(page, 1);
    ok(await page.evaluate(() => !!document.querySelector(".screen.active .hk4-tb")), "v3 L2 훅(.hk4-tb) 렌더");
    await page.locator(`${A} .hk4-tb`).click();
    ok(await questionVisible(page, "", "L2 훅 예측"), "L2 훅 질문 게이트");
  } catch (e) { ok(false, `v3 L2 실패: ${String(e).slice(0, 90)}`); }
  try {
    await boot(page);
    await openNode(page, 3);
    ok(await page.evaluate(() => !!document.querySelector(".screen.active .hk4-fb")), "v3 L4 훅(.hk4-fb) 렌더");
    await page.locator(`${A} .hk4-fb`).click();
    ok(await questionVisible(page, "", "L4 훅 예측"), "L4 훅 질문 게이트");
  } catch (e) { ok(false, `v3 L4 실패: ${String(e).slice(0, 90)}`); }
  await page.close();
}

console.log(`\n[PORT ${PORT}] RESULT: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
