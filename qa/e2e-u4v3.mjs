// 중1 Ⅳ v3(물질의 상태 변화 재제작, 2026-09-03) — 6레슨 실플레이 E2E.
// 훅 조작·랩 목표 3개 점등·CTA 개방·recap·전 문제 정답 시트까지 전부 실제 조작으로 확인한다.
// 레슨은 모듈 직접 import로 연다(스플래시 우회 불필요 — e2e-u3v3 문법). 판정 선택지는 보이는 버튼만(offsetParent).
//   PORT=5463 node qa/e2e-u4v3.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5463";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });

let PASS = 0, FAIL = 0, pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("  PAGEERROR:", e.message); });
const ok = (cond, label) => { if (cond) { PASS++; console.log("  ✓", label); } else { FAIL++; console.log("  ✗", label); } };

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  sessionStorage.setItem("ss.u4v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);

const W = (ms) => page.waitForTimeout(ms);

const openLesson = (idx) =>
  page.evaluate(async (i) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { UNIT4_V3 } = await import("/src/content/unit4v3.ts");
    nav.go(createLessonPlayer(UNIT4_V3.lessons[i], { onExit: () => {}, onComplete: () => {} }));
    return { id: UNIT4_V3.lessons[i].id, steps: UNIT4_V3.lessons[i].steps.length };
  }, idx);

const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(520); };
const ctaEnabled = () => page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return !!b && !b.disabled; });
const goalsOn = () => page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
const clickSel = async (sel) => { await page.evaluate((s) => { const n = document.querySelector(`.screen.active ${s}`); n?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ s, i }) => { document.querySelectorAll(`.screen.active ${s}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { s: sel, i }); };
/** 훅/랩 판정 선택지(텍스트 포함 매칭) — 실제로 보이는 버튼만(offsetParent 검사). 긴 연출은 폴링으로 기다린다. */
const pickChoice = async (scope, text, tries = 40) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate(({ scope, text }) => {
      const btns = [...document.querySelectorAll(`.screen.active ${scope} .hook-choice`)]
        .filter((b) => !b.disabled && b.offsetParent !== null && !b.closest(".hook-choices")?.querySelector(".hook-choice.sel, .hook-choice.miss")); // 이미 답한 질문의 보기는 제외(장면 전환 경합 — 새 질문이 뜰 때까지 폴링)
      const b = btns.find((x) => x.textContent.includes(text));
      if (b) { b.click(); return true; }
      return false;
    }, { scope, text });
    if (done) { await W(440); return true; }
    await W(300);
  }
  return false;
};
/** 버튼이 활성화될 때까지 폴링한 뒤 클릭. */
const clickWhenEnabled = async (sel, tries = 60) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate((s) => {
      const b = document.querySelector(`.screen.active ${s}`);
      if (b && !b.disabled) { b.dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; }
      return false;
    }, sel);
    if (done) { await W(200); return true; }
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
const recapMore = async () => {
  await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card, .screen.active .recap-card")[0]?.click());
  await W(450);
  return page.evaluate(() => !!document.querySelector(".screen.active .rm-h"));
};

// ───────────────────────────── L1 ─────────────────────────────
console.log("L1 입자의 운동, 냄새와 마름의 비밀");
{
  const meta = await openLesson(0);
  await W(700);
  ok(meta.steps === 11, `steps=${meta.steps}`);
  for (let i = 0; i < 3; i++) { await clickSel(".hk4-bl"); await W(650); }
  ok(await pickChoice("", "스스로 움직여"), "bakerylane 예측");
  ok(await ctaEnabled(), "훅 CTA 개방");
  await cta(); // → concept 확산
  ok(await imgLoaded("img[alt*='티백']"), "L1 확산 개념 컷 로드");
  await cta(); // → inkSpreadLab
  await clickSel(".ink-btn"); // 잉크 넣기
  ok(await clickWhenEnabled(".ink-btn"), "잉크 확산 뒤 접시 버튼 활성"); // 접시 실험으로
  ok((await goalsOn()) === 1, "잉크 목표 점등");
  await W(300);
  await clickSel(".ink-btn"); // 식초 떨어뜨리기
  ok(await pickChoice(".ink-q", "스스로 끊임없이"), "확산 판정");
  ok((await goalsOn()) === 3, "잉크·식초 랩 목표 3");
  ok(await ctaEnabled(), "확산 랩 CTA");
  await cta(); // → concept 증발
  ok(await imgLoaded("img[alt*='머리카락']"), "L1 증발 개념 컷 로드");
  await cta(); // → evapScaleLab
  await clickSel(".esl-btn"); await W(400); // 바르기
  ok((await goalsOn()) === 1, "바르기 목표 점등");
  await clickSel(".esl-btn"); // 시간 흐르기
  ok(await pickChoice(".esl-q", "표면의 입자"), "증발 판정");
  ok((await goalsOn()) === 3, "저울 랩 목표 3");
  ok(await ctaEnabled(), "저울 랩 CTA");
  await cta(); // → recap
  ok(await recapMore(), "recap 자세히(rm-h) 렌더");
  await cta(); // → quizzes
  ok(await quiz("mcq", 1), "잉크 시간 순서 (나)→(가)→(다)");
  ok(await quiz("ox-x"), "바람 불 때만 ×");
  ok(await binSort([
    ["빵집 앞을 지나면 빵 냄새가 나요", 0], ["젖은 우산을 두면 말라요", 1], ["물에 홍차 티백을 넣으면 색이 번져요", 0],
    ["염전에서 바닷물을 말려 소금을 얻어요", 1], ["탐지견이 냄새로 숨긴 물건을 찾아요", 0], ["손에 바른 소독제가 금세 말라요", 1],
  ]), "확산/증발 분류 good");
  ok(await quiz("mcq", 0), "오징어 말리기(사진)");
  ok(await quiz("mcq", [0, 1, 2]), "입자 운동 증거 multi");
}

// ───────────────────────────── L2 ─────────────────────────────
console.log("L2 물질의 세 가지 상태");
{
  const meta = await openLesson(1);
  await W(700);
  ok(meta.steps === 10, `steps=${meta.steps}`);
  await clickSel(".hk4-tb");
  ok(await pickChoice("", "배열과 움직임"), "tiltbottles 예측");
  ok(await ctaEnabled(), "훅 CTA 개방");
  await cta(); // → concept
  ok(await imgLoaded("img[alt*='돋보기']"), "L2 개념 컷 로드");
  await cta(); // → threeStatesLab
  await W(400);
  await clickNth(".m3s-state", 1); await W(350); // 액체
  await clickNth(".m3s-state", 2); await W(350); // 기체
  ok((await goalsOn()) === 1, "세 상태 목표 점등");
  await clickNth(".m3s-vessel", 1); // 넓은 통
  ok(await pickChoice(".m3s-q", "가까이 붙어"), "액체 입자 판정");
  ok((await goalsOn()) === 3, "상태 관찰소 목표 3");
  ok(await ctaEnabled(), "상태 관찰소 CTA");
  await cta(); // → table
  ok(await page.evaluate(() => !!document.querySelector(".screen.active .tbl")), "특징 표 렌더");
  await cta(); // → recap
  ok(await recapMore(), "recap 자세히 렌더");
  await cta(); // → quizzes
  ok(await quiz("mcq", 1), "규칙적 배열=(나)");
  ok(await binSort([
    ["책상", 0], ["급식 우유", 1], ["교실 안 공기", 2], ["분필", 0], ["물감을 푼 물", 1], ["풍선 속에 채운 헬륨", 2],
  ]), "교실 물질 분류 good");
  ok(await quiz("ox-o"), "기체 모양·부피 ○");
  ok(await quiz("mcq", 0), "액체 입자 설명");
  ok(await quiz("mcq", [0, 1, 2]), "고체 특징 multi");
}

// ───────────────────────────── L3 ─────────────────────────────
console.log("L3 물질의 상태 변화");
{
  const meta = await openLesson(2);
  await W(700);
  ok(meta.steps === 10, `steps=${meta.steps}`);
  ok(await imgLoaded(".comic-art img"), "물방울의 여행 만화 컷 로드");
  for (let i = 0; i < 7; i++) await cta(); // 만화 7컷
  ok(await imgLoaded("img[alt*='초콜릿']"), "L3 개념 컷 로드");
  ok(await imgLoaded("img[alt*='이슬']"), "이슬·서리 사진 로드");
  await cta(); // → watchGlassLab
  await clickSel(".wgl-btn"); // 관찰 시작
  ok(await pickChoice(".wgl-q", "수증기가 차가운 접시"), "물방울 정체 판정");
  ok((await goalsOn()) === 2, "관찰·물방울 목표 2");
  ok(await clickWhenEnabled(".wgl-btn"), "염화 코발트 종이 버튼");
  ok(await pickChoice(".wgl-q", "성질은 변하지 않는다"), "성질 판정");
  ok((await goalsOn()) === 3, "시계 접시 목표 3");
  ok(await ctaEnabled(), "시계 접시 CTA");
  await cta(); // → dryIceLab
  await clickSel(".dil-btn"); // 비누막 만들기
  ok(await clickWhenEnabled(".dil-btn"), "시간 흐르기 버튼");
  ok((await goalsOn()) === 1, "비누막 목표 점등");
  ok(await pickChoice(".dil-q", "바로 기체가 되어"), "승화 판정");
  ok((await goalsOn()) === 3, "드라이아이스 목표 3");
  ok(await ctaEnabled(), "드라이아이스 CTA");
  await cta(); // → recap
  ok(await recapMore(), "recap 자세히 렌더");
  await cta(); // → quizzes
  ok(await quiz("mcq", 0), "㉣=액화");
  ok(await binSort([
    ["아이스크림이 녹아 흘러내려요", 0], ["젖은 빨래가 마르네요", 1], ["드라이아이스가 녹은 흔적 없이 작아져요", 2],
    ["뜨거운 빵 위의 버터가 녹아요", 0], ["물을 끓이면 물의 양이 줄어요", 1], ["영하의 날씨에 언 명태가 말라요", 2],
  ]), "융해/기화/승화 분류 good");
  ok(await quiz("mcq", 0), "서리=승화(사진)");
  ok(await quiz("ox-x"), "액체 반드시 거쳐야 ×");
  ok(await quiz("mcq", 1), "시계 접시 (가)(나)=융해, 액화");
}

// ───────────────────────────── L4 ─────────────────────────────
console.log("L4 상태 변화와 입자 배열");
{
  const meta = await openLesson(3);
  await W(700);
  ok(meta.steps === 10, `steps=${meta.steps}`);
  await clickSel(".hk4-fb");
  ok(await pickChoice("", "그대로 500"), "frozenbottle 예측");
  ok(await ctaEnabled(), "훅 CTA 개방");
  await cta(); // → oliveFreezeLab
  await clickSel(".ofl-btn"); // 얼리기
  ok(await clickWhenEnabled(".ofl-btn"), "저울에 다시 올리기 버튼");
  ok((await goalsOn()) === 1, "얼리기 목표 점등");
  ok(await pickChoice(".ofl-q", "그대로 12.60"), "질량 판정");
  ok(await pickChoice(".ofl-q", "가까워지고 규칙적"), "부피 판정");
  ok((await goalsOn()) === 3, "올리브유 목표 3");
  ok(await ctaEnabled(), "올리브유 CTA");
  await cta(); // → acetoneBalloonLab
  await clickSel(".abl-btn"); // 바람 불기
  ok(await pickChoice(".abl-q", "거리가 크게 멀어져"), "부피 판정");
  ok(await pickChoice(".abl-q", "종류도 개수도 그대로"), "개수 판정");
  ok((await goalsOn()) === 3, "아세톤 풍선 목표 3");
  ok(await ctaEnabled(), "아세톤 풍선 CTA");
  await cta(); // → concept
  ok(await imgLoaded("img[alt*='양팔 저울']"), "L4 개념 컷 로드");
  ok(await imgLoaded("img[alt*='얼음의 규칙적인']"), "물·얼음 배열 그림 로드");
  await cta(); // → recap
  ok(await recapMore(), "recap 자세히 렌더");
  await cta(); // → quizzes
  ok(await quiz("mcq", 1), "부피 늘어남=(가), (다)");
  ok(await quiz("ox-x"), "질량 변함 ×");
  ok(await quiz("mcq", [0, 1, 2]), "기화 시 변하는 것 multi");
  ok(await binSort([
    ["얼음이 녹아 물이 될 때", 0], ["물이 끓어 수증기가 될 때", 0], ["드라이아이스가 기체가 될 때", 0],
    ["올리브유가 굳을 때", 1], ["수증기가 물방울로 맺힐 때", 1], ["수증기가 서리가 될 때", 1],
  ]), "부피 늘/줄 분류 good");
  ok(await quiz("mcq", 0), "물의 예외(그림)");
}

// ───────────────────────────── L5 ─────────────────────────────
console.log("L5 열에너지를 흡수하는 상태 변화");
{
  const meta = await openLesson(4);
  await W(700);
  ok(meta.steps === 9, `steps=${meta.steps}`);
  for (let i = 0; i < 3; i++) { await clickSel(".hk4-iw"); await W(750); }
  ok(await pickChoice("", "모두 쓰여서"), "icewatch 예측");
  ok(await ctaEnabled(), "훅 CTA 개방");
  await cta(); // → concept
  ok(await imgLoaded("img[alt*='손바닥']"), "L5 개념 컷 로드");
  await cta(); // → meltBoilLab
  await W(400);
  await clickSel(".mbl-btn"); // 가열 시작
  ok(await pickChoice(".mbl-q", "일정하게 유지", 80), "온도 판정");
  ok((await goalsOn()) === 2, "녹는·끓는 구간 목표 2");
  ok(await pickChoice(".mbl-q", "상태 변화에 모두"), "열에너지 판정");
  ok((await goalsOn()) === 3, "가열 곡선 목표 3");
  ok(await ctaEnabled(), "가열 곡선 CTA");
  await cta(); // → recap
  ok(await recapMore(), "recap 자세히 렌더");
  await cta(); // → quizzes
  ok(await quiz("mcq", 0), "(나) 구간=융해 중");
  ok(await quiz("ox-x"), "끓는 동안 온도 상승 ×");
  ok(await quiz("mcq", 0), "온도 일정한 까닭");
  ok(await orderChips(["얼음의 온도가 올라간다", "얼음이 녹는 동안", "물의 온도가 올라간다", "물이 끓는 동안"]), "가열 순서 order good");
  ok(await quiz("mcq", [0, 1, 2]), "흡수 상태 변화 multi");
}

// ───────────────────────────── L6 ─────────────────────────────
console.log("L6 열에너지를 방출하는 상태 변화");
{
  const meta = await openLesson(5);
  await W(700);
  ok(meta.steps === 10, `steps=${meta.steps}`);
  ok(await imgLoaded(".comic-art img"), "이글루 만화 컷 로드");
  for (let i = 0; i < 7; i++) await cta(); // 만화 7컷
  ok(await imgLoaded("img[alt*='사과나무']"), "L6 개념 컷 로드");
  await cta(); // → freezeCurveLab
  await clickSel(".frz-btn"); // 냉각 시작
  ok(await pickChoice(".frz-q", "일정하게 유지", 70), "구간 판정");
  ok(await pickChoice(".frz-q", "방출하기 때문"), "열에너지 판정");
  ok((await goalsOn()) === 3, "냉각 곡선 목표 3");
  ok(await ctaEnabled(), "냉각 곡선 CTA");
  await cta(); // → surroundTempLab
  ok(await pickChoice(".stl-q", "낮아진다"), "살수차 예측");
  ok((await goalsOn()) === 1, "살수차 목표 점등");
  ok(await clickWhenEnabled(".stl-btn"), "다음 장면(파라핀)");
  ok(await pickChoice(".stl-q", "높아진다"), "파라핀 예측");
  ok(await clickWhenEnabled(".stl-btn"), "다음 장면(눈)");
  ok(await pickChoice(".stl-q", "높아진다"), "눈 오는 날 예측");
  ok((await goalsOn()) === 3, "주변 온도 목표 3");
  ok(await ctaEnabled(), "주변 온도 CTA");
  await cta(); // → recap
  ok(await recapMore(), "recap 자세히 렌더");
  await cta(); // → quizzes
  ok(await quiz("mcq", 0), "(나) 구간=응고, 방출");
  ok(await binSort([
    ["여름날 도로에 물을 뿌리는 살수차", 0], ["아이스크림 상자 속 드라이아이스", 0], ["운동 뒤 땀이 마르면 시원해요", 0],
    ["액체 파라핀에 손을 담그는 온열 치료", 1], ["추위가 닥치면 사과나무에 물을 뿌려 얼려요", 1], ["눈이 내리는 날은 포근해요", 1],
  ]), "흡수/방출 이용 분류 good");
  ok(await quiz("ox-x"), "얼 때 흡수 ×");
  ok(await quiz("mcq", 0), "아이스박스(그림)");
  ok(await quiz("mcq", [0, 1, 2]), "방출 상태 변화 multi");
}

console.log(`\nRESULT: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
