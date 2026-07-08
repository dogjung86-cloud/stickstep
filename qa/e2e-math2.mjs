// 중1 수학 Ⅱ 문자와 식 — 9레슨 전 스텝 실플레이 E2E. node qa/e2e-math2.mjs (PORT 기본 5173)
// 훅 9장면·랩 7종(패턴·대입·해부·동류항·등식표·저울·이항)·넘패드 드릴·퀴즈 전 유형.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  for (let i = 1; i <= 12; i++) lessons[`m1u1l${i}`] = { done: true, acc: 95, bestXp: 120 };
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 1200, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".step .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 34));
const clickCTA = async (timeout = 20000) => {
  await page.waitForFunction(() => { const b = document.querySelector("button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector("button.cta").click());
  await W(560);
};
const clickBtn = async (re, wait = 420) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (!t) throw new Error(`clickBtn 실패: /${re}/ @ ${await h1()}`);
  await W(wait);
};
const waitBtn = async (re, wait = 420, timeout = 16000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 14000 });
  await page.evaluate(() => document.querySelector(".hook-choices.show .hook-choice").click());
  await W(420);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(240);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
const quiz = async (i) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await page.evaluate((i) => document.querySelectorAll(".opts .opt")[i].click(), i);
  await W(220); await clickCTA(); await sheetContinue();
};
const multiQuiz = async (idxs) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  for (const i of idxs) { await page.evaluate((i) => document.querySelectorAll(".opts .opt")[i].click(), i); await W(160); }
  await clickCTA(); await sheetContinue();
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
    await W(200);
  }
  await clickCTA(); await sheetContinue();
};
const pairMatchAuto = async (pairs) => {
  await page.waitForSelector(".pm-chip", { timeout: 9000 });
  for (const [aRe, bRe] of pairs) {
    await page.evaluate(([aRe, bRe]) => {
      const a = [...document.querySelectorAll(".pm-chip.pm-a")].find((c) => new RegExp(aRe).test(c.textContent) && !c.disabled);
      a?.click();
      const b = [...document.querySelectorAll(".pm-chip.pm-b")].find((c) => new RegExp(bRe).test(c.textContent) && !c.disabled);
      b?.click();
    }, [aRe, bRe]);
    await W(320);
  }
  await sheetContinue();
};
const npKey = async (label) => {
  await page.evaluate((label) => {
    const k = [...document.querySelectorAll(".mnp-k")].find((x) => x.textContent.trim() === label && !x.disabled);
    if (!k) throw new Error(`no key ${label}`);
    k.click();
  }, label);
  await W(70);
};
const typeAns = async (ans) => {
  const s = String(ans);
  if (s.startsWith("-")) await npKey("+/−");
  for (const ch of s.replace(/^-/, "")) {
    if (ch === "/") await npKey("↓ 분모");
    else if (ch === ".") await npKey("·");
    else await npKey(ch);
  }
};
const drillAnswer = async (ans) => {
  await typeAns(ans);
  await clickCTA();
  await W(1050);
};
const drill = async (answers) => {
  await page.waitForSelector(".mdr-q", { timeout: 9000 });
  for (const a of answers) await drillAnswer(a);
  await clickCTA();
};
const openLesson = async (labelRe) => {
  await page.waitForSelector(".gm-node", { timeout: 9000 });
  const ok = await page.evaluate((re) => {
    const n = [...document.querySelectorAll(".gm-node")].find((x) => new RegExp(re).test(x.getAttribute("aria-label") ?? ""));
    if (!n) return false;
    n.click();
    return true;
  }, labelRe);
  if (!ok) throw new Error(`레슨 노드 없음: ${labelRe}`);
  await W(900);
};
// 탭-탭 조작(칩·조각·행): 셀렉터+텍스트 정확 매칭 요소에 pointerdown/up 디스패치
const tapEl = async (sel, exact = null, re = null) => {
  const ok = await page.evaluate(([sel, exact, re]) => {
    const norm = (t) => t.replace(/\s+/g, "").trim();
    const list = [...document.querySelectorAll(sel)].filter((x) => x.offsetParent);
    const t = list.find((x) => (exact ? norm(x.textContent) === norm(exact) : new RegExp(re).test(x.textContent)));
    if (!t) return false;
    const r = t.getBoundingClientRect();
    const o = { bubbles: true, pointerId: 31, isPrimary: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
    t.dispatchEvent(new PointerEvent("pointerdown", o));
    t.dispatchEvent(new PointerEvent("pointerup", o));
    t.click?.();
    return true;
  }, [sel, exact, re]);
  if (!ok) throw new Error(`tapEl 실패: ${sel} ${exact ?? re} @ ${await h1()}`);
  await W(300);
};
const pickChoice = async (re) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll(".pt-choice")].some((b) => b.offsetParent && new RegExp(re).test(b.textContent)),
    re,
    { timeout: 12000 },
  );
  await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".pt-choice")].find((x) => x.offsetParent && new RegExp(re).test(x.textContent));
    b?.click();
  }, re);
  await W(650);
};

const log = (m) => console.log("  ·", m);
console.log("=== 중1 수학 Ⅱ e2e 시작 ===");

// 홈: Ⅱ 단원 탭으로
await page.waitForSelector(".unit-tab", { timeout: 9000 });
await clickBtn("II\\. 문자와 식", 700);
await shot("math2-home");

/* ================= L1 문자 ================= */
await openLesson("문자 사용");
log(`L1: ${await h1()}`);
await waitBtn("병 넣기", 800);
await clickBtn("병 넣기", 800);
await clickBtn("병 넣기", 900);
await hookChoice();
await clickCTA();
// patternRule
await page.waitForSelector(".sd-stage, .mboard", { timeout: 9000 });
await waitBtn("하나 더", 900);
await clickBtn("하나 더", 900);
await clickBtn("하나 더", 1100);
await pickChoice("^11$");
await W(1200);
await pickChoice("2a\\+1");
await W(900);
await page.waitForSelector(".mnp-k", { timeout: 9000 });
await typeAns(201);
await waitBtn("^확인하기$", 900);
await W(700);
await shot("math2-l1-pattern");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([21, 250, 8, 130, 201]);
await clickBtn("홈으로", 900).catch(() => {});
log("L1 완료");

/* ================= L2 기호 생략 ================= */
await openLesson("기호 생략");
log(`L2: ${await h1()}`);
await waitBtn("원래 말", 1000);
await hookChoice();
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await binSortAuto([
  ["b×a", "옳"], ["0\\.1×a", "틀"], ["\\(a\\+1\\)×2", "옳"], ["a×\\(−4\\)", "틀"], ["a×a", "옳"], ["2\\+3×a", "틀"],
]);
await pairMatchAuto([["4×x×y", "4xy"], ["\\(−1\\)×b×a", "−ab"], ["a÷5", "a/5"], ["a×3−7÷b", "3a−7/b"]]);
await clickBtn("홈으로", 900).catch(() => {});
log("L2 완료");

/* ================= L3 대입 ================= */
await openLesson("^대입");
log(`L3: ${await h1()}`);
await waitBtn("170", 700).catch(async () => { await waitBtn("cm", 700); });
await waitBtn("160", 700).catch(() => {});
await hookChoice();
await clickCTA();
// substLab: 양수 대입 → 음수 대입 → 3번식 음수 대입
await page.waitForSelector(".sd-step", { timeout: 9000 });
await clickBtn("^\\+$", 260).catch(() => {});
await clickBtn("^\\+$", 260).catch(() => {});
await waitBtn("대입", 1500);
for (let i = 0; i < 6; i++) await clickBtn("^−$", 200).catch(() => {});
await clickBtn("대입", 1500);
await tapEl(".nl-card", null, "\\(−x\\)"); // 3번째 식
await W(400);
await clickBtn("대입", 1600);
await W(700);
await shot("math2-l3-subst");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await oxPick(false);
await quiz(0);
await drill([7, 20, -6, 27, 6, 69.7]);
await clickBtn("홈으로", 900).catch(() => {});
log("L3 완료");

/* ================= L4 식의 해부 ================= */
await openLesson("일차식");
log(`L4: ${await h1()}`);
await waitBtn("마카롱", 600);
for (let i = 0; i < 5; i++) await clickBtn("마카롱", 550).catch(() => {});
await hookChoice();
await clickCTA();
// exprAnatomy
await page.waitForSelector(".nl-card", { timeout: 9000 });
await tapEl(".nl-card", "6x");
await tapEl(".nl-card", "10");
await W(600);
await tapEl(".nl-card", "10"); // 상수항
await W(600);
await tapEl(".nl-card", "6x"); // 계수
await W(2500); // 2단계(3x−2) 전환 대기
await tapEl(".nl-card", "3x"); // 항 1
await W(500);
await tapEl(".nl-card", "2"); // 함정 → 교정 토스트 + [−2] 합체
await W(1600);
await tapEl(".nl-card", "−2").catch(async () => { await tapEl(".nl-card", null, "−\\s*2"); });
await W(1000);
await pickChoice("^1$");
await W(900);
await shot("math2-l4-anatomy");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await multiQuiz([0, 1]);
await oxPick(false);
await drill([-7, 2, 2, -4, 2]);
await clickBtn("홈으로", 900).catch(() => {});
log("L4 완료");

/* ================= L5 동류항 ================= */
await openLesson("동류항");
log(`L5: ${await h1()}`);
await waitBtn("합쳐", 2400);
await hookChoice();
await clickCTA();
// likeTerms: 탭-탭 병합
await page.waitForSelector(".tm-chip", { timeout: 9000 });
await W(900);
const mergePair = async (aTxt, bTxt) => {
  await tapEl(".tm-chip", aTxt);
  await W(260);
  await tapEl(".tm-chip", bTxt);
  await W(1000);
};
await mergePair("3x", "2x");
await mergePair("+10", "−8");
await W(1800); // 스테이지 전환
await mergePair("4x", "−x");
await mergePair("7y", "2y");
await W(1800);
await waitBtn("더는 못 합쳐요", 900);
await W(600);
await shot("math2-l5-terms");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([1, 4, 12, 9, -3, -4]);
await clickBtn("홈으로", 900).catch(() => {});
log("L5 완료");

/* ================= L6 등식·방정식 ================= */
await openLesson("방정식");
log(`L6: ${await h1()}`);
await waitBtn("얼룩", 1200);
await hookChoice();
await clickCTA();
// eqTruth: 4행 탭 ×2단계
await page.waitForSelector(".pt-row", { timeout: 9000 });
// 애니메이션 잠금에 탭이 먹히므로 "미판정 행 재탭" 루프로
const tapRowsAll = async () => {
  for (let k = 0; k < 10; k++) {
    const pending = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".pt-row")].filter((r) => r.offsetParent);
      const i = rows.findIndex((r) => !/참|거짓/.test(r.textContent));
      if (i < 0) return false;
      const r = rows[i];
      const o = { bubbles: true, pointerId: 33, isPrimary: true };
      r.dispatchEvent(new PointerEvent("pointerdown", o));
      r.dispatchEvent(new PointerEvent("pointerup", o));
      r.click?.();
      return true;
    });
    if (!pending) break;
    await W(1900);
  }
};
await tapRowsAll();
await W(2600); // 2단계 전환
await tapRowsAll();
await W(1200);
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await multiQuiz([0, 1]);
await drill([4, 3, 2, 2000, 4]);
await clickBtn("홈으로", 900).catch(() => {});
log("L6 완료");

/* ================= L7 등식의 성질 ================= */
await openLesson("등식의 성질");
log(`L7: ${await h1()}`);
await waitBtn("왼쪽에만", 2600);
await hookChoice();
await clickCTA();
// balanceLab: 실험(3종+기울기) → M1 빼기×3 → M2 3등분
await page.waitForSelector(".ct-actions button", { timeout: 9000 });
await waitBtn("양쪽 \\+1", 900);
await clickBtn("양쪽 −1", 900);
await clickBtn("양쪽 ×2", 900);
await clickBtn("왼쪽만 \\+1", 2100);
await W(2400); // 법칙 발견 → M1 전환
await waitBtn("구슬 1개씩 빼기", 900);
await clickBtn("구슬 1개씩 빼기", 900);
await clickBtn("구슬 1개씩 빼기", 1400);
await W(2600); // x=5 공개 → M2 전환
await waitBtn("3등분", 1400);
await W(1200);
await shot("math2-l7-balance");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([14, 6, 48, "-4/3", "5/2"]);
await clickBtn("홈으로", 900).catch(() => {});
log("L7 완료");

/* ================= L8 이항 ================= */
await openLesson("이항");
log(`L8: ${await h1()}`);
await waitBtn("건너", 2400);
await hookChoice();
await clickCTA();
// solveLab: 탭-탭 이항
await page.waitForSelector(".tm-chip", { timeout: 9000 });
await W(700);
const boardTap = async (side) => {
  await page.evaluate((side) => {
    const b = document.querySelector(".mboard");
    const r = b.getBoundingClientRect();
    const x = r.x + r.width * (side === "R" ? 0.78 : 0.22);
    const y = r.y + 16;
    const o = { bubbles: true, pointerId: 35, isPrimary: true, clientX: x, clientY: y };
    b.dispatchEvent(new PointerEvent("pointerdown", o));
  }, side);
  await W(900);
};
// M1: x+7=10 — 7을 우변으로
await tapEl(".tm-chip", "7");
await boardTap("R");
await W(2600); // x=3 → M2
// M2: 5x-4=3x+8 — 3x 좌변, -4 우변, ÷2
await tapEl(".tm-chip", "3x");
await boardTap("L");
await W(1000);
await tapEl(".tm-chip", "−4");
await boardTap("R");
await W(1000);
await waitBtn("양변 ÷", 1200);
await W(2600); // x=6 → M3
// M3: 4x+2=x+11 — x 좌변, 2 우변, ÷3
await tapEl(".tm-chip", "x");
await boardTap("L");
await W(1000);
await tapEl(".tm-chip", "2");
await boardTap("R");
await W(1000);
await waitBtn("양변 ÷", 1200);
await W(1000);
await shot("math2-l8-solve");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([-1, 1, -8, 2, -3, -2]);
await clickBtn("홈으로", 900).catch(() => {});
log("L8 완료");

/* ================= L9 활용·보스전 ================= */
await openLesson("활용");
log(`L9: ${await h1()}`);
await waitBtn("추격", 3200);
await hookChoice();
await clickCTA(); // concept
await clickCTA(); // recap(총정리)
await page.evaluate(() => document.querySelector(".rc-card.has-more")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await W(400);
await shot("math2-l9-recap");
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await multiQuiz([0, 1, 4]);
await drill([21, 5, 2, 3, 21, 10, 36, 2]);
await W(400);
await clickBtn("홈으로", 900).catch(() => {});
log("L9 완료");

await W(900);
await shot("math2-home-done");
const doneCount = await page.evaluate(() => document.querySelectorAll(".gm-node.done").length);
console.log(`=== 완료 노드: ${doneCount}/9 · 페이지 에러: ${pageErrors} ===`);
await browser.close();
if (pageErrors > 0 || doneCount < 9) process.exit(1);
console.log("E2E PASS");
