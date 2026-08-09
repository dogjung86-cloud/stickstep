// 중1 Ⅱ v3(생물의 구성과 다양성 재제작) — 10레슨 실플레이 E2E.
// 훅 조작·랩 목표 3개 점등·CTA 개방·recap·전 문제 정답 시트까지 전부 실제 조작으로 확인한다.
// 레슨은 모듈 직접 import로 연다(스플래시 우회 불필요 — e2e-g2u6v2 문법).
//   PORT=5411 node qa/e2e-u2v3.mjs
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
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);

const W = (ms) => page.waitForTimeout(ms);
const A = ".screen.active";

const openLesson = (idx) =>
  page.evaluate(async (i) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { UNIT2_V3 } = await import("/src/content/unit2v3.ts");
    nav.go(createLessonPlayer(UNIT2_V3.lessons[i], { onExit: () => {}, onComplete: () => {} }));
    return { id: UNIT2_V3.lessons[i].id, steps: UNIT2_V3.lessons[i].steps.length };
  }, idx);

const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(520); };
const ctaEnabled = () => page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return !!b && !b.disabled; });
const goalsOn = () => page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
const helperHas = (t) => page.evaluate((x) => (document.querySelector(".screen.active .helper")?.textContent ?? "").includes(x), t);
const clickSel = async (sel) => { await page.evaluate((s) => { const el = document.querySelector(`.screen.active ${s}`); el?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, sel); };
const clickAll = async (sel, gap = 320) => {
  const n = await page.evaluate((s) => document.querySelectorAll(`.screen.active ${s}`).length, sel);
  for (let i = 0; i < n; i++) {
    await page.evaluate(({ s, i }) => {
      document.querySelectorAll(`.screen.active ${s}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, { s: sel, i });
    await W(gap);
  }
  return n;
};
/** 훅/랩 선택지(텍스트 포함 매칭) 클릭 — 등장 대기 폴링 포함. */
const pickChoice = async (scope, text, tries = 16) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate(({ scope, text }) => {
      const btns = [...document.querySelectorAll(`.screen.active ${scope} .hook-choice`)].filter((b) => !b.disabled);
      const b = btns.find((x) => x.textContent.includes(text));
      if (b) { b.click(); return true; }
      return false;
    }, { scope, text });
    if (done) { await W(420); return true; }
    await W(300);
  }
  return false;
};
/** 퀴즈 한 문제 — kind: mcq/multi/ox-o/ox-x, ans: 저작 인덱스(들). 정답 시트(good) 확인. */
const quiz = async (kind, ans) => {
  if (kind === "ox-o") await clickSel(".ox-btn.o");
  else if (kind === "ox-x") await clickSel(".ox-btn.x");
  else if (Array.isArray(ans)) { for (const i of ans) { await clickSel(`.opts .opt[data-oi="${i}"]`); await W(140); } }
  else await clickSel(`.opts .opt[data-oi="${ans}"]`);
  await W(230);
  await cta();
  await W(200);
  const good = await page.evaluate(() => [...document.querySelectorAll(".sheet")].some((s) => s.className.includes("open") && s.className.includes("good")));
  await page.evaluate(() => {
    const sheet = [...document.querySelectorAll(".sheet")].find((s) => s.className.includes("open"));
    [...(sheet?.querySelectorAll("button") ?? [])].pop()?.click();
  });
  await W(480);
  return good;
};
/** binSort 탭 폴백 — mapFn(칩 텍스트)→통 인덱스. 채점 시트 good 확인. */
const binSort = async (mapEntries) => {
  for (let i = 0; i < 24; i++) {
    const t = await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.textContent?.trim() ?? null);
    if (!t) break;
    const bi = mapEntries.find(([k]) => t.includes(k))?.[1] ?? 0;
    await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.click());
    await W(130);
    await page.evaluate((b) => document.querySelectorAll(".screen.active .bin")[b]?.click(), bi);
    await W(150);
  }
  await cta();
  await W(200);
  const good = await page.evaluate(() => [...document.querySelectorAll(".sheet")].some((s) => s.className.includes("open") && s.className.includes("good")));
  await page.evaluate(() => {
    const sheet = [...document.querySelectorAll(".sheet")].find((s) => s.className.includes("open"));
    [...(sheet?.querySelectorAll("button") ?? [])].pop()?.click();
  });
  await W(480);
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
  const good = await page.evaluate(() => [...document.querySelectorAll(".sheet")].some((s) => s.className.includes("open") && s.className.includes("good")));
  await page.evaluate(() => {
    const sheet = [...document.querySelectorAll(".sheet")].find((s) => s.className.includes("open"));
    [...(sheet?.querySelectorAll("button") ?? [])].pop()?.click();
  });
  await W(480);
  return good;
};
const imgLoaded = (sel) => page.evaluate((s) => {
  const img = document.querySelector(`.screen.active ${s}`);
  return !!img && img.complete && img.naturalWidth > 0;
}, sel);

// ───────────────────────────── L1 ─────────────────────────────
console.log("L1 세포, 생명의 기본 단위");
{
  const meta = await openLesson(0);
  await W(700);
  ok(meta.steps === 10, `steps=${meta.steps}`);
  ok(await imgLoaded(".comic-art img"), "만화 컷 이미지 로드");
  for (let i = 0; i < 7; i++) await cta(); // 만화 7컷
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .zrl-mag")][1]?.click()); await W(500);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .zrl-mag")][2]?.click()); await W(500);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .zrl-mag")][3]?.click()); await W(650);
  await pickChoice(".zrl-q", "머리카락");
  ok((await goalsOn()) === 3, "줌 사다리 목표 3");
  ok(await ctaEnabled(), "랩 CTA 개방");
  await cta(); // → concept
  await cta(); // → recap
  await cta(); // → binSort
  ok(await binSort([["민들레", 0], ["꿀벌", 0], ["버섯", 0], ["사람", 0], ["돌멩이", 1], ["빗물", 1], ["로봇", 1], ["소금", 1]]), "생물/무생물 분류 good");
  ok(await quiz("ox-o"), "ox 모든 생물 세포");
  ok(await quiz("mcq", 0), "훅=코르크");
  ok(await quiz("mcq", 3), "크기 사다리 (라)");
  ok(await quiz("mcq", 0), "µm 정의");
  ok(await quiz("mcq", 0), "작은 방 정체");
}

// ───────────────────────────── L2 ─────────────────────────────
console.log("L2 세포의 구조");
{
  await openLesson(1);
  await W(700);
  await clickAll(".hb4-bf-room", 320);
  await pickChoice("", "부품들이");
  ok(await ctaEnabled(), "빵 공장 훅 완료");
  await cta(); // concept1
  await cta(); // hotspot 동물
  ok((await clickAll("button.hs-dot", 380)) === 3, "동물세포 스팟 3");
  ok(await ctaEnabled(), "동물 핫스팟 CTA");
  await cta(); // concept2
  await cta(); // hotspot 식물
  ok((await clickAll("button.hs-dot", 340)) === 5, "식물세포 스팟 5");
  await cta(); // pairMatch
  for (const [a, b] of [["출입문과 벽", "세포막"], ["중앙 통제실", "핵"], ["발전기", "마이토콘드리아"], ["지붕의 태양 전지판", "엽록체"], ["바깥 담장", "세포벽"]]) {
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .pm-chip.pm-a")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(); }, a);
    await W(200);
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .pm-chip.pm-b")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(); }, b);
    await W(340);
  }
  await W(600);
  await cta();
  await W(400);
  await page.evaluate(() => {
    const sheet = [...document.querySelectorAll(".sheet")].find((s) => s.className.includes("open"));
    [...(sheet?.querySelectorAll("button") ?? [])].pop()?.click();
  });
  await W(500);
  await cta(); // recap → 문제
  ok(await quiz("mcq", 0), "핵 정의");
  ok(await quiz("mcq", 0), "(가)(나) 판별 근거");
  ok(await quiz("multi", [0, 1]), "식물 전용 2종");
  ok(await quiz("ox-x"), "미토 광합성 ×");
  ok(await quiz("mcq", 0), "출입 조절=세포막");
}

// ───────────────────────────── L3 ─────────────────────────────
console.log("L3 현미경으로 직접 보기");
{
  await openLesson(2);
  await W(700);
  await clickSel(".hb4-wl");
  await pickChoice("", "현미경");
  await cta(); // → lab
  const tool = (i) => page.evaluate((k) => [...document.querySelectorAll(".screen.active .smk-tool")][k]?.click(), i);
  await tool(0); await W(350);
  await tool(1); await W(400);
  await pickChoice(".smk-ask", "물들인다"); await W(600);
  await tool(2); await W(400);
  await pickChoice(".smk-ask", "비스듬히"); await W(900);
  await tool(3); await W(1600);
  const setFocus = (v) => page.evaluate((x) => {
    const f = document.querySelector(".screen.active .smk-focus");
    f.value = String(x);
    f.dispatchEvent(new Event("input", { bubbles: true }));
  }, v);
  await setFocus(68); await W(700);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .smk-seg")][1]?.click()); await W(350);
  await setFocus(38); await W(800);
  await W(900);
  await pickChoice("", "검정말잎 세포에만");
  ok((await goalsOn()) === 3, "표본 랩 목표 3");
  ok(await ctaEnabled(), "표본 랩 CTA");
  await cta(); // concept
  await cta(); // recap
  await cta(); // order
  ok(await orderChips(["면봉", "메틸렌", "덮개", "거름종이"]), "표본 순서 good");
  ok(await quiz("mcq", 0), "염색 까닭");
  ok(await quiz("mcq", 0), "기포 실수");
  ok(await quiz("mcq", 0), "(나)=검정말 근거");
  ok(await quiz("ox-o"), "메틸렌 블루 푸른색");
  ok(await quiz("mcq", 0), "아세트올세인 기다림");
}

// ───────────────────────────── L4 ─────────────────────────────
console.log("L4 모양이 다른 세포들");
{
  await openLesson(3);
  await W(700);
  await clickSel(".hb4-bd");
  await pickChoice("", "원반 모양의 세포");
  await cta(); // → lab
  const card = (k) => page.evaluate((x) => document.querySelector(`.screen.active .sjb-card[data-k="${x}"]`)?.click(), k);
  await card("nerve"); await W(2400);
  await card("rbc"); await W(2400);
  await card("epi"); await W(2400);
  ok((await goalsOn()) === 3, "채용 미션 3");
  ok(await ctaEnabled(), "채용 랩 CTA");
  await cta(); // concept
  await cta(); // recap
  await cta(); // binSort
  ok(await binSort([["가늘고", 0], ["신호", 0], ["오목한", 1], ["산소", 1], ["납작", 2], ["표면", 2]]), "특징 배달 good");
  ok(await quiz("mcq", 0), "(가)~(다) 짝");
  ok(await quiz("ox-x"), "모양 모두 같다 ×");
  ok(await quiz("mcq", 0), "적혈구 모양");
}

// ───────────────────────────── L5 ─────────────────────────────
console.log("L5 생물의 구성 단계");
{
  await openLesson(4);
  await W(700);
  await clickSel(".hb4-bh"); await W(500);
  await clickSel(".hb4-bh"); await W(1500);
  await pickChoice("", "비슷한 세포끼리");
  await cta(); // → lab
  const pickCard = async (name) => {
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .lsk-card")].find((c) => c.textContent.includes(t))?.click(); }, name);
    await W(320);
  };
  for (const n of ["근육세포", "근육조직", "심장", "순환계", "사람"]) await pickCard(n);
  await W(1900);
  for (const n of ["잎살세포", "울타리조직", "기본조직계", "잎", "나무"]) await pickCard(n);
  await W(1100);
  await pickChoice(".lsk-ask", "조직계");
  ok((await goalsOn()) === 3, "계단 목표 3");
  ok(await ctaEnabled(), "계단 랩 CTA");
  await cta(); // concept
  await cta(); // recap
  await cta(); // order
  ok(await orderChips(["상피세포", "상피조직", "위", "소화계", "개체"]), "동물 단계 order good");
  ok(await quiz("mcq", 0), "학년=기관");
  ok(await quiz("mcq", 0), "(가)조직계 (나)기관계");
  ok(await quiz("ox-x"), "식물 기관계 ×");
  ok(await quiz("mcq", 0), "옳지 않은 것=조직계");
}

// ───────────────────────────── L6 ─────────────────────────────
console.log("L6 생물다양성, 세 가지 눈금");
{
  await openLesson(5);
  await W(700);
  await clickAll(".dk-spot", 320);
  await pickChoice("", "1,000종");
  await cta(); // → lab
  const lens = (i) => page.evaluate((k) => [...document.querySelectorAll(".screen.active .ecs-lens")][k]?.click(), i);
  const region = (i) => page.evaluate((k) => [...document.querySelectorAll(".screen.active .ecs-region")][k]?.click(), i);
  await lens(0); await W(400); await region(1); await W(1100);
  await lens(1); await W(400); await region(1); await W(1100);
  await lens(2); await W(650);
  await clickAll(".ecs-vary > g", 320);
  await W(1200);
  await pickChoice(".ecs-ask", "모두 다양해서");
  ok((await goalsOn()) === 3, "눈금 목표 3");
  ok(await ctaEnabled(), "검사관 CTA");
  await cta(); // concept
  await cta(); // recap
  await cta(); // multi
  ok(await quiz("multi", [0, 1, 2]), "다양성 포함 3종");
  ok(await quiz("mcq", 0), "습지 (가) 높음");
  ok(await quiz("ox-o"), "유지 조건 ox");
  ok(await quiz("mcq", 0), "얼룩말=변이");
}

// ───────────────────────────── L7 ─────────────────────────────
console.log("L7 변이, 그리고 살아남는 것들");
{
  await openLesson(6);
  await W(700);
  ok(await imgLoaded(".comic-art img"), "다윈 만화 이미지 로드");
  for (let i = 0; i < 7; i++) await cta();
  await cta(); // concept → lab
  await W(900);
  await pickChoice(".bkl-ask", "두꺼운 부리");
  await W(500);
  for (let g = 0; g < 3; g++) { await clickSel(".bkl-gen"); await W(520); }
  const chips = await page.evaluate(() => [...document.querySelectorAll(".screen.active .bkl-chip b")].map((b) => b.textContent).join(","));
  // counterA(섬 가: 두꺼운·가는·짧은) + counterB(섬 나) — (가)=14,0,0 · (나)=0,14,0
  ok(chips === "14,0,0,0,14,0", `세대 수치 검산(${chips})`);
  await W(1300);
  await pickChoice(".bkl-ask", "나뉠 수 있다");
  ok((await goalsOn()) === 3, "두 섬 목표 3");
  ok(await ctaEnabled(), "두 섬 CTA");
  await cta(); // recap
  await cta(); // multi
  ok(await quiz("multi", [0, 1]), "변이의 예 2");
  ok(await quiz("mcq", 0), "거북 목 길이");
  ok(await quiz("ox-o"), "변이=다양화 원인");
  ok(await quiz("mcq", 0), "과정(라마르크 격파)");
  ok(await quiz("mcq", 0), "빈칸=변이");
}

// ───────────────────────────── L8 ─────────────────────────────
console.log("L8 생물을 나누는 기준");
{
  await openLesson(7);
  await W(700);
  const shelf = (i) => page.evaluate((k) => {
    [...document.querySelectorAll(".screen.active .ms-shelf")][k]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, i);
  await shelf(0); await W(600);
  await shelf(1); await W(1700);
  await pickChoice("", "고유의 특징");
  await cta(); // → lab
  for (let i = 0; i < 3; i++) {
    await page.evaluate((k) => [...document.querySelectorAll(".screen.active .grl-rule")][k]?.click(), i);
    await W(1250);
  }
  await W(900);
  await pickChoice(".grl-ask", "고유한 특징");
  ok((await goalsOn()) === 3, "스위치 목표 3");
  ok(await ctaEnabled(), "스위치 CTA");
  await cta(); // concept1
  await cta(); // concept2
  await cta(); // recap
  await cta(); // order
  ok(await orderChips(["종", "속", "과", "목", "강", "문", "계"]), "종속과목강문계 good");
  ok(await quiz("mcq", 0), "박쥐 근거");
  ok(await quiz("mcq", 0), "노새=번식 능력 ×");
  ok(await quiz("ox-o"), "기본 단위=종");
  ok(await quiz("mcq", 0), "(가)속 (나)계");
}

// ───────────────────────────── L9 ─────────────────────────────
console.log("L9 다섯 개의 왕국, 5계");
{
  await openLesson(8);
  await W(700);
  await clickSel(".hb4-mr");
  await pickChoice("", "광합성");
  await cta(); // → lab
  const yes = () => page.evaluate(() => document.querySelector(".screen.active .kgt-ans.yes")?.click());
  const no = () => page.evaluate(() => document.querySelector(".screen.active .kgt-ans.no")?.click());
  const PATHS = [["no"], ["yes", "yes"], ["yes", "no", "yes"], ["yes", "no", "no", "yes"], ["yes", "no", "no", "no"]];
  for (const path of PATHS) {
    for (const s of path) { await (s === "yes" ? yes() : no()); await W(340); }
    await W(1600);
  }
  await W(1000);
  const rooms = await page.evaluate(() => document.querySelectorAll(".screen.active .kgt-room.filled").length);
  ok(rooms === 5, `다섯 방 채움(${rooms})`);
  ok((await goalsOn()) === 3, "검색표 목표 3");
  ok(await ctaEnabled(), "검색표 CTA");
  await cta(); // concept
  await cta(); // recap
  await cta(); // binSort
  ok(await binSort([["젖산균", 0], ["포도상구균", 0], ["짚신벌레", 1], ["해캄", 1], ["곰팡이", 2], ["효모", 2], ["고사리", 3], ["진달래", 3], ["붕어", 4], ["꿀벌", 4]]), "왕국 배정 good");
  ok(await quiz("mcq", 0), "균계 공통 특징");
  ok(await quiz("mcq", 0), "원생생물계 정의");
  ok(await quiz("ox-o"), "원핵=핵막 없음");
  ok(await quiz("mcq", 0), "추리=균계");
}

// ───────────────────────────── L10 ─────────────────────────────
console.log("L10 생물다양성을 지켜라");
{
  await openLesson(9);
  await W(700);
  await clickSel(".bg-switch");
  await pickChoice("", "꽃가루");
  await cta(); // → lab
  await page.evaluate(() => {
    [...document.querySelectorAll(".screen.active .wdp-web")][0]?.querySelector('[data-n="hawk"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await W(450);
  await page.evaluate(() => {
    [...document.querySelectorAll(".screen.active .wdp-web")][1]?.querySelector('[data-n="hawk"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await W(1300);
  await pickChoice(".wdp-ask", "유일한 먹이");
  await W(500);
  await clickSel(".wdp-drop");
  await W(2700);
  await pickChoice(".wdp-ask", "대신할 수 있는");
  ok((await goalsOn()) === 3, "먹이 그물 목표 3");
  ok(await ctaEnabled(), "먹이 그물 CTA");
  await cta(); // concept
  await cta(); // recap
  await cta(); // binSort
  ok(await binSort([["도로", 0], ["채집", 0], ["외래생물", 0], ["오염", 0], ["생태통로", 1], ["협약", 1], ["걸어가기", 1], ["나눔", 1]]), "원인/방안 good");
  ok(await quiz("mcq", 0), "생태통로 목적");
  ok(await quiz("multi", [0, 1, 2]), "혜택 3종");
  ok(await quiz("ox-o"), "높으면 안정 ox");
  ok(await quiz("mcq", 0), "큰입배스 까닭");
  ok(await quiz("mcq", 0), "최대 원인=서식지파괴");
}

console.log(`\nRESULT: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
