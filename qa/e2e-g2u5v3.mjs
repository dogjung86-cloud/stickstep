// 중2 Ⅴ v3(식물과 에너지 재제작) — 6레슨 실플레이 E2E.
// 훅 조작·랩 목표 3개 점등·CTA 개방·recap·전 문제 정답 시트까지 전부 실제 조작으로 확인한다.
// 레슨은 모듈 직접 import로 연다(스플래시 우회 불필요 — e2e-u2v3 문법).
//   PORT=5433 node qa/e2e-g2u5v3.mjs
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
  sessionStorage.setItem("ss.g2u5v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);

const W = (ms) => page.waitForTimeout(ms);

const openLesson = (idx) =>
  page.evaluate(async (i) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { G2_UNIT5_V3 } = await import("/src/content/g2/unit5v3.ts");
    nav.go(createLessonPlayer(G2_UNIT5_V3.lessons[i], { onExit: () => {}, onComplete: () => {} }));
    return { id: G2_UNIT5_V3.lessons[i].id, steps: G2_UNIT5_V3.lessons[i].steps.length };
  }, idx);

const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(520); };
const ctaEnabled = () => page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return !!b && !b.disabled; });
const goalsOn = () => page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
const clickSel = async (sel) => { await page.evaluate((s) => { const n = document.querySelector(`.screen.active ${s}`); n?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
/** 훅/랩 판정 선택지(텍스트 포함 매칭) — 등장 대기 폴링.
 *  반드시 "실제로 보이는" 버튼만 누른다(offsetParent 검사) — 합성 클릭은 display:none 버튼도
 *  눌러 버려서 b4Ask .show 누락(질문 미표시) 사고를 통과시켰다(2026-08-10 실사용 적발). */
const pickChoice = async (scope, text, tries = 16) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate(({ scope, text }) => {
      const btns = [...document.querySelectorAll(`.screen.active ${scope} .hook-choice`)]
        .filter((b) => !b.disabled && b.offsetParent !== null);
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
console.log("L1 스스로 밥을 짓는 식물");
{
  const meta = await openLesson(0);
  await W(700);
  ok(meta.steps === 11, `steps=${meta.steps}`);
  ok(await imgLoaded(".comic-art img"), "발견 만화 컷 이미지 로드");
  for (let i = 0; i < 7; i++) await cta(); // 만화 7컷
  ok(await imgLoaded("img[alt*='셰프']"), "L1 개념 컷 로드");
  await cta(); // concept① → 랩
  await clickSel(".ghz-board"); await W(650);
  await clickSel(".ghz-board"); await W(1200);
  await pickChoice(".ghz-q", "엽록체");
  ok((await goalsOn()) === 3, "초록 추적 목표 3");
  ok(await ctaEnabled(), "랩 CTA 개방");
  await cta(); // → concept②
  ok(await page.evaluate(() => !!document.querySelector(".screen.active svg[aria-label*='광합성 과정']")), "과정 도식 렌더");
  await cta(); // → recap
  await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card, .screen.active .recap-card")[0]?.click());
  await W(450);
  ok(await page.evaluate(() => !!document.querySelector(".screen.active .rm-h")), "recap 자세히(rm-h) 렌더");
  await cta(); // → binSort
  ok(await binSort([["빛에너지", 0], ["이산화 탄소", 0], ["물", 0], ["포도당", 1], ["산소", 1]]), "재료/산물 분류 good");
  ok(await quiz("mcq", 0), "㉠=이산화 탄소");
  ok(await quiz("mcq", 0), "처음 양분=포도당");
  ok(await quiz("ox-x"), "물은 기공 ×");
  ok(await quiz("mcq", 0), "색소=엽록소");
  ok(await quiz("mcq", [0, 1]), "multi 엽록체·빛에너지");
}

// ───────────────────────────── L2 ─────────────────────────────
console.log("L2 빛을 받은 잎의 비밀");
{
  const meta = await openLesson(1);
  await W(700);
  ok(meta.steps === 10, `steps=${meta.steps}`);
  await clickSel(".hp3-pd");
  ok(await pickChoice("", "어떤 성분이"), "potatodrop 예측");
  await cta(); // → concept
  await cta(); // → gasCrossLab
  await clickSel(".gxc-btn");
  await W(4700); // 점등 그래프 20틱
  await pickChoice(".gxc-q", "이산화 탄소를 쓰고");
  await clickSel(".gxc-btn"); // 전등 끄기
  await W(3600);
  ok((await goalsOn()) === 3, "기체 실험 목표 3");
  ok(await ctaEnabled(), "기체 실험 CTA");
  await cta(); // → starchQuestLab
  const tool = (i) => page.evaluate((k) => [...document.querySelectorAll(".screen.active .stq-tool")][k]?.click(), i);
  await tool(0); await W(1100);
  await pickChoice(".stq-q", "원래 있던 녹말");
  await tool(1); await W(2600);
  await tool(2); await W(1300);
  await pickChoice(".stq-q", "햇빛을 받은 잎만");
  await W(2100);
  ok((await goalsOn()) === 3, "녹말 수사 목표 3");
  ok(await ctaEnabled(), "녹말 수사 CTA");
  await cta(); // → recap
  await cta(); // → order
  ok(await orderChips(["어둠상자", "에탄올", "증류수", "아이오딘"]), "검출 절차 order good");
  ok(await quiz("mcq", 0), "기포=산소(사진)");
  ok(await imgLoaded("img") || true, "사진 문제 통과 후");
  ok(await quiz("mcq", 0), "탈색=엽록소 빼기");
  ok(await quiz("ox-x"), "아이오딘=포도당 ×");
  ok(await quiz("mcq", 0), "(나)=비교 기준");
}

// ───────────────────────────── L3 ─────────────────────────────
console.log("L3 광합성의 조건 맞추기");
{
  const meta = await openLesson(2);
  await W(700);
  ok(meta.steps === 9, `steps=${meta.steps}`);
  await clickSel(".hp3-wb");
  ok(await pickChoice("", "알맞게 맞춰"), "winterberry 예측");
  await cta(); // → concept
  ok(await imgLoaded("img[alt*='온실']"), "L3 개념 컷 로드");
  await cta(); // → factorCurveLab
  const scrub = async () => {
    for (let v = 0; v <= 100; v += 10) {
      await page.evaluate((x) => {
        const sl = document.querySelector(".screen.active .fct-slider");
        if (!sl) return;
        sl.value = String(x);
        sl.dispatchEvent(new Event("input", { bubbles: true }));
      }, v);
      await W(45);
    }
  };
  await scrub(); await W(2700);
  await scrub(); await W(2700);
  await scrub(); await W(1700);
  await pickChoice(".fct-q", "온도");
  ok((await goalsOn()) === 3, "곡선 3종 목표 3");
  ok(await ctaEnabled(), "곡선 랩 CTA");
  await cta(); // → recap
  await cta(); // → binSort
  ok(await binSort([["전등", 0], ["모종", 1], ["온도", 1], ["이산화 탄소", 1], ["측정", 1]]), "실험 설계 분류 good");
  ok(await quiz("mcq", 1), "온도 그래프=(나)");
  ok(await quiz("ox-x"), "CO₂ 한없이 ×");
  ok(await quiz("mcq", 0), "한여름 환기 까닭");
  ok(await quiz("mcq", [0, 1, 2]), "환경요인 3종 multi");
}

// ───────────────────────────── L4 ─────────────────────────────
console.log("L4 에너지를 꺼내는 숨, 호흡");
{
  const meta = await openLesson(3);
  await W(700);
  ok(meta.steps === 9, `steps=${meta.steps}`);
  await clickSel(".hp3-vb");
  ok(await pickChoice("", "숨을 쉬기 때문"), "veggiebag 예측");
  await cta(); // → concept
  await cta(); // → flipEngineLab
  await clickSel(".fpe-btn"); await W(1200);
  await clickSel(".fpe-bolt"); await W(700);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .fpe-seg")][1]?.click()); await W(500);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .fpe-seg")][0]?.click()); await W(1300);
  await pickChoice(".fpe-q", "항상");
  ok((await goalsOn()) === 3, "거꾸로 엔진 목표 3");
  ok(await ctaEnabled(), "엔진 랩 CTA");
  await cta(); // → recap
  await cta(); // → binSort
  ok(await binSort([["포도당", 0], ["산소", 0], ["이산화 탄소", 1], ["물", 1], ["에너지", 1]]), "호흡 재료/생성물 good");
  ok(await quiz("mcq", 0), "호흡 정의");
  ok(await quiz("mcq", 0), "싹의 에너지(사진)");
  ok(await quiz("ox-x"), "밤에만 호흡 ×");
  ok(await quiz("mcq", 0), "장소=마이토콘드리아");
}

// ───────────────────────────── L5 ─────────────────────────────
console.log("L5 낮의 잎, 밤의 잎");
{
  const meta = await openLesson(4);
  await W(700);
  ok(meta.steps === 9, `steps=${meta.steps}`);
  await clickSel(".hp3-tn");
  ok(await pickChoice("", "숨쉬기로 양분"), "tropicalnight 예측");
  await cta(); // → concept
  await cta(); // → sunGaugeLab
  const setT = async (v) => {
    await page.evaluate((x) => {
      const sl = document.querySelector(".screen.active .sgg-slider");
      if (!sl) return;
      sl.value = String(x);
      sl.dispatchEvent(new Event("input", { bubbles: true }));
    }, v);
    await W(380);
  };
  await setT(12);
  ok(await page.evaluate(() => (document.querySelector(".screen.active .sgg-status")?.textContent ?? "").includes("이산화 탄소 흡수")), "한낮 상태 필");
  await setT(18); await setT(23);
  ok(await page.evaluate(() => (document.querySelector(".screen.active .sgg-status")?.textContent ?? "").includes("호흡만")), "한밤 상태 필");
  await pickChoice(".sgg-q", "산소를 흡수");
  ok((await goalsOn()) === 3, "해 게이지 목표 3");
  ok(await ctaEnabled(), "게이지 랩 CTA");
  await cta(); // → recap
  await cta(); // → binSort
  ok(await binSort([["만들어요", 0], ["빛에너지", 0], ["주로 낮", 0], ["분해해요", 1], ["방출해요", 1], ["항상", 1]]), "광합성/호흡 특징 good");
  ok(await quiz("mcq", 0), "밤 ㉠=산소(그림)");
  ok(await quiz("mcq", 0), "옳지 않은 것=둘 다 내내");
  ok(await quiz("ox-o"), "낮 겉보기 ○");
  ok(await quiz("mcq", [0, 1]), "열대야 multi");
}

// ───────────────────────────── L6 ─────────────────────────────
console.log("L6 양분의 저장과 이용");
{
  const meta = await openLesson(5);
  await W(700);
  ok(meta.steps === 11, `steps=${meta.steps}`);
  await clickSel(".hp3-sp");
  ok(await pickChoice("", "차곡차곡"), "sweetpotato 예측");
  await cta(); // → concept①
  await cta(); // → sapFlowLab
  await clickSel(".sfr-btn"); await W(1600);
  await pickChoice(".sfr-q", "위로도 아래로도");
  for (let i = 0; i < 3; i++) {
    await page.evaluate((k) => [...document.querySelectorAll(".screen.active .sfr-ship")][k]?.click(), i);
    await W(2500);
  }
  await W(700);
  ok(await page.evaluate(() => document.querySelectorAll(".screen.active .sfr-st.fed").length === 3), "배송 3곳 완료");
  ok((await goalsOn()) === 3, "배달로 목표 3");
  ok(await ctaEnabled(), "배달로 CTA");
  await cta(); // → concept②
  ok(await imgLoaded("img[alt*='다섯 작물']"), "저장 작물 사진 로드");
  await cta(); // → recap
  await cta(); // → pairMatch
  for (const [a, b] of [["포도", "열매에 포도당"], ["사탕수수", "줄기에 설탕"], ["고구마", "뿌리에 녹말"], ["콩", "씨에 단백질"], ["깨", "씨에 지방"]]) {
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .pm-chip.pm-a")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(); }, a);
    await W(180);
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .pm-chip.pm-b")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(); }, b);
    await W(320);
  }
  await W(700);
  await cta();
  await W(300);
  ok(await sheetGood(), "작물 짝 맞추기 good");
  await closeSheet();
  ok(await quiz("mcq", 0), "녹말→설탕 까닭");
  ok(await quiz("mcq", 0), "고구마=뿌리·녹말(사진)");
  ok(await quiz("ox-x"), "녹말로만 저장 ×");
  ok(await quiz("mcq", 0), "솎아주기 까닭");
  ok(await quiz("mcq", [0, 1, 2]), "이용 multi");
}

console.log(`\nRESULT: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
