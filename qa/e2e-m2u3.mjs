// 중2 수학 Ⅲ 일차함수, 10레슨 전 스텝 실플레이 E2E.
// PORT=<포트> node qa/e2e-m2u3.mjs  (기본 5199)
// 규칙: 랩 애니 잠금 대비 "미완료 대상 재시도 루프"(untilChip), 실행 중 src 편집 금지,
// 드릴 종료 후는 CTA가 아니라 완료 화면 "홈으로" 버튼, 보기 클릭은 data-oi(저작 인덱스).
// 조작 좌표는 매번 getBoundingClientRect로 재계산(고정 좌표 캐시 금지, e2e-math5 실사고).
// e2e-m2u2.mjs 문법 계승.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const done = { done: true, acc: 100, bestXp: 10 };
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 0,
    lessons: {
      // 중2 수학 Ⅰ·Ⅱ 완료 시딩(Ⅲ 단원 탭 진입·순차 해금 전제)
      m2u1l1: done, m2u1l2: done, m2u1l3: done, m2u1l4: done, m2u1l5: done,
      m2u1l6: done, m2u1l7: done, m2u1l8: done, m2u1l9: done, m2u1l10: done,
      m2u2l1: done, m2u2l2: done, m2u2l3: done, m2u2l4: done, m2u2l5: done,
      m2u2l6: done, m2u2l7: done, m2u2l8: done, m2u2l9: done,
    },
    minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".step .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 34));
const clickCTA = async (timeout = 26000) => {
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
const waitBtn = async (re, wait = 420, timeout = 22000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice, .hook-choices .hook-choice", { timeout: 18000 });
  await page.evaluate(() => document.querySelector(".hook-choices .hook-choice").click());
  await W(420);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(240);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
// 보기 클릭은 저작 인덱스(data-oi) 기준, 표시 셔플(quiz.ts) 무관. dev 전용 키.
const pickOpt = (i) => page.evaluate((i) => {
  const byKey = document.querySelector(`.opts .opt[data-oi="${i}"]`);
  (byKey ?? document.querySelectorAll(".opts .opt")[i]).click();
}, i);
const quiz = async (i) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await pickOpt(i);
  await W(220); await clickCTA(); await sheetContinue();
};
const multiPick = async (idxs) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  for (const i of idxs) { await pickOpt(i); await W(180); }
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
  await page.waitForFunction(
    (label) => [...document.querySelectorAll(".mnp-k")].some((x) => x.textContent.trim() === label && !x.disabled && x.offsetParent),
    label,
    { timeout: 6000 },
  );
  await page.evaluate((label) => {
    [...document.querySelectorAll(".mnp-k")].find((x) => x.textContent.trim() === label && !x.disabled && x.offsetParent).click();
  }, label);
  await W(70);
};
const typeAns = async (ans) => {
  let s = String(ans);
  let neg = false;
  if (s.startsWith("-")) { neg = true; s = s.slice(1); }
  if (s.includes("/")) {
    const [n, d] = s.split("/");
    for (const ch of n) await npKey(ch);
    await npKey("↓ 분모");
    for (const ch of d) await npKey(ch);
  } else {
    for (const ch of s) {
      if (ch === ".") await npKey("·");
      else await npKey(ch);
    }
  }
  if (neg) await npKey("+/−");
};
const drill = async (answers) => {
  await page.waitForSelector(".mdr-q", { timeout: 9000 });
  for (const a of answers) {
    await typeAns(a);
    await clickCTA();
    await W(1050);
    await page.evaluate(() => {
      const b = document.querySelector("button.cta");
      if (b && !b.disabled && /계속하기/.test(b.textContent)) b.click();
    });
    await W(250);
  }
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
const chipOn = (id) => page.evaluate((id) => document.querySelector(`[data-g="${id}"]`)?.classList.contains("on") ?? false, id);
const untilChip = async (id, fn, tries = 8, label = "") => {
  for (let t = 0; t < tries; t++) {
    if (await chipOn(id)) return;
    await fn(t);
    await W(650);
  }
  if (!(await chipOn(id))) throw new Error(`untilChip 실패: ${id} ${label} @ ${await h1()}`);
};
const homeFromDone = async () => {
  await waitBtn("홈으로", 900, 30000);
};
const log = (m) => console.log("  ·", m);

const tapIf = async (sel, wait = 420) => {
  const t = await page.evaluate((sel) => {
    const e = [...document.querySelectorAll(sel)].find((x) => x.offsetParent);
    if (!e) return false;
    e.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 31, isPrimary: true }));
    e.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 31, isPrimary: true }));
    if (e instanceof HTMLElement) e.click();
    return true;
  }, sel);
  if (t) await W(wait);
  return t;
};
const ariaBtnIf = async (re, wait = 400) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].find(
      (x) => x.offsetParent && !x.disabled && new RegExp(re).test(x.getAttribute("aria-label") ?? ""),
    );
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (t) await W(wait);
  return t;
};

/* 좌표평면(planeSpec min=-5 max=5 size=340) 격자점 탭 — rect는 매번 재계산 */
const planeTap = async (vx, vy, wait = 650, min = -5, max = 5) => {
  await page.evaluate(([vx, vy, min, max]) => {
    const svg = document.querySelector(".screen.active .mcl-plane svg");
    if (!svg) return;
    const size = 340, pad = 18, unit = (size - pad * 2) / (max - min);
    const r = svg.getBoundingClientRect();
    const cx = r.left + ((pad + (vx - min) * unit) / size) * r.width;
    const cy = r.top + ((size - pad - (vy - min) * unit) / size) * r.height;
    const o = { bubbles: true, pointerId: 35, isPrimary: true, clientX: cx, clientY: cy };
    svg.dispatchEvent(new PointerEvent("pointerdown", o));
    svg.dispatchEvent(new PointerEvent("pointerup", o));
  }, [vx, vy, min, max]);
  await W(wait);
};
/* 좌표평면 드래그: (x1,y1) → (x2,y2) */
const planeDrag = async (x1, y1, x2, y2, wait = 700, min = -5, max = 5) => {
  await page.evaluate(async ([x1, y1, x2, y2, min, max]) => {
    const svg = document.querySelector(".screen.active .mcl-plane svg");
    if (!svg) return;
    const size = 340, pad = 18, unit = (size - pad * 2) / (max - min);
    const r = svg.getBoundingClientRect();
    const px = (v) => r.left + ((pad + (v - min) * unit) / size) * r.width;
    const py = (v) => r.top + ((size - pad - (v - min) * unit) / size) * r.height;
    const fire = (t, x, y) => svg.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 36, isPrimary: true, clientX: x, clientY: y }));
    fire("pointerdown", px(x1), py(y1));
    for (let i = 1; i <= 6; i++) {
      fire("pointermove", px(x1 + ((x2 - x1) * i) / 6), py(y1 + ((y2 - y1) * i) / 6));
      await new Promise((res) => setTimeout(res, 40));
    }
    fire("pointerup", px(x2), py(y2));
  }, [x1, y1, x2, y2, min, max]);
  await W(wait);
};
/* mq6 판단 질문: 정규식에 맞는 선택지(없으면 첫 번째) 탭 */
const mq6 = async (re = ".", wait = 2100) => {
  await page.waitForSelector(".mq6-choice", { timeout: 12000 });
  await page.evaluate((re) => {
    const list = [...document.querySelectorAll(".mq6-choice")].filter((b) => b.offsetParent && !b.disabled);
    (list.find((b) => new RegExp(re).test(b.textContent)) ?? list[0])?.click();
  }, re);
  await W(wait);
};

/* ══════════ 랩 드라이버 ══════════ */

const LAB = {
  /* funcLab: 기계 3대 — 칩 전부 투입 → 판정(정답 선택) 반복 */
  async funcLab() {
    await page.waitForSelector(".fnl-chip", { timeout: 9000 });
    const goodRe = ["하나씩 딱", "여러 개가 나오는", "오직 하나예요"];
    const goals = ["plus", "divisor", "constant"];
    for (let m = 0; m < 3; m++) {
      await untilChip(goals[m], async () => {
        await tapIf(".fnl-chip:not(.used):not([disabled])", 850);
        if (await page.$(".mq6-choice")) await mq6(goodRe[m]);
      }, 12, "funcLab");
      await W(600);
    }
    await shot("m2u3-lab"); // 목표 칩 3/3 점등 증거
    await clickCTA();
  },

  /* shiftGraphLab: 위로 3 드래그 → 아래로 5(b=3→−2) → 모양 판정 */
  async shiftGraphLab() {
    await page.waitForSelector(".sgl-eq", { timeout: 9000 });
    await untilChip("up", () => planeDrag(0, 0, 0, 3, 800, -6, 6), 4, "sgl-up");
    await untilChip("down", () => planeDrag(0, 0, 0, -5, 800, -6, 6), 4, "sgl-down");
    await untilChip("shape", () => mq6("그대로예요"), 4, "sgl-shape");
    await clickCTA();
  },

  /* interceptLab: (2,0)·(0,−4) 절편 탭 → (−3,0)·(0,2) 그리기 → 원점 판정 */
  async interceptLab() {
    await page.waitForSelector(".icl-q", { timeout: 9000 });
    await untilChip("read", async () => {
      await planeTap(2, 0, 600);
      await planeTap(0, -4, 1600);
    }, 6, "icl-read");
    await untilChip("draw", async () => {
      await planeTap(-3, 0, 500);
      await planeTap(0, 2, 1700);
    }, 6, "icl-draw");
    // 선택 → 스핀 연출(+1300) → 칩 점등(+2400)까지 3.7초 체인이라 대기를 넉넉히
    await untilChip("origin", () => mq6("못 그려요", 4600), 5, "icl-origin");
    await clickCTA();
  },

  /* slopeLab: B 핸들 (1,1)→(3,5) 넓히기 → 직선 교체 → (1,1)→(3,-1) 음수 측정 → 계수 판정 */
  async slopeLab() {
    await page.waitForSelector(".spl-ratio", { timeout: 9000 });
    await untilChip("wide", () => planeDrag(1, 1, 3, 5, 800), 5, "spl-wide");
    await waitBtn("내려가는 직선으로", 700);
    await untilChip("neg", () => planeDrag(1, 1, 3, -1, 800), 5, "spl-neg");
    await untilChip("coeff", () => mq6("계수"), 5, "spl-coeff");
    await clickCTA();
  },

  /* lineFamilyLab: a를 −3까지(방향+절벽) → 평행 미션(a=2) */
  async lineFamilyLab() {
    await page.waitForSelector(".lfm-ctl", { timeout: 9000 });
    await untilChip("dir", async () => { for (let i = 0; i < 8; i++) await ariaBtnIf("a 줄이기", 120); }, 3, "lfm-dir");
    await untilChip("steep", async () => { await ariaBtnIf("a 줄이기", 200); }, 4, "lfm-steep");
    await W(1400); // 평행 미션 등장
    await untilChip("par", async () => { for (let i = 0; i < 10; i++) await ariaBtnIf("a 키우기", 120); }, 3, "lfm-par");
    await clickCTA();
  },

  /* lineBuildLab: 사건1(a=2,b=1) → 기울기 판정(−2) → 사건2(a=−2,b=2) */
  async lineBuildLab() {
    await page.waitForSelector(".lbd-clue", { timeout: 9000 });
    await untilChip("case1", async () => {
      for (let i = 0; i < 2; i++) await ariaBtnIf("a 키우기", 140);
      await ariaBtnIf("b 키우기", 300);
    }, 4, "lbd-case1");
    await W(1900); // 사건 2 전환
    await untilChip("read", () => mq6("^−2$|^-2$", 2300), 6, "lbd-read");
    await untilChip("case2", async () => {
      for (let i = 0; i < 5; i++) await ariaBtnIf("a 줄이기", 140);
      for (let i = 0; i < 2; i++) await ariaBtnIf("b 키우기", 140);
      await W(300);
    }, 4, "lbd-case2");
    await clickCTA();
  },

  /* lineRevealLab: 해 3개 탭 → 수 전체 버튼 → 변신 대기 → x=2 점 3개 → 함수 판정 */
  async lineRevealLab() {
    await page.waitForSelector(".lrv-eq", { timeout: 9000 });
    await untilChip("sol", async () => {
      await planeTap(0, 3, 450);
      await planeTap(1, 2, 450);
      await planeTap(3, 0, 700);
    }, 5, "lrv-sol");
    await waitBtn("수 전체", 700);
    await page.waitForFunction(
      () => document.querySelector(`[data-g="line"]`)?.classList.contains("on"),
      { timeout: 15000 },
    );
    // morph(2.4s) 후 x=2 국면
    await page.waitForFunction(
      () => /x=2/.test(document.querySelector(".lrv-eq")?.textContent ?? ""),
      { timeout: 15000 },
    );
    await untilChip("vert", async () => {
      await planeTap(2, 1, 400);
      await planeTap(2, -2, 400);
      await planeTap(2, 4, 900);
      if (await page.$(".mq6-choice")) await mq6("함수가 아니에요", 2400);
    }, 6, "lrv-vert");
    // vert 칩은 판정 후 켜진다 — 위 루프에서 판정까지 처리
    await clickCTA();
  },

  /* meetLab: b−1로 과녁(2,1) → a=1로 평행 → b=−1로 일치 */
  async meetLab() {
    await page.waitForSelector(".mel-status", { timeout: 9000 });
    await untilChip("hit", () => ariaBtnIf("b 줄이기", 700), 4, "mel-hit");
    await untilChip("par", async () => { for (let i = 0; i < 3; i++) await ariaBtnIf("a 키우기", 200); }, 4, "mel-par");
    await untilChip("same", async () => { await ariaBtnIf("b 줄이기", 300); }, 6, "mel-same");
    await clickCTA();
  },
};

/* ══════════ 레슨 시나리오 ══════════ */

console.log("=== 중2 수학 Ⅲ 일차함수 E2E ===");

// Ⅲ 단원 탭으로 이동
await page.waitForSelector(".unit-tabs button, .unit-tab", { timeout: 12000 }).catch(() => {});
await page.evaluate(() => {
  const t = [...document.querySelectorAll("button")].find((b) => /III\./.test(b.textContent));
  t?.click();
});
await W(800);

/* L1 함수 */
{
  console.log("L1 함수");
  await openLesson("함수");
  await waitBtn("둘 다 눌러", 2500); await hookChoice();
  await shot("m2u3-hook"); // 예측 피드백까지 뜬 훅 장면
  await clickCTA();
  await LAB.funcLab(); log("funcLab 완료");
  await clickCTA(); // concept
  await tapIf(".rc-card", 700); // recap 자세히 펼침
  await shot("m2u3-recap");
  await clickCTA(); // recap → 문제
  await binSortAuto([
    ["연필", "함수다"], ["약수", "아니다"], ["배송비", "함수다"],
    ["절댓값", "아니다"], ["읽은 쪽수", "함수다"], ["몸무게", "아니다"],
  ]);
  await quiz(0);
  await oxPick(false);
  await shot("m2u3-figquiz");
  await quiz(0);
  await drill([7, -1, -5, -1, 9, 5]);
  await homeFromDone(); log("L1 완료");
}

/* L2 일차함수 */
{
  console.log("L2 일차함수");
  await openLesson("일차함수");
  await waitBtn("토핑 추가", 900); await clickBtn("토핑 추가", 900); await clickBtn("토핑 추가", 1100);
  await hookChoice(); await clickCTA();
  await clickCTA(); // concept
  await binSortAuto([
    ["3x", "일차함수$"], ["x²", "아님"], ["= −x$", "일차함수$"],
    ["6 ÷ x", "아님"], ["= 7", "아님"], ["3−x", "일차함수$"],
  ]);
  await clickCTA(); // recap
  await quiz(0);
  await oxPick(true);
  await drill([1, 2, 2, 1, 2, 2]);
  await homeFromDone(); log("L2 완료");
}

/* L3 평행이동 */
{
  console.log("L3 평행이동");
  await openLesson("평행이동");
  await waitBtn("동시에 출발", 2300); await hookChoice(); await clickCTA();
  await LAB.shiftGraphLab(); log("shiftGraphLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await oxPick(false);
  await binSortAuto([
    ["2x\\+5", "위로"], ["3x−1", "아래"], ["−x\\+7", "위로"],
    ["x−8", "아래"], ["−4x−2", "위로"],
  ]);
  await drill([3, -2, 3, 0, -2, 7]);
  await homeFromDone(); log("L3 완료");
}

/* L4 절편 */
{
  console.log("L4 절편");
  await openLesson("절편");
  await waitBtn("빨리 감기", 3100); await hookChoice(); await clickCTA();
  await LAB.interceptLab(); log("interceptLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await oxPick(true);
  await quiz(0);
  await orderAuto(["x절편 3", "y절편 6", "찍는다", "연결한다"]);
  await drill([3, 4, 7, -3, 3, 2]);
  await homeFromDone(); log("L4 완료");
}

/* L5 기울기 */
{
  console.log("L5 기울기");
  await openLesson("기울기");
  await waitBtn("공 굴리기", 2500); await hookChoice(); await clickCTA();
  await LAB.slopeLab(); log("slopeLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await quiz(0);
  await oxPick(true);
  await binSortAuto([
    ["3x−1", "양수"], ["−2x\\+5", "음수"], ["6 증가", "양수"],
    ["3 감소", "음수"], ["오른쪽 아래", "음수"], ["\\(0,1\\)", "양수"],
  ]);
  await drill([5, -3, 4, -2, 5, -1]);
  await homeFromDone(); log("L5 완료");
}

/* L6 성질 */
{
  console.log("L6 성질");
  await openLesson("성질");
  await waitBtn("넉 달 치", 2300); await hookChoice(); await clickCTA();
  await LAB.lineFamilyLab(); log("lineFamilyLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await multiPick([0, 1, 2]);
  await quiz(3); // 사분면(shuffle:false, 제4사분면)
  await quiz(0);
  await oxPick(false);
  await binSortAuto([
    ["5x−1", "가파름"], ["\\(1/4\\)x", "완만"], ["−6x\\+2", "가파름"],
    ["\\(1/3\\)x", "완만"], ["10x", "가파름"],
  ]);
  await drill([2, 1, 1, 3, 2, 9]);
  await homeFromDone(); log("L6 완료");
}

/* L7 식 구하기 */
{
  console.log("L7 식 구하기");
  await openLesson("식 구하기");
  await waitBtn("뼈 길이", 2800); await hookChoice(); await clickCTA();
  await LAB.lineBuildLab(); log("lineBuildLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await quiz(0);
  await orderAuto(["기울기 계산", "3x\\+b 로", "b=−4", "검산"]);
  await quiz(0);
  await drill([5, 3, 2, -2, -4, 3]);
  await homeFromDone(); log("L7 완료");
}

/* L8 활용 */
{
  console.log("L8 활용");
  await openLesson("활용");
  await waitBtn("빨리 감기", 2500); await hookChoice(); await clickCTA();
  await clickCTA(); // concept(4단계)
  await clickCTA(); // recap
  await orderAuto(["변수 정하기", "식 세우기", "답 구하기", "확인하기"]);
  await quiz(0);
  await quiz(0);
  await quiz(0);
  await drill([50, 180, 5, 20, 5, 24]);
  await homeFromDone(); log("L8 완료");
}

/* L9 일차함수와 일차방정식 */
{
  console.log("L9 직선의 방정식");
  await openLesson("직선의 방정식");
  await waitBtn("카드 뒤집기", 2600); await hookChoice(); await clickCTA();
  await LAB.lineRevealLab(); log("lineRevealLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await oxPick(true);
  await binSortAuto([
    ["2x\\+1", "함수인"], ["x=3", "아닌"], ["−5", "함수인"],
    ["y축", "아닌"], ["y=x$", "함수인"],
  ]);
  await multiPick([0, 1, 2]);
  await drill([-3, 6, 2, -2, 2, -3]);
  await homeFromDone(); log("L9 완료");
}

/* L10 그래프와 연립방정식 */
{
  console.log("L10 교점과 해");
  await openLesson("교점과 해");
  await waitBtn("추격 시작", 2600); await hookChoice(); await clickCTA();
  await LAB.meetLab(); log("meetLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await binSortAuto([
    ["2x−3", "없음"], ["y=x, y=−x", "1개"], ["6x−2y", "무수히"],
    ["y=x\\+1", "1개"], ["4x\\+2y", "없음"],
  ]);
  await quiz(0);
  await drill([1, 3, 3, 3, -3, 5]);
  await homeFromDone(); log("L10 완료");
}

await shot("m2u3-map-done");
console.log(pageErrors === 0 ? "=== E2E 전 레슨 통과, PAGEERROR 0 ===" : `=== 완료했지만 PAGEERROR ${pageErrors}건 ===`);
await browser.close();
