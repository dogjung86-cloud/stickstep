// 중1 수학 Ⅲ 좌표평면과 그래프 — 9레슨 전 스텝 실플레이 E2E. node qa/e2e-math3.mjs (PORT 기본 5173)
// 훅 9장면·랩 8종(좌표 탭·사분면 드래그·물병 예측·드론 스크럽·링크·직선·나눠 갖기·곡선 드래그)·
// 넘패드 드릴·퀴즈 전 유형(binSort·pairMatch·order 포함).
// 규칙: 랩 애니 잠금 대비 "미완료 대상 재시도 루프"(고정 횟수 탭 금지), 실행 중 src 편집 금지.
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
  for (let i = 1; i <= 9; i++) lessons[`m1u2l${i}`] = { done: true, acc: 95, bestXp: 120 };
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 1800, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".step .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 34));
const clickCTA = async (timeout = 22000) => {
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
const waitBtn = async (re, wait = 420, timeout = 18000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 16000 });
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
  await page.evaluate((i) => document.querySelector(`.opts .opt[data-oi="${i}"]`).click(), i);
  await W(220); await clickCTA(); await sheetContinue();
};
const multiQuiz = async (idxs) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  for (const i of idxs) { await page.evaluate((i) => document.querySelector(`.opts .opt[data-oi="${i}"]`).click(), i); await W(160); }
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
const orderAuto = async (chipRes) => {
  await page.waitForSelector(".ord-chip", { timeout: 9000 });
  for (const re of chipRes) {
    await page.evaluate((re) => {
      const c = [...document.querySelectorAll(".ord-chip")].find((x) => new RegExp(re).test(x.textContent));
      c?.click();
    }, re);
    await W(240);
  }
  await clickCTA(); await sheetContinue();
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
const drill = async (answers) => {
  await page.waitForSelector(".mdr-q", { timeout: 9000 });
  for (const a of answers) { await typeAns(a); await clickCTA(); await W(1050); }
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

/* ── 좌표평면 조작(랩 공용): 스테이지 svg에 (x, y) 지점 pointer 이벤트 ── */
const planePoint = async (sel, x, y, range, kinds = ["pointerdown", "pointerup"]) => {
  await page.evaluate(([sel, x, y, range, kinds]) => {
    const svg = document.querySelector(sel);
    const r = svg.getBoundingClientRect();
    const size = 340, pad = 18, unit = (size - pad * 2) / (range * 2);
    const cx = r.left + ((pad + (x + range) * unit) / size) * r.width;
    const cy = r.top + ((size - pad - (y + range) * unit) / size) * r.height;
    const o = { bubbles: true, pointerId: 21, isPrimary: true, clientX: cx, clientY: cy };
    for (const k of kinds) svg.dispatchEvent(new PointerEvent(k, o));
  }, [sel, x, y, range, kinds]);
};
/** 미완료 재시도 루프: 카드 텍스트가 바뀔 때까지 탭을 반복(애니 잠금 안전). */
const plotUntil = async (x, y, range) => {
  for (let t = 0; t < 10; t++) {
    const before = await page.evaluate(() => document.querySelector(".mcl-q")?.textContent ?? "");
    await planePoint(".mcl-plane svg", x, y, range);
    await W(600);
    const after = await page.evaluate(() => document.querySelector(".mcl-q")?.textContent ?? "");
    if (after !== before) return;
  }
  throw new Error(`plotUntil 실패: (${x}, ${y}) @ ${await h1()}`);
};

const log = (m) => console.log("  ·", m);
console.log("=== 중1 수학 Ⅲ e2e 시작 ===");

// 홈: Ⅲ 단원 탭으로
await page.waitForSelector(".unit-tab", { timeout: 9000 });
await clickBtn("III\\. 좌표평면과 그래프", 700);
await shot("math3-home");

/* ================= L1 순서쌍과 좌표 ================= */
await openLesson("순서쌍과 좌표");
log(`L1: ${await h1()}`);
await waitBtn("자리 찾기", 900);
await hookChoice();
await clickCTA(); // concept
await clickCTA(); // coordLab 진입
await page.waitForSelector(".mcl-opt", { timeout: 9000 });
await shot("math3-l1-hook-after");
await tapEl(".mcl-opt", "(3, 2)");
await W(1400);
await tapEl(".mcl-opt", "(−4, −2)");
await W(1500);
await plotUntil(4, 2, 5);
await plotUntil(2, 4, 5);
await W(1200);
await plotUntil(-3, 1, 5);
await plotUntil(0, -3, 5);
await W(1300);
await shot("math3-l1-coordlab");
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await quiz(0);
await drill([5, 8, 2, 0, 0, 0]);
await clickBtn("홈으로", 900).catch(() => {});
log("L1 완료");

/* ================= L2 사분면 ================= */
await openLesson("사분면");
log(`L2: ${await h1()}`);
await waitBtn("조난 신호 보내기", 900);
await hookChoice();
await clickCTA(); // quadLab
await page.waitForSelector(".mql-panel", { timeout: 9000 });
for (const [x, y, w] of [[3, 2, 800], [-3, 3, 800], [-2, -3, 800], [3, -4, 1400], [2, 0, 2800], [-3, -2, 1000]]) {
  await planePoint(".mcl-plane svg", x, y, 5);
  await W(w);
}
await shot("math3-l2-quadlab");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await binSortAuto([
  ["\\(4, 6\\)", "제1"], ["\\(−1, 5\\)", "제2"], ["\\(−2, −3\\)", "제3"],
  ["\\(2, −7\\)", "제4"], ["\\(−6, 1\\)", "제2"], ["\\(5, −1\\)", "제4"],
]);
await multiQuiz([0, 1]);
await quiz(0);
await drill([1, 2, 3, 4, 2, 0]);
await clickBtn("홈으로", 900).catch(() => {});
log("L2 완료");

/* ================= L3 그래프 ================= */
await openLesson("^그래프 —");
log(`L3: ${await h1()}`);
await waitBtn("통계 열어 보기", 1100);
await hookChoice();
await clickCTA(); // bottleLab
await page.waitForSelector(".bt-card", { timeout: 9000 });
for (const label of ["일정하게", "점점 빠르게", "점점 느리게"]) {
  await page.waitForFunction(
    (label) => [...document.querySelectorAll(".bt-card")].some((b) => b.offsetParent && !b.disabled && b.textContent.includes(label)),
    label,
    { timeout: 16000 },
  );
  await tapEl(".bt-card", null, label);
  await W(6200); // 붓기 64스텝 + 판정 + 다음 병 전환
}
await shot("math3-l3-bottle");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await pairMatchAuto([
  ["폭이 일정한", "일정하게"], ["위로 좁아지는", "점점 빠르게"], ["위로 넓어지는", "점점 느리게"], ["안 붓는", "수평"],
]);
await drill([12, 0, 18, 5, 40]);
await clickBtn("홈으로", 900).catch(() => {});
log("L3 완료");

/* ================= L4 그래프 해석 ================= */
await openLesson("그래프 해석");
log(`L4: ${await h1()}`);
await waitBtn("관람차 돌리기", 3400);
await hookChoice();
await clickCTA(); // droneLab
await page.waitForSelector(".dr-stage", { timeout: 9000 });
const droneScrub = async (t) => {
  await page.evaluate((t) => {
    const svg = document.querySelector(".dr-stage svg");
    const r = svg.getBoundingClientRect();
    const GX0 = 46, GX1 = 338;
    const cx = r.left + ((GX0 + (t / 18) * (GX1 - GX0)) / 360) * r.width;
    const cy = r.top + (180 / 260) * r.height;
    const o = { bubbles: true, pointerId: 22, isPrimary: true, clientX: cx, clientY: cy };
    svg.dispatchEvent(new PointerEvent("pointerdown", o));
    svg.dispatchEvent(new PointerEvent("pointerup", o));
  }, t);
  await W(700);
};
await droneScrub(12);
await droneScrub(5);
await droneScrub(18);
await shot("math3-l4-drone");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await quiz(0);
await drill([12, 10, 3, 4, 9]);
await clickBtn("홈으로", 900).catch(() => {});
log("L4 완료");

/* ================= L5 정비례 ================= */
await openLesson("^정비례 —");
log(`L5: ${await h1()}`);
await waitBtn("번개 기다리기", 600);
await hookChoice();
await clickCTA(); // linkLab
await page.waitForSelector(".lk-grid", { timeout: 9000 });
for (let i = 0; i < 6; i++) { await waitBtn("귤 추가", 420); }
await waitBtn("×2 링크 \\(1개", 1300);
await waitBtn("×3 링크", 2200);
await waitBtn("×2 링크 \\(1주", 1400);
await clickBtn("정비례가 아니다", 900);
await shot("math3-l5-link");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await multiQuiz([0, 1]);
await quiz(0);
await oxPick(false);
await quiz(0);
await drill([24, 5, -4, 1360, "2/3", -5]);
await clickBtn("홈으로", 900).catch(() => {});
log("L5 완료");

/* ================= L6 정비례 그래프 ================= */
await openLesson("정비례 그래프");
log(`L6: ${await h1()}`);
await waitBtn("받은 용량 기록하기", 2600);
await hookChoice();
await clickCTA(); // lineLab
await page.waitForSelector(".mcl-plane", { timeout: 9000 });
for (const [x, y] of [[-3, -6], [-2, -4], [-1, -2], [0, 0], [1, 2], [2, 4], [3, 6]]) {
  await plotUntil(x, y, 6);
}
await waitBtn("간격을 반으로", 1700);
await waitBtn("간격을 반으로", 2600);
await waitBtn("수 전체로", 1800);
for (let i = 0; i < 10; i++) { await clickBtn("^−$", 160); }
await W(900);
await shot("math3-l6-line");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([6, 6, 3, "-1/2", 6, 4]);
await clickBtn("홈으로", 900).catch(() => {});
log("L6 완료");

/* ================= L7 반비례 ================= */
await openLesson("^반비례 —");
log(`L7: ${await h1()}`);
await waitBtn("친구 들이기", 2200);
await hookChoice();
await clickCTA(); // shareLab
await page.waitForSelector(".sh-table", { timeout: 9000 });
for (let i = 0; i < 5; i++) { await clickBtn("^\\+$", 420); }
await W(3400);
await waitBtn("곱 검사", 2500);
await clickBtn("반비례가 아니다", 900);
await shot("math3-l7-share");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await binSortAuto([
  ["y=3x", "정비례"], ["y=200/x", "반비례"], ["y=x/5", "정비례"],
  ["xy=60", "반비례"], ["y=−7x", "정비례"], ["y=−12/x", "반비례"],
]);
await quiz(0);
await oxPick(false);
await quiz(0);
await drill([12, 8, -12, 4, 40, -4]);
await clickBtn("홈으로", 900).catch(() => {});
log("L7 완료");

/* ================= L8 반비례 그래프 ================= */
await openLesson("반비례 그래프");
log(`L8: ${await h1()}`);
await waitBtn("자리 바꿔 앉기", 3400);
await hookChoice();
await clickCTA(); // curveLab
await page.waitForSelector(".cv-read", { timeout: 9000 });
const curveEvt = async (kind, x, y, range = 8) => {
  await page.evaluate(([kind, x, y, range]) => {
    const svg = document.querySelector(".mcl-plane svg");
    const r = svg.getBoundingClientRect();
    const size = 340, pad = 18, unit = (size - pad * 2) / (range * 2);
    svg.dispatchEvent(new PointerEvent(kind, {
      bubbles: true, pointerId: 23, isPrimary: true,
      clientX: r.left + ((pad + (x + range) * unit) / size) * r.width,
      clientY: r.top + ((size - pad - (y + range) * unit) / size) * r.height,
    }));
  }, [kind, x, y, range]);
};
// 자취 스탬프는 70ms 스로틀이라 move 사이에 실제 지연이 필요하다
const curveDrag = async (pts) => {
  await curveEvt("pointerdown", pts[0][0], pts[0][1]);
  for (const [x, y] of pts) { await curveEvt("pointermove", x, y); await W(95); }
  await curveEvt("pointerup", pts[pts.length - 1][0], pts[pts.length - 1][1]);
  await W(500);
};
// 자취(느리게 왕복: 이벤트 간 간격을 시뮬레이션하기 위해 여러 번 나눠 드래그)
for (let k = 0; k < 4; k++) {
  const seg = [];
  const [from, to] = k % 2 === 0 ? [1, 8] : [8, 1];
  const step = (to - from) / 8;
  for (let i = 0; i <= 8; i++) { const x = from + step * i; seg.push([x, 8 / x]); }
  await curveDrag(seg);
  await W(400);
}
await waitBtn("a = −8", 800);
for (let k = 0; k < 3; k++) {
  const seg = [];
  for (let i = 0; i <= 8; i++) { const x = 1 + (7 / 8) * i; seg.push([x, -8 / x]); }
  await curveDrag(seg);
  await W(400);
}
await shot("math3-l8-curve");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([4, 2, -6, 3, 8, 9]);
await clickBtn("홈으로", 900).catch(() => {});
log("L8 완료");

/* ================= L9 보스전 ================= */
await openLesson("보스전");
log(`L9: ${await h1()}`);
await waitBtn("그날의 기록 재생", 2600);
await hookChoice();
await clickCTA(); // concept(지진)
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await multiQuiz([0, 1]);
await orderAuto(["변수", "관계식 꼴", "a 구하기", "답 구하기"]);
await shot("math3-l9-boss");
await drill([2, 0, -10, 6, 8, -20, 7, 14, 7, "-3/5"]);
await clickBtn("홈으로", 900).catch(() => {});
log("L9 완료");

await shot("math3-done");
console.log(pageErrors === 0 ? "=== Ⅲ e2e 전 레슨 통과, 페이지 에러 0 ===" : `=== 완료했지만 페이지 에러 ${pageErrors}건 ===`);
await browser.close();
