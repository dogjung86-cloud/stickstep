// [임시 프리뷰] u3l1 적용 랩 시제품(directorLab, 입자 연출가) 검증 — PORT=<포트> node qa/preview-u3l1v2.mjs
// 훅(두 컵) → 발견 랩(키보드) → recap → 적용 랩: 커밋 잠금(전 음료 방문 전) → 정지 함정 →
// 크기 함정 → 움직임 순서 위반 → 간격 순서 위반 → 성공(칩 3·피날레·CTA) → 문제 진입까지 실플레이.
// 스크린샷 qa/shots/dl-*.png. 시제품 폐기 시 이 파일도 삭제.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

let pass = 0;
let fail = 0;
const ok = (cond, name) => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}`); }
};
const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".screen.active .h1")?.textContent?.trim().replace(/\s+/g, " "));
const helperTxt = () => page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
const clickCTA = async (timeout = 20000) => {
  await page.waitForFunction(() => { const b = document.querySelector(".screen.active button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(600);
};
const shootDisabled = () => page.evaluate(() => document.querySelector(".screen.active .swapbtn")?.disabled);
const shoot = async () => {
  await page.evaluate(() => document.querySelector(".screen.active .swapbtn").click());
  await W(350);
};
const pickDrink = async (id) => {
  await page.evaluate((id) => document.querySelector(`.screen.active .dl-seg button[data-drink="${id}"]`).click(), id);
  await W(180);
};
const dial = async (which, dir, times) => {
  for (let i = 0; i < times; i++) {
    await page.evaluate(({ which, dir }) => document.querySelector(`.screen.active .ck-btn[data-dial="${which}"][data-d="${dir}"]`).click(), { which, dir });
    await W(90);
  }
};
const markOf = (id) => page.evaluate((id) => document.querySelector(`.screen.active .dl-tag[data-tag="${id}"] .dl-mark`)?.textContent, id);

await page.goto(`http://localhost:${PORT}/?preview=u3l1v2`, { waitUntil: "networkidle" });
await W(1400);

// ── 1. 훅 → 발견 랩 → recap 통과 ──────────────────────────
console.log("① 훅·발견 랩·recap 통과");
ok((await h1())?.includes("겉보기엔 같은 두 컵"), "훅 마운트");
await page.evaluate(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const c of document.querySelectorAll(".screen.active .hook-cup")) {
    c.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 5, isPrimary: true }));
    await wait(750);
    c.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 5, isPrimary: true }));
    c.click();
    await wait(450);
  }
});
await clickCTA(); // 실험실 열기
await page.evaluate(() => {
  const sl = document.querySelector(".screen.active .hp-slider");
  for (let i = 0; i < 22; i++) sl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
});
await W(2100);
await page.evaluate(() => {
  const sl = document.querySelector(".screen.active .hp-slider");
  for (let i = 0; i < 28; i++) sl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
});
await W(2300);
await clickCTA(); // 개념 정리하기 → recap
ok((await h1())?.includes("온도의 정체"), "recap 마운트");
ok(await page.evaluate(() => document.querySelector(".screen.active button.cta")?.textContent?.includes("연출")), "recap CTA가 연출 랩으로 이어짐");
await clickCTA(); // 배운 대로 연출하기 → 적용 랩

// ── 2. 적용 랩 마운트 · 커밋 잠금 ──────────────────────────
console.log("② 적용 랩(directorLab) 마운트");
ok((await h1())?.includes("지워진 입자 장면"), "적용 랩 마운트");
await W(900);
await shot("dl-1-mount");
ok(await shootDisabled(), "재촬영 버튼: 세 음료를 모두 보기 전 잠금");
await pickDrink("water");
await pickDrink("coffee");
ok(!(await shootDisabled()), "세 음료 방문 후 재촬영 해제");

// ── 3. 함정 ①: 전부 정지인 채 재촬영 ───────────────────────
console.log("③ 함정: 정지·크기·순서");
await shoot();
ok((await helperTxt()).includes("멈추지 않아요"), "정지 함정: 오개념 교정 문구");
ok((await markOf("juice")) === "✗", "정지 함정: 문제 음료에 ✗ 표시");
await shot("dl-2-frozen-trap");

// ── 4. 연출: 주스 둔하게 · 생수 보통 · 커피 활발 ───────────
await pickDrink("juice");
await dial("m", "1", 2); // 움직임 0→2
await dial("g", "-1", 1); // 간격 3→2
await pickDrink("water");
await dial("m", "1", 3); // 0→3 (간격 3 유지)
await pickDrink("coffee");
await dial("m", "1", 5); // 0→5
await dial("g", "1", 2); // 3→5

// 함정 ②: 커피 입자 크기를 '크게'로
await dial("s", "1", 1);
await shoot();
ok((await helperTxt()).includes("크기는") && (await helperTxt()).includes("그대로"), "크기 함정: '크기는 그대로' 교정 문구");
ok((await markOf("coffee")) === "✗", "크기 함정: 커피에 ✗ 표시");
await shot("dl-3-size-trap");
await dial("s", "-1", 1); // 되돌리기

// 함정 ③: 생수 움직임을 주스와 같게(순서 위반)
await pickDrink("water");
await dial("m", "-1", 1); // 3→2 (= 주스 2)
await shoot();
ok((await helperTxt()).includes("온도가 높을수록"), "움직임 순서 위반: 교정 문구");
await dial("m", "1", 1); // 2→3 복구

// 함정 ④: 생수 간격을 주스와 같게(간격 순서 위반)
await dial("g", "-1", 1); // 3→2 (= 주스 2)
await shoot();
ok((await helperTxt()).includes("간격"), "간격 순서 위반: 교정 문구");
await dial("g", "1", 1); // 복구

// ── 5. 성공 ────────────────────────────────────────────────
console.log("④ 성공·피날레");
await shoot();
ok((await helperTxt()).includes("크기는") && (await helperTxt()).includes("그대로"), "피날레: 크기 다이얼 회수 문구");
ok(await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length === 3), "목표 칩 3개 점등");
ok((await markOf("juice")) === "✓" && (await markOf("water")) === "✓" && (await markOf("coffee")) === "✓", "세 음료 모두 ✓");
ok(await page.evaluate(() => { const b = document.querySelector(".screen.active .swapbtn"); return b.classList.contains("done-static") && b.textContent.includes("재촬영 완료"); }), "재촬영 버튼 → 완료 상태");
await shot("dl-4-success");

// ── 6. CTA → 문제 진입 ─────────────────────────────────────
await clickCTA();
ok(await page.evaluate(() => !!document.querySelector(".screen.active .opts .opt") || !!document.querySelector(".screen.active .ox-grid")), "문제 스텝 진입");
await W(400);
await shot("dl-5-quiz");

console.log(`\n결과: ${pass} 통과 · ${fail} 실패 · 페이지 에러 ${pageErrors}건`);
await browser.close();
process.exit(fail > 0 || pageErrors > 0 ? 1 : 0);
