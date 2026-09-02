// 중1 Ⅲ v3(열 재제작, 2026-09-03) — 5레슨 실플레이 E2E.
// 훅 조작·랩 목표 3개 점등·CTA 개방·recap·전 문제 정답 시트까지 전부 실제 조작으로 확인한다.
// 레슨은 모듈 직접 import로 연다(스플래시 우회 불필요 — e2e-g2u5v3 문법).
//   PORT=5453 node qa/e2e-u3v3.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
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
  sessionStorage.setItem("ss.u3v3", "1");
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);

const W = (ms) => page.waitForTimeout(ms);

const openLesson = (idx) =>
  page.evaluate(async (i) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { UNIT3_V3 } = await import("/src/content/unit3v3.ts");
    nav.go(createLessonPlayer(UNIT3_V3.lessons[i], { onExit: () => {}, onComplete: () => {} }));
    return { id: UNIT3_V3.lessons[i].id, steps: UNIT3_V3.lessons[i].steps.length };
  }, idx);

const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(520); };
const ctaEnabled = () => page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return !!b && !b.disabled; });
const goalsOn = () => page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
const clickSel = async (sel) => { await page.evaluate((s) => { const n = document.querySelector(`.screen.active ${s}`); n?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickNth = async (sel, i) => { await page.evaluate(({ s, i }) => { document.querySelectorAll(`.screen.active ${s}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, { s: sel, i }); };
/** 훅/랩 판정 선택지(텍스트 포함 매칭) — 실제로 보이는 버튼만(offsetParent 검사). */
const pickChoice = async (scope, text, tries = 20) => {
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
const setSlider = async (sel, v) => {
  await page.evaluate(({ s, v }) => {
    const sl = document.querySelector(`.screen.active ${s}`);
    if (!sl) return;
    sl.value = String(v);
    sl.dispatchEvent(new Event("input", { bubbles: true }));
  }, { s: sel, v });
  await W(120);
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
const imgLoaded = (sel) => page.evaluate((s) => {
  const img = document.querySelector(`.screen.active ${s}`);
  return !!img && img.complete && img.naturalWidth > 0;
}, sel);
const figTabsAll = async () => {
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .seg button").length);
  for (let i = 1; i < n; i++) { await clickNth(".seg button", i); await W(260); }
  return n;
};

// ───────────────────────────── L1 ─────────────────────────────
console.log("L1 온도의 정체, 입자의 움직임");
{
  const meta = await openLesson(0);
  await W(700);
  ok(meta.steps === 9, `steps=${meta.steps}`);
  for (let i = 0; i < 3; i++) { await clickSel(".hk3-rh"); await W(450); }
  ok(await pickChoice("", "입자들의 움직임"), "rubhands 예측");
  ok(await ctaEnabled(), "훅 CTA 개방");
  await cta(); // → concept
  ok(await imgLoaded("img[alt*='돋보기']"), "L1 개념 컷 로드");
  await cta(); // → particleDialLab
  await setSlider(".pdl-slider", 60);
  await setSlider(".pdl-slider", 90);
  await W(400);
  ok((await goalsOn()) === 1, "가열 목표 점등");
  await setSlider(".pdl-slider", 40);
  await setSlider(".pdl-slider", 5);
  await W(900);
  ok(await pickChoice(".pdl-q", "더 활발하게"), "입자 판정");
  ok((await goalsOn()) === 3, "입자 다이얼 목표 3");
  ok(await ctaEnabled(), "랩 CTA 개방");
  await cta(); // → recap
  await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card, .screen.active .recap-card")[0]?.click());
  await W(450);
  ok(await page.evaluate(() => !!document.querySelector(".screen.active .rm-h")), "recap 자세히(rm-h) 렌더");
  await cta(); // → quizzes
  ok(await quiz("mcq", 0), "온도 정의");
  ok(await quiz("mcq", 2), "가장 높은 온도=(다)");
  ok(await quiz("ox-x"), "찬물 입자 멈춤 ×");
  ok(await quiz("mcq", [0, 1, 2]), "가열 변화 multi");
  ok(await quiz("mcq", 0), "냉장고 음료수");
}

// ───────────────────────────── L2 ─────────────────────────────
console.log("L2 열평형, 온도가 만나는 순간");
{
  const meta = await openLesson(1);
  await W(700);
  ok(meta.steps === 9, `steps=${meta.steps}`);
  await clickSel(".hk3-bt");
  await W(3900);
  ok(await pickChoice("", "같아졌다"), "beepthermo 예측");
  await cta(); // → concept
  ok(await imgLoaded("img[alt*='머그잔']"), "L2 개념 컷 로드");
  await cta(); // → contactGraphLab
  await clickSel(".cgl-btn");
  await W(6600);
  ok(await pickChoice(".cgl-q", "뜨거운 물에서 찬물로"), "열의 방향 판정");
  await W(1500);
  ok(await pickChoice(".cgl-q", "같아졌다"), "입자 판정");
  ok((await goalsOn()) === 3, "열량계 목표 3");
  ok(await ctaEnabled(), "열량계 CTA");
  await cta(); // → recap
  await cta(); // → binSort
  ok(await binSort([
    ["뜨거운 돌판 위에 올린 고기", 0], ["고기를 올린 뜨거운 돌판", 1], ["찬물에 담근 수박", 1],
    ["수박을 담근 찬물", 0], ["얼음 위에 올린 생선", 1], ["생선을 올린 얼음", 0],
  ]), "얻는 쪽/잃는 쪽 분류 good");
  ok(await quiz("mcq", 0), "그래프 옳지 않은 것");
  ok(await quiz("ox-x"), "열평형 입자 멈춤 ×");
  ok(await quiz("mcq", 0), "온도계 기다리는 까닭");
  ok(await quiz("mcq", [0, 1, 2]), "접촉 multi");
}

// ───────────────────────────── L3 ─────────────────────────────
console.log("L3 열의 이동, 세 가지 길");
{
  const meta = await openLesson(2);
  await W(700);
  ok(meta.steps === 13, `steps=${meta.steps}`);
  ok(await imgLoaded(".comic-art img"), "캠핑장 만화 컷 이미지 로드");
  for (let i = 0; i < 7; i++) await cta(); // 만화 7컷
  ok(await imgLoaded("img[alt*='숟가락']"), "L3 전도 개념 컷 로드");
  await cta(); // → rodRaceLab
  await clickSel(".rrl-btn");
  await W(5600);
  ok(await pickChoice(".rrl-q", "구리"), "빠른 막대 판정");
  await W(1500);
  ok(await pickChoice(".rrl-q", "제자리에서"), "전도 원리 판정");
  ok((await goalsOn()) === 3, "막대 경주 목표 3");
  ok(await ctaEnabled(), "막대 경주 CTA");
  await cta(); // → concept 대류·복사
  ok(await imgLoaded("img[alt*='온돌']"), "L3 대류 개념 컷 로드");
  await cta(); // → acPlaceLab
  await clickNth(".apl-choice", 1); // 난방기 바닥
  await W(3500);
  ok((await goalsOn()) === 1, "난방기 목표 점등");
  await clickNth(".apl-choice", 0); // 냉방기 천장
  await W(2900);
  ok(await pickChoice(".apl-q", "직접 이동"), "대류 원리 판정");
  ok((await goalsOn()) === 3, "냉난방기 목표 3");
  ok(await ctaEnabled(), "냉난방기 CTA");
  await cta(); // → figTabs 복사
  ok((await figTabsAll()) === 3, "복사 장면 3탭");
  ok(await ctaEnabled(), "figTabs CTA 개방");
  await cta(); // → recap
  await cta(); // → binSort
  ok(await binSort([
    ["뜨거운 국에 담근 금속 숟가락 손잡이가 뜨거워져요", 0], ["난로 가까이 있으면 얼굴이 따뜻해요", 2],
    ["냄비 아래를 가열하면 물 전체가 뜨거워져요", 1], ["에어컨을 켜면 방 전체가 시원해져요", 1],
    ["열화상 카메라로 사람의 체온을 재요", 2], ["쇠막대의 한쪽 끝을 데우면 반대쪽 끝도 뜨거워져요", 0],
  ]), "전도/대류/복사 분류 good");
  ok(await quiz("mcq", 1), "열화상 막대=(나)");
  ok(await quiz("mcq", 0), "전도 입자 설명");
  ok(await quiz("ox-x"), "복사 가려도 그대로 ×");
  ok(await quiz("mcq", 0), "온돌 ①②③");
  ok(await quiz("mcq", 0), "금속 난간(사진)");
}

// ───────────────────────────── L4 ─────────────────────────────
console.log("L4 비열, 온도가 잘 안 변하는 성질");
{
  const meta = await openLesson(3);
  await W(700);
  ok(meta.steps === 10, `steps=${meta.steps}`);
  await clickNth(".hk3-btn", 0); await W(500);
  await clickNth(".hk3-btn", 1); await W(1000);
  ok(await pickChoice("", "잘 변하지 않는"), "hotsand 예측");
  await cta(); // → heatRaceLab
  await clickSel(".hrl-btn");
  await W(5400);
  ok(await pickChoice(".hrl-q", "식용유"), "온도 변화 판정");
  await W(500);
  await clickSel(".hrl-btn"); // 불 끄고 식히기
  await W(5000);
  ok(await pickChoice(".hrl-q", "물"), "열량 판정");
  ok((await goalsOn()) === 3, "가열 레이스 목표 3");
  ok(await ctaEnabled(), "가열 레이스 CTA");
  await cta(); // → concept
  ok(await imgLoaded("img[alt*='냄비']"), "L4 개념 컷 로드");
  ok(await imgLoaded("img[alt*='뚝배기']"), "뚝배기 사진 로드");
  await cta(); // → recap
  await cta(); // → quizzes
  ok(await quiz("mcq", 0), "비열 정의");
  ok(await quiz("mcq", 0), "비열 큰 물질=(나)");
  ok(await quiz("ox-o"), "같은 물질 비열 같다 ○");
  ok(await quiz("mcq", 0), "뚝배기 까닭(사진)");
  ok(await binSort([
    ["음식을 오래 따뜻하게 담아 두는 뚝배기", 0], ["물을 빨리 끓이는 얇은 금속 냄비", 1],
    ["오랫동안 따뜻한 찜질 팩 속 물", 0], ["빨리 달궈지는 프라이팬", 1], ["체온을 일정하게 지켜 주는 몸속 물", 0],
  ]), "비열 큰/작은 분류 good");
  ok(await quiz("mcq", [0, 1, 2]), "물의 비열 multi");
}

// ───────────────────────────── L5 ─────────────────────────────
console.log("L5 열팽창, 늘어나는 입자의 거리");
{
  const meta = await openLesson(4);
  await W(700);
  ok(meta.steps === 12, `steps=${meta.steps}`);
  await clickSel(".hk3-lw");
  await W(1400);
  ok(await pickChoice("", "늘어나기 때문"), "livingwall 예측");
  await cta(); // → concept
  ok(await imgLoaded("img[alt*='뚜껑']"), "L5 개념 컷 로드");
  ok(await imgLoaded("img[alt*='전깃줄']"), "전깃줄 사진 로드");
  await cta(); // → figTabs 액체
  ok((await figTabsAll()) === 2, "액체 열팽창 2탭");
  await cta(); // → bimetalLab
  await W(800);
  ok(await pickChoice(".bml-q", "종이 쪽으로"), "테이프 예측");
  await clickSel(".bml-btn"); // 가열
  await W(3600);
  ok((await goalsOn()) === 1, "테이프 목표 점등");
  await clickSel(".bml-btn"); // 온도 올리기
  await W(1200);
  await clickSel(".bml-btn"); // 식히기
  await W(1400);
  ok(await pickChoice(".bml-q", "작은 금속 쪽"), "휘는 방향 판정");
  ok((await goalsOn()) === 3, "바이메탈 목표 3");
  ok(await ctaEnabled(), "바이메탈 CTA");
  await cta(); // → table
  ok(await imgLoaded("img[alt*='철로']"), "철로 사진 로드");
  await cta(); // → recap
  await cta(); // → quizzes
  ok(await quiz("mcq", 0), "열팽창 입자 설명");
  ok(await quiz("ox-x"), "입자 커진다 ×");
  ok(await quiz("mcq", 0), "바이메탈 ㉡");
  ok(await binSort([
    ["철로 이음새의 틈", 0], ["다리 중간의 이음매", 0], ["가스관의 구부러진 부분", 0],
    ["치아 충전재", 1], ["철근 콘크리트", 1], ["전기다리미의 바이메탈", 2], ["나무통을 조이는 금속 테", 2],
  ]), "열팽창 대비/비슷/이용 분류 good");
  ok(await quiz("mcq", [0, 1, 3]), "테이프 multi");
  ok(await quiz("mcq", 0), "병뚜껑");
}

console.log(`\nRESULT: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
