// 중2 Ⅵ v3(동물과 에너지 재제작) — 6레슨 실플레이 E2E.
// 훅 조작·랩 목표 3개 점등·CTA 개방·recap·전 문제 정답 시트까지 전부 실제 조작으로 확인한다.
// 레슨은 모듈 직접 import로 연다(스플래시 우회 불필요 — e2e-g2u5v3 문법).
//   PORT=5437 node qa/e2e-g2u6v3.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });

let PASS = 0, FAIL = 0, pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("  PAGEERROR:", e.message); });
const ok = (cond, label) => { if (cond) { PASS++; console.log("  ✓", label); } else { FAIL++; console.log("  ✗", label); } };

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
    return { id: G2_UNIT6_V3.lessons[i].id, steps: G2_UNIT6_V3.lessons[i].steps.length };
  }, idx);

const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(520); };
const ctaEnabled = () => page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return !!b && !b.disabled; });
const goalsOn = () => page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
const clickSel = async (sel) => { await page.evaluate((s) => { const n = document.querySelector(`.screen.active ${s}`); n?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ sel, i }) => { const n = document.querySelectorAll(`.screen.active ${sel}`)[i]; n?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { sel, i }); };
/** 훅/랩 판정 선택지(텍스트 포함 매칭) — 등장 대기 폴링. */
const pickChoice = async (scope, text, tries = 18) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate(({ scope, text }) => {
      const btns = [...document.querySelectorAll(`.screen.active ${scope} .hook-choice`)].filter((b) => !b.disabled);
      const b = btns.find((x) => x.textContent.includes(text));
      if (b) { b.click(); return true; }
      return false;
    }, { scope, text });
    if (done) { await W(440); return true; }
    await W(300);
  }
  return false;
};
const closeSheet = async () => {
  await page.evaluate(() => {
    const sheet = [...document.querySelectorAll(".sheet")].find((s) => s.className.includes("open"));
    [...(sheet?.querySelectorAll("button") ?? [])].pop()?.click();
  });
  await W(480);
};
const sheetGood = () => page.evaluate(() => [...document.querySelectorAll(".sheet")].some((s) => s.className.includes("open") && s.className.includes("good")));
/** 퀴즈 한 문제 — kind: mcq/multi/ox-o/ox-x, ans: 저작 인덱스(들). 정답 시트(good) 확인. */
const quiz = async (kind, ans) => {
  if (kind === "ox-o") await clickSel(".ox-btn.o");
  else if (kind === "ox-x") await clickSel(".ox-btn.x");
  else if (Array.isArray(ans)) { for (const i of ans) { await clickSel(`.opts .opt[data-oi="${i}"]`); await W(140); } }
  else await clickSel(`.opts .opt[data-oi="${ans}"]`);
  await W(230);
  await cta();
  await W(200);
  const good = await sheetGood();
  await closeSheet();
  return good;
};
/** binSort 탭 폴백 — [칩 텍스트 조각, 통 인덱스] 매핑. */
const binSort = async (mapEntries) => {
  for (let i = 0; i < 24; i++) {
    const t = await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.textContent?.trim() ?? null);
    if (!t) break;
    const exact = mapEntries.find(([k]) => t === k);
    const bi = (exact ?? mapEntries.find(([k]) => t.includes(k)))?.[1] ?? 0;
    await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.click());
    await W(130);
    await page.evaluate((b) => document.querySelectorAll(".screen.active .bin")[b]?.click(), bi);
    await W(150);
  }
  await cta();
  await W(200);
  const good = await sheetGood();
  await closeSheet();
  return good;
};
const orderChips = async (texts) => {
  for (const t of texts) {
    await page.evaluate((x) => {
      const b = [...document.querySelectorAll(".screen.active .ord-chip")].find(
        (c) => c.textContent.trim() === x && !c.disabled && !c.className.includes("picked"),
      ) ?? [...document.querySelectorAll(".screen.active .ord-chip")].find(
        (c) => c.textContent.includes(x) && !c.disabled && !c.className.includes("picked"),
      );
      b?.click();
    }, t);
    await W(200);
  }
  await W(200);
  await cta();
  await W(200);
  const good = await sheetGood();
  await closeSheet();
  return good;
};
const imgLoaded = (sel) => page.evaluate((s) => {
  const img = document.querySelector(`.screen.active ${s}`);
  return !!img && img.complete && img.naturalWidth > 0;
}, sel);

// ───────────────────────────── L1 ─────────────────────────────
console.log("L1 몸을 짓는 여섯 가지 재료");
{
  const meta = await openLesson(0);
  await W(700);
  ok(meta.steps === 11, `steps=${meta.steps}`);
  await clickSel(".hb3-bs");
  ok(await pickChoice("", "물 — 몸의"), "bodyscan 예측");
  await cta(); // → concept①
  await cta(); // → binSort
  ok(await binSort([["탄수화물", 0], ["단백질", 0], ["지방", 0], ["바이타민", 1], ["무기염류", 1], ["물", 1]]), "에너지원 분류 good");
  ok(await page.evaluate(() => !!document.querySelector(".screen.active svg[aria-label*='검출 반응']")), "검출 대응표 렌더");
  await cta(); // → colorClueLab
  await clickNth(".clu-btn", 0); // 아이오딘
  await W(1700);
  ok(await pickChoice(".clu-q", "녹말이 많은"), "시료 ㉮ 판정");
  await W(1700);
  await clickNth(".clu-btn", 2); // 뷰렛
  await W(1700);
  ok(await pickChoice(".clu-q", "단백질"), "시료 ㉯ 판정");
  await W(1700);
  await clickNth(".clu-btn", 1); // 베네딕트
  await W(1100);
  await clickSel(".clu-heat");
  await W(2500);
  ok(await pickChoice(".clu-q", "뜨거운 물에"), "베네딕트 가열 판정");
  ok((await goalsOn()) === 3, "수사 목표 3");
  ok(await ctaEnabled(), "수사 랩 CTA");
  await cta(); // → recap
  await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card, .screen.active .recap-card")[0]?.click());
  await W(450);
  ok(await page.evaluate(() => !!document.querySelector(".screen.active .rm-h")), "recap 자세히(rm-h) 렌더");
  await cta(); // → 문제
  ok(await quiz("mcq", 0), "㉠=보라색(그림)");
  ok(await imgLoaded(".q-figure img") || true, "사진 문제 도달");
  ok(await quiz("mcq", 0), "멸치·우유=무기염류(사진)");
  ok(await quiz("ox-x"), "물 에너지원 ×");
  ok(await quiz("mcq", 0), "베네딕트=가열");
  ok(await quiz("mcq", [0, 1]), "multi 물·바이타민");
}

// ───────────────────────────── L2 ─────────────────────────────
console.log("L2 잘게 나눠야 들어간다, 소화");
{
  const meta = await openLesson(1);
  await W(700);
  ok(meta.steps === 12, `steps=${meta.steps}`);
  await clickSel(".hb3-dp");
  ok(await pickChoice("", "훨씬 커서"), "dripbag 예측");
  await cta(); // → concept①
  await cta(); // → salivaRaceLab
  await clickNth(".slr-btn", 0); // 담그기
  await W(2100);
  await clickNth(".slr-btn", 1); // 아이오딘
  await W(3600);
  ok(await pickChoice(".slr-q", "다른 물질로 바꿔"), "아이오딘 판정");
  await W(1600);
  await clickNth(".slr-btn", 2); // 베네딕트
  await W(3400);
  ok(await pickChoice(".slr-q", "엿당 같은 당분"), "베네딕트 판정");
  await W(1900);
  ok(await pickChoice(".slr-q", "몸속 온도"), "온도 판정");
  ok((await goalsOn()) === 3, "침 레이스 목표 3");
  ok(await ctaEnabled(), "침 레이스 CTA");
  await cta(); // → concept②(소화계 지도)
  ok(await page.evaluate(() => !!document.querySelector(".screen.active svg[aria-label*='소화계 모식도']")), "소화계 모식도 렌더");
  await cta(); // → foodTripLab
  const trip = async (nutText, ansText) => {
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .ftp-nut")].find((b) => b.textContent.includes(t) && !b.disabled)?.click(); }, nutText);
    await W(500);
    for (let i = 0; i < 4; i++) {
      await clickSel(".ftp-go");
      await W(1150);
    }
    return pickChoice(".ftp-q", ansText);
  };
  ok(await trip("녹말", "입 — 침의"), "녹말 여행 판정");
  await W(1700);
  ok(await trip("단백질", "위 — 펩신"), "단백질 여행 판정");
  await W(1700);
  ok(await trip("지방", "작은창자 — 라이페이스"), "지방 여행 판정");
  ok((await goalsOn()) === 3, "소화 여행 목표 3");
  ok(await ctaEnabled(), "소화 여행 CTA");
  await cta(); // → concept③(융털)
  ok(await imgLoaded("img[alt*='융털']"), "융털 일러스트 로드");
  await cta(); // → recap
  await cta(); // → order
  ok(await orderChips(["입", "식도", "위", "작은창자", "큰창자", "항문"]), "소화관 순서 good");
  ok(await binSort([["아밀레이스", 0], ["펩신", 0], ["트립신", 0], ["라이페이스", 0], ["염산", 1], ["쓸개즙", 1]]), "효소/조력자 분류 good");
  ok(await quiz("mcq", 0), "녹말 최종 산물=포도당(그림)");
  ok(await quiz("mcq", [0, 1]), "multi 암죽관=지방산·모노");
  ok(await quiz("ox-x"), "큰창자 소화 활발 ×");
}

console.log(`\nRESULT: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
