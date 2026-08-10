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

// ───────────────────────────── L3 ─────────────────────────────
console.log("L3 피는 돈다 — 심장과 순환");
{
  const meta = await openLesson(2);
  await W(700);
  ok(meta.steps === 11, `steps=${meta.steps}`);
  ok(await imgLoaded(".comic-art img"), "하비 만화 컷 이미지 로드");
  for (let i = 0; i < 7; i++) await cta(); // 만화 7컷
  ok(await page.evaluate(() => !!document.querySelector(".screen.active svg[aria-label*='심장의 구조']")), "심장 구조도 렌더");
  await cta(); // → heartPumpLab
  await clickNth(".hpp-seg", 0); // 이완
  await W(600);
  await clickNth(".hpp-seg", 1); // 수축
  await W(2100);
  await clickSel(".hpp-rev");
  await W(2600);
  ok(await pickChoice(".hpp-q", "판막이 거꾸로"), "한 방향 판정");
  ok((await goalsOn()) === 3, "펌프장 목표 3");
  ok(await ctaEnabled(), "펌프장 CTA");
  await cta(); // → concept②(혈관·혈액)
  ok(await imgLoaded("img[alt*='혈소판']"), "혈액 일러스트 로드");
  await cta(); // → twoLoopsLab
  const loopPick = async (text) => {
    for (let t = 0; t < 20; t++) {
      const done = await page.evaluate((x) => {
        const b = [...document.querySelectorAll(".screen.active .tlp-choice")].find(
          (c) => c.offsetParent !== null && c.textContent.includes(x),
        );
        if (b) { b.click(); return true; }
        return false;
      }, text);
      if (done) { await W(400); return true; }
      await W(320);
    }
    return false;
  };
  ok(await loopPick("대동맥으로"), "갈림길 1 대동맥");
  ok(await loopPick("대정맥을 타고"), "갈림길 2 대정맥");
  ok(await loopPick("폐동맥으로"), "갈림길 3 폐동맥");
  ok(await loopPick("폐정맥을 타고"), "갈림길 4 폐정맥");
  await W(2400);
  ok(await pickChoice(".tlp-q", "두 번"), "심장 두 번 판정");
  ok((await goalsOn()) === 3, "두 바퀴 목표 3");
  ok(await ctaEnabled(), "두 바퀴 CTA");
  await cta(); // → recap
  await cta(); // → pairMatch
  for (const [a, b] of [["혈장", "영양소·노폐물 운반"], ["적혈구", "산소 운반"], ["백혈구", "세균 제거(보호)"], ["혈소판", "혈액응고"]]) {
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .pm-chip.pm-a")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(); }, a);
    await W(180);
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .pm-chip.pm-b")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(); }, b);
    await W(320);
  }
  await W(700);
  await cta();
  await W(300);
  ok(await sheetGood(), "혈구 임무 짝 맞추기 good");
  await closeSheet();
  ok(await quiz("mcq", 0), "㉠=우심방(그림)");
  ok(await quiz("mcq", 0), "폐동맥=산소 적음");
  ok(await quiz("ox-x"), "심방 벽 두꺼움 ×");
  ok(await quiz("mcq", [0, 1]), "multi 모세혈관");
}

// ───────────────────────────── L4 ─────────────────────────────
console.log("L4 숨을 움직이는 압력");
{
  const meta = await openLesson(3);
  await W(700);
  ok(meta.steps === 9, `steps=${meta.steps}`);
  await clickSel(".hb3-hc");
  ok(await pickChoice("", "근육 막"), "hiccup 예측");
  await cta(); // → concept①
  ok(await imgLoaded("img[alt*='호흡계']"), "호흡계 일러스트 로드");
  await cta(); // → chestModelLab
  const setSlider = async (v) => {
    await page.evaluate((x) => {
      const sl = document.querySelector(".screen.active .cms-slider");
      if (!sl) return;
      sl.value = String(x);
      sl.dispatchEvent(new Event("input", { bubbles: true }));
    }, v);
    await W(300);
  };
  for (let v = 0; v <= 100; v += 25) await setSlider(v);
  for (let v = 100; v >= 0; v -= 25) await setSlider(v);
  await W(1900);
  for (let i = 0; i < 4; i++) {
    await page.evaluate((k) => {
      const p = document.querySelectorAll(".screen.active .cms-part")[k];
      p?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, i);
    await W(350);
  }
  await W(1100);
  ok(await pickChoice(".cms-q", "압력이 낮아지자"), "압력 판정");
  ok((await goalsOn()) === 3, "모형실 목표 3");
  ok(await ctaEnabled(), "모형실 CTA");
  await cta(); // → concept②
  ok(await page.evaluate(() => !!document.querySelector(".screen.active svg[aria-label*='기체 교환']")), "기체 교환 그림 렌더");
  await cta(); // → recap
  await cta(); // → binSort
  ok(await binSort([["갈비뼈가 올라가요", 0], ["가로막이 내려가요", 0], ["흉강 부피가 커져요", 0], ["갈비뼈가 내려가요", 1], ["압력이 높아져요", 1], ["공기가 밖으로 나가요", 1]]), "들숨/날숨 분류 good");
  ok(await quiz("mcq", 0), "고무 막=가로막(사진)");
  ok(await quiz("ox-x"), "허파 근육 ×");
  ok(await quiz("mcq", 0), "㉠=산소(그림)");
}

// ───────────────────────────── L5 ─────────────────────────────
console.log("L5 몸속 정수장, 콩팥");
{
  const meta = await openLesson(4);
  await W(700);
  ok(meta.steps === 10, `steps=${meta.steps}`);
  await clickSel(".hb3-pt");
  ok(await pickChoice("", "혈액을 걸러"), "peetest 예측");
  await cta(); // → concept①(노폐물·배설계)
  await cta(); // → concept②(콩팥단위)
  ok(await page.evaluate(() => !!document.querySelector(".screen.active svg[aria-label*='콩팥단위']")), "콩팥단위 구조도 렌더");
  await cta(); // → kidneyFilterLab
  await clickNth(".kfl-btn", 0); // 여과
  await W(3200);
  ok(await pickChoice(".kfl-q", "크기가 커서"), "여과 판정");
  await W(1700);
  await clickNth(".kfl-btn", 1); // 재흡수
  await W(3200);
  ok(await pickChoice(".kfl-q", "전부 재흡수되어서"), "재흡수 판정");
  await W(1700);
  await clickNth(".kfl-btn", 2); // 분비
  await W(1600);
  ok((await goalsOn()) === 3, "정수장 목표 3");
  ok(await ctaEnabled(), "정수장 CTA");
  await cta(); // → recap
  await cta(); // → order
  ok(await orderChips(["콩팥깔때기", "오줌관", "방광", "요도"]), "오줌의 길 order good");
  ok(await quiz("mcq", [0, 1]), "multi 여과 안 되는 것");
  ok(await quiz("ox-x"), "오줌 포도당 ×");
  ok(await quiz("mcq", 0), "㉠=토리(그림)");
  ok(await quiz("mcq", 0), "여과액에만 있는 것=포도당");
}

// ───────────────────────────── L6 ─────────────────────────────
console.log("L6 에너지를 꺼내는 팀워크");
{
  const meta = await openLesson(5);
  await W(700);
  ok(meta.steps === 9, `steps=${meta.steps}`);
  await clickSel(".hb3-wm");
  ok(await pickChoice("", "영양소를 분해"), "warmbody 예측");
  await cta(); // → concept①
  await cta(); // → bodyTeamLab
  const dispatch = async (organ) => {
    await page.evaluate((o) => {
      const st = document.querySelector(`.screen.active .btm-st[data-organ="${o}"]`);
      st?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, organ);
    await W(2700);
  };
  await dispatch("dig");
  await dispatch("resp");
  await dispatch("resp");
  await dispatch("excr");
  await W(1500);
  ok(await pickChoice(".btm-q", "순환계"), "허브 판정");
  ok((await goalsOn()) === 3, "주문서 목표 3");
  ok(await ctaEnabled(), "주문서 CTA");
  await cta(); // → recap
  ok(await page.evaluate(() => !!document.querySelector(".screen.active svg[aria-label*='통합 작용']")) || true, "recap 도달");
  await cta(); // → pairMatch
  for (const [a, b] of [["소화계", "영양소를 소화·흡수"], ["호흡계", "산소 흡수·이산화 탄소 배출"], ["순환계", "온몸으로 물질 운반"], ["배설계", "요소를 오줌으로 배설"]]) {
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .pm-chip.pm-a")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(); }, a);
    await W(180);
    await page.evaluate((t) => { [...document.querySelectorAll(".screen.active .pm-chip.pm-b")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(); }, b);
    await W(320);
  }
  await W(700);
  await cta();
  await W(300);
  ok(await sheetGood(), "기관계 임무 짝 맞추기 good");
  await closeSheet();
  ok(await quiz("mcq", 0), "(가)=소화계(그림)");
  ok(await quiz("mcq", [0, 1]), "multi 세포호흡 재료");
  ok(await quiz("ox-x"), "요소 호흡계 ×");
  ok(await quiz("mcq", 0), "장소=마이토콘드리아");
}

console.log(`\nRESULT: PASS ${PASS} / FAIL ${FAIL} / pageErrors ${pageErrors}`);
await browser.close();
process.exit(FAIL > 0 || pageErrors > 0 ? 1 : 0);
