// 중2 IV 물질의 구성 — 6레슨 전 스텝 실플레이 E2E. node qa/e2e-g2u4.mjs (PORT 기본 5173)
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  // 앞 단원(중2 III까지) 완료 처리해 IV가 첫 미완료 단원이 되게
  ["g2u3l1","g2u3l2","g2u3l3","g2u3l4","g2u3l5","g2u3l6","g2u3l7","g2u3l8"].forEach((id) => lessons[id] = { done: true, acc: 95, bestXp: 120 });
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "중2", goalMin: 10, streak: 2,
    lastStudyDay: null, totalXp: 900, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const W = (ms) => page.waitForTimeout(ms);
const clickCTA = async (timeout = 16000) => {
  await page.waitForFunction(() => { const b = document.querySelector("button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector("button.cta").click());
  await W(560);
};
const clickBtn = async (re, wait = 400) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return b.textContent.trim().slice(0, 20); }
    return null;
  }, re);
  if (t === null) throw new Error(`clickBtn 실패: /${re}/`);
  await W(wait);
  return t;
};
const clickAll = async (re, wait = 320) => {
  // 같은 정규식에 맞는 버튼을 순차로 모두 클릭(세그/스텝 반복)
  let n = 0;
  for (let i = 0; i < 40; i++) {
    const ok = await page.evaluate((re) => {
      const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
      if (b) { b.click(); return true; }
      return false;
    }, re);
    if (!ok) break;
    n++; await W(wait);
  }
  return n;
};
const h1 = () => page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 30));
const hookChoice = async (idx) => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 9000 });
  await page.evaluate((idx) => document.querySelectorAll(".hook-choices.show .hook-choice")[idx].click(), idx);
  await W(360);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(220);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
const quiz = async (i) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await page.evaluate((i) => document.querySelectorAll(".opts .opt")[i].click(), i);
  await W(220); await clickCTA(); await sheetContinue();
};
const oxPick = async (v) => {
  await page.waitForSelector(".ox-btn", { timeout: 9000 });
  await page.evaluate((v) => document.querySelector(v ? ".ox-btn.o" : ".ox-btn.x").click(), v);
  await W(220); await clickCTA(); await sheetContinue();
};
const binSortAuto = async (pairs) => {
  await page.waitForSelector(".bin-chip", { timeout: 9000 });
  for (const [chipRe, binRe] of pairs) {
    const ok = await page.evaluate(([cRe, bRe]) => {
      const chip = [...document.querySelectorAll(".bin-tray .bin-chip")].find((c) => new RegExp(cRe).test(c.textContent));
      if (!chip) return `NO_CHIP ${cRe}`;
      chip.click();
      const bin = [...document.querySelectorAll(".bin")].find((b) => new RegExp(bRe).test(b.querySelector(".bin-label")?.textContent ?? ""));
      if (!bin) return `NO_BIN ${bRe}`;
      (bin.querySelector(".bin-head") ?? bin).click();
      return true;
    }, [chipRe, binRe]);
    if (ok !== true) throw new Error(`binSort: ${ok}`);
    await W(180);
  }
  await clickCTA(); await sheetContinue();
};
const orderAuto = async (res) => {
  for (const re of res) {
    await page.evaluate((re) => {
      const chip = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
        .find((x) => new RegExp(re).test(x.textContent) && !x.className.includes("cta"));
      chip?.click();
    }, re);
    await W(220);
  }
  await clickCTA(); await sheetContinue();
};
const segClick = async (txt) => {
  await page.evaluate((txt) => {
    const b = [...document.querySelectorAll(".stage-hud .seg button, .stage-seg button")].find((x) => x.textContent.trim() === txt);
    b?.click();
  }, txt);
  await W(450);
};
// 스테퍼(원자 조립소): 라벨 포함 행의 + 버튼을 n회
const stepPlus = async (labelRe, n) => {
  for (let i = 0; i < n; i++) {
    await page.evaluate((labelRe) => {
      const row = [...document.querySelectorAll(".ck-step")].find((r) => new RegExp(labelRe).test(r.querySelector("b")?.textContent ?? ""));
      const btns = row.querySelectorAll(".ck-btn");
      btns[btns.length - 1].click(); // + 는 마지막
    }, labelRe);
    await W(90);
  }
};

const openNextLesson = async () => {
  await page.evaluate(() => {
    const t = [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.includes("IV") && x.textContent.includes("중2"));
    (t ?? [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.includes("물질의 구성"))).click();
  });
  await W(650);
  await page.waitForSelector(".gm-node.now", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".gm-node.now").click());
  await W(850);
  console.log("[e2e] 레슨 진입 →", await h1());
};
const finishLesson = async () => {
  await page.waitForSelector(".done-title", { timeout: 12000 });
  console.log("  레슨 완료 OK");
  await clickBtn("홈으로", 850);
};

try {
  // ════ L1 원소와 화합물 ════
  await openNextLesson();
  await clickBtn("눌러서 확대", 400); // 첫 카드
  await page.evaluate(() => { const c = [...document.querySelectorAll(".hook-cup:not(.zoomed)")][0]; c?.click(); });
  await W(500);
  await clickCTA(); // 훅 → elementLab
  console.log("  elementLab:", await h1());
  // 구리(원소) 판정 → 물·염화나트륨(화합물)
  await clickBtn("원소다", 500);
  await segClick("물");
  await clickBtn("화합물이다", 500);
  await segClick("염화 나트륨");
  await clickBtn("화합물이다", 700);
  await clickCTA(); await clickCTA(); // recap → 문제
  await binSortAuto([["구리", "원소"], ["산소", "원소"], ["철", "원소"], ["물", "화합물"], ["이산화", "화합물"], ["염화", "화합물"]]);
  await quiz(2); await oxPick(true); await quiz(2);
  await finishLesson();

  // ════ L2 원소 기호와 화학식 ════
  await openNextLesson();
  await clickAll("무슨 뜻", 350); // 표지판 3개
  await clickCTA();
  console.log("  moleculeLab:", await h1());
  // H_2 → H_2O → CO_2
  await clickBtn("수소 .*넣기|H.*넣기", 600); await clickBtn("수소 .*넣기|H.*넣기", 1600); // H,H → 수소
  await clickBtn("수소 .*넣기|H.*넣기", 500); await clickBtn("수소 .*넣기|H.*넣기", 500); await clickBtn("산소 .*넣기|O.*넣기", 1700); // H,H,O → 물
  await clickBtn("탄소 .*넣기|C.*넣기", 500); await clickBtn("산소 .*넣기|O.*넣기", 500); await clickBtn("산소 .*넣기|O.*넣기", 1800); // C,O,O → CO2
  await clickCTA(); await clickCTA();
  await quiz(4); await quiz(1); await quiz(1); await oxPick(true);
  await finishLesson();

  // ════ L3 원자의 구조 ════
  await openNextLesson();
  await clickBtn("더 확대", 500); await clickBtn("더 확대", 700); // 3단 줌
  await hookChoice(0);
  await clickCTA();
  console.log("  atomLab:", await h1());
  await stepPlus("양성자", 1); await stepPlus("전자", 1); await W(700); // 수소
  await stepPlus("양성자", 5); await stepPlus("중성자", 6); await stepPlus("전자", 5); await W(700); // 탄소(6,6,6)
  await stepPlus("양성자", 2); await stepPlus("중성자", 2); await stepPlus("전자", 2); await W(800); // 산소(8,8,8)
  await clickCTA(); await clickCTA();
  await orderAuto(["양성자", "원자핵", "^원자$|원자$", "연필심"]);
  await quiz(4); await quiz(1); await oxPick(false);
  await finishLesson();

  // ════ L4 주기율표 ════
  await openNextLesson();
  await clickBtn("정리하기", 900);
  await clickCTA();
  console.log("  periodicLab:", await h1());
  // 9번(F), 1족(Li·Na·K), 18족(He·Ne·Ar) 셀 클릭
  const cell = async (sym) => { await page.evaluate((sym) => { const c = [...document.querySelectorAll(".pt-cell b")].find((b) => b.textContent === sym); c?.parentElement.click(); }, sym); await W(300); };
  await cell("F");
  await cell("Li"); await cell("Na"); await cell("K");
  await cell("He"); await cell("Ne"); await cell("Ar");
  await W(400);
  await clickCTA(); await clickCTA();
  await quiz(2); await quiz(1); await oxPick(false);
  await finishLesson();

  // ════ L5 원자·분자·이온 ════
  await openNextLesson();
  await clickBtn("한 모금", 1100);
  await hookChoice(0);
  await clickCTA();
  console.log("  moleculeLab(split):", await h1());
  // NH3 → H2O → split
  await clickBtn("질소 .*넣기|N.*넣기", 500); await clickBtn("수소 .*넣기|H.*넣기", 500); await clickBtn("수소 .*넣기|H.*넣기", 500); await clickBtn("수소 .*넣기|H.*넣기", 1700); // NH3
  await clickBtn("수소 .*넣기|H.*넣기", 500); await clickBtn("수소 .*넣기|H.*넣기", 500); await clickBtn("산소 .*넣기|O.*넣기", 1700); // H2O
  await clickBtn("쪼개기", 1800);
  await clickCTA();
  console.log("  ionLab:", await h1());
  await clickBtn("전자 1개 떼기", 700); // Na → Na+
  await segClick("염소");
  await clickBtn("전자 1개 붙이기", 700); // Cl → Cl-
  await segClick("산소");
  await clickBtn("전자 1개 붙이기", 500); await clickBtn("전자 1개 붙이기", 1000); // O → O2-
  await clickCTA(); await clickCTA();
  await binSortAuto([["금 ", "원자"], ["구리", "원자"], ["물 ", "분자"], ["이산화", "분자"], ["염화 나트륨", "이온"], ["칼슘", "이온"]]);
  // 문제: 4모델(구리=2) → Na⁺(1) → 분자 ㄱㄷ(2) → 이온생성 ㄱㄴ(2) → ox(false)
  await quiz(2); await quiz(1); await quiz(2); await quiz(2); await oxPick(false);
  await finishLesson();

  // ════ L6 이온의 이동 ════
  await openNextLesson();
  await clickBtn("가까이 밀기", 1000);
  await hookChoice(0);
  await clickCTA();
  console.log("  ionMoveLab:", await h1());
  await clickBtn("전류 켜기", 3800); // 구리 이온 (−)극 도달 대기(62px/s)
  await segClick("과망가니즈산 칼륨");
  await W(3800); // 보라 이온 (+)극 도달
  await clickBtn("극 바꾸기", 2600); // 반대 방향 이동 감지
  await clickBtn("보이지 않는 이온", 700);
  await W(500);
  await clickCTA(); await clickCTA();
  await quiz(0); await quiz(2); await oxPick(true);
  await finishLesson();

  console.log(`\n완주! 6레슨 전부 통과. pageerror=${pageErrors}`);
} catch (e) {
  console.log("\nE2E 실패:", e.message);
  console.log("현재 h1:", await h1());
  await page.screenshot({ path: "qa/e2e-g2u4-fail.png" });
  process.exitCode = 1;
} finally {
  await browser.close();
}
