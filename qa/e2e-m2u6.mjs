// 중2 수학 Ⅵ 확률, 9레슨 전 스텝 실플레이 E2E.
// PORT=<포트> node qa/e2e-m2u6.mjs  (기본 5199)
// 규칙: 랩 애니 잠금 대비 재시도는 waitBtn/waitFunction으로, 실행 중 src 편집 금지,
// 드릴 종료 후는 완료 화면 "홈으로" 버튼, 보기 클릭은 data-oi(저작 인덱스).
// Ⅵ 랩은 전부 탭/버튼 구동(드래그 없음) — 조작은 aria-label과 mq6-choice 텍스트로 잡는다.
// e2e-m2u4.mjs 하니스 계승 + e2e-m2u1.mjs의 frac 넘패드 입력(↓ 분모).
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
      // 중2 수학 Ⅰ~Ⅳ 완료 시딩(Ⅵ 단원 진입 전제, Ⅴ는 준비 중 자리)
      m2u1l1: done, m2u1l2: done, m2u1l3: done, m2u1l4: done, m2u1l5: done,
      m2u1l6: done, m2u1l7: done, m2u1l8: done, m2u1l9: done, m2u1l10: done,
      m2u2l1: done, m2u2l2: done, m2u2l3: done, m2u2l4: done, m2u2l5: done,
      m2u2l6: done, m2u2l7: done, m2u2l8: done, m2u2l9: done,
      m2u3l1: done, m2u3l2: done, m2u3l3: done, m2u3l4: done, m2u3l5: done,
      m2u3l6: done, m2u3l7: done, m2u3l8: done, m2u3l9: done, m2u3l10: done,
      m2u4l1: done, m2u4l2: done, m2u4l3: done, m2u4l4: done, m2u4l5: done,
      m2u4l6: done, m2u4l7: done, m2u4l8: done, m2u4l9: done, m2u4l10: done,
    },
    minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".step .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 34));
const clickCTA = async (timeout = 30000) => {
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
const waitBtn = async (re, wait = 420, timeout = 26000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
/* aria-label 탭(관용형) — HTML 버튼과 SVG g[role=button] 모두 지원, 없으면 false(재시도 루프 짝) */
const tapAria = async (label, wait = 320) => {
  const ok = await page.evaluate((label) => {
    const els = [...document.querySelectorAll(`[aria-label="${label}"]`)];
    const el = els.find((e) => {
      if (e.tagName === "BUTTON") return e.offsetParent && !e.disabled;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (el) { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; }
    return false;
  }, label);
  await W(ok ? wait : 140);
  return ok;
};
/* mq6 판정 선택지 탭(관용형) — 텍스트 정규식, 없으면 false */
const tapMq = async (re, wait = 550) => {
  const ok = await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".mq6-choice")].find((x) => x.offsetParent && !x.disabled && new RegExp(re).test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  }, re);
  await W(ok ? wait : 140);
  return ok;
};
/* 랩 목표 칩 — 애니 잠금 대비 "미완료 대상 재시도 루프"(고정 횟수 탭 금지 규칙) */
const chipOn = (id) => page.evaluate((id) => document.querySelector(`[data-g="${id}"]`)?.classList.contains("on") ?? false, id);
const untilChip = async (id, fn, tries = 10, label = "") => {
  for (let t = 0; t < tries; t++) {
    if (await chipOn(id)) return;
    await fn(t);
    await W(800);
  }
  if (!(await chipOn(id))) throw new Error(`untilChip 실패: ${id} ${label} @ ${await h1()}`);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice, .hook-choices .hook-choice", { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".hook-choices .hook-choice").click());
  await W(420);
};
const hookPlay = async (shotName) => {
  for (let i = 0; i < 8; i++) {
    if (await page.$(".hook-choices .hook-choice")) break;
    const t = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".swapbtn")].find((x) => x.offsetParent && !x.disabled);
      if (b) { b.click(); return true; }
      return false;
    });
    await W(t ? 2400 : 900);
  }
  await hookChoice();
  if (shotName) await shot(shotName);
  await clickCTA();
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(240);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
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
const homeFromDone = async () => {
  await waitBtn("홈으로", 900, 30000);
};
const log = (m) => console.log("  ·", m);
const tapIf = async (sel, wait = 420) => {
  const t = await page.evaluate((sel) => {
    const x = document.querySelector(sel);
    if (x) { x.click(); return true; }
    return false;
  }, sel);
  await W(t ? wait : 60);
  return t;
};

/* ══════════ 랩 드라이버 — 전부 untilChip 재시도 루프(애니 잠금 내성) ══════════ */
const LAB = {
  /* caseLab: 6의 약수 수집(1,2,3,6) → 확인 → 5 이상(5,6) → 확인 → 판정 "3가지" */
  async caseLab() {
    await untilChip("ev1", async () => {
      for (const n of [1, 2, 3, 6]) await tapAria(`눈 ${n}`, 240);
      await tapAria("수집 확인", 800);
    }, 10, "caseLab-ev1");
    await untilChip("ev2", async () => {
      for (const n of [5, 6]) await tapAria(`눈 ${n}`, 240);
      await tapAria("수집 확인", 800);
    }, 10, "caseLab-ev2");
    await untilChip("judge", () => tapMq("^3가지"), 10, "caseLab-judge");
    await clickCTA();
  },
  /* orLab: 합치기(분식 성공) → 합치기(주사위 겹침) → 판정 "2가지" → 판정 "동시에" */
  async orLab() {
    await untilChip("plus", () => tapAria("합치기", 1200), 10, "orLab-plus");
    await untilChip("clash", async () => {
      await tapAria("합치기", 1200);
      await tapMq("^2가지");
    }, 10, "orLab-clash");
    await untilChip("rule", () => tapMq("동시에 일어나지 않을 때"), 10, "orLab-rule");
    await clickCTA();
  },
  /* treeLab: 모자→옷 가지 → 3×2 → 십의 자리 → 재사용 금지 → 일의 자리 → 0 함정 → 전부 뻗기 */
  async treeLab() {
    await untilChip("avatar", async () => {
      await tapAria("모자 가지 뻗기", 700);
      await tapAria("옷 가지 뻗기", 1500);
      await tapMq("3×2");
    }, 10, "treeLab-avatar");
    await untilChip("cards", async () => {
      await tapAria("십의 자리 가지 뻗기", 1000);
      await tapMq("다시 못 써요", 600);
      await tapAria("일의 자리 가지 뻗기", 1500);
    }, 10, "treeLab-cards");
    await untilChip("zero", async () => {
      await tapMq("맨 앞에 못 와요", 600);
      await tapAria("가지 전부 뻗기", 2200);
    }, 10, "treeLab-zero");
    await shot("m2u6-treelab");
    await clickCTA();
  },
  /* tossLab: 10번 → 100번 반복 → "0.5 근처" → "2가지 경우 중 1가지" */
  async tossLab() {
    await untilChip("warm", () => tapAria("10번 던지기", 1400), 10, "tossLab-warm");
    await untilChip("conv", async () => {
      await tapAria("100번 던지기", 1700);
      await tapMq("0\\.5 근처");
    }, 10, "tossLab-conv");
    await shot("m2u6-tosslab");
    await untilChip("why", () => tapMq("2가지 경우"), 10, "tossLab-why");
    await clickCTA();
  },
  /* probBarLab: 확률 계산 → 전부 초코 → 전부 딸기 → 판정 "1.5" */
  async probBarLab() {
    await untilChip("calc", () => tapAria("확률 계산", 1400), 10, "probBarLab-calc");
    await untilChip("zero", () => tapAria("전부 초코로", 1500), 10, "probBarLab-zero");
    await untilChip("fence", async () => {
      await tapAria("전부 딸기로", 1500);
      await tapMq("^1\\.5$");
    }, 10, "probBarLab-fence");
    await clickCTA();
  },
  /* notLab: 응모권 3장 → 나머지 보기 → 판정 "하나만 빼고" */
  async notLab() {
    await untilChip("win", async () => {
      for (const n of [1, 2, 3]) await tapAria(`응모권 ${n}`, 300);
    }, 10, "notLab-win");
    await untilChip("rest", () => tapAria("나머지 보기", 1400), 10, "notLab-rest");
    await untilChip("short", () => tapMq("하나만 빼고"), 10, "notLab-short");
    await clickCTA();
  },
  /* probAddLab: 당첨 칸 2·5·7 → 더하기 → 검문하기 → "1/4" → "동시에" */
  async probAddLab() {
    await untilChip("sum", async () => {
      for (const n of [2, 5, 7]) await tapAria(`칸 ${n}`, 750);
      await tapAria("확률 더하기", 1000);
    }, 10, "probAddLab-sum");
    await untilChip("check", async () => {
      await tapAria("검문하기", 1200);
      await tapAria("2/8", 800); // 판정 보기는 mfmt 분수 렌더라 텍스트 매칭 불가, aria-label로 집는다
    }, 10, "probAddLab-check");
    await untilChip("rule", () => tapMq("동시에 일어나지 않을 때"), 10, "probAddLab-rule");
    await clickCTA();
  },
  /* probMulLab: 가로 → 세로 → 가로 1/3 → "작아졌다" */
  async probMulLab() {
    await untilChip("h", () => tapAria("가로 칠하기", 1100), 10, "probMulLab-h");
    await untilChip("lap", () => tapAria("세로 칠하기", 1100), 10, "probMulLab-lap");
    await untilChip("mul", async () => {
      await tapAria("가로 1/3", 1300);
      await tapMq("작아졌");
    }, 10, "probMulLab-mul");
    await clickCTA();
  },
};

/* ══════════ 레슨 시나리오 ══════════ */

console.log("=== 중2 수학 Ⅵ 확률 E2E ===");

// Ⅵ 단원 탭으로 이동
await page.waitForSelector(".unit-tabs button, .unit-tab", { timeout: 12000 }).catch(() => {});
await page.evaluate(() => {
  const t = [...document.querySelectorAll("button")].find((b) => /VI\./.test(b.textContent));
  t?.click();
});
await W(800);

/* L1 사건과 경우의 수 */
{
  console.log("L1 사건·경우의 수");
  await openLesson("^사건·경우의 수");
  await hookPlay("m2u6-hook");
  await LAB.caseLab(); log("caseLab 완료");
  await clickCTA(); // concept
  await tapIf(".rc-card", 700); // recap 자세히 펼침
  await shot("m2u6-recap");
  await clickCTA(); // recap → 문제
  await quiz(0);
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await shot("m2u6-figquiz");
  await quiz(0);
  await binSortAuto([
    ["6 이상", "경우의 수 1"], ["5 이상", "경우의 수 2"], ["홀수", "경우의 수 3"],
    ["뒷면", "경우의 수 1"], ["4의 약수", "경우의 수 3"], ["2 이하", "경우의 수 2"],
  ]);
  await oxPick(true);
  await drill([4, 3, 6, 6, 2, 0]);
  await homeFromDone(); log("L1 완료");
}

/* L2 또는의 경우의 수 */
{
  console.log("L2 또는·더하기");
  await openLesson("^또는·더하기");
  await hookPlay();
  await LAB.orLab(); log("orLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await quiz(0);
  await binSortAuto([
    ["홀수 또는 짝수", "더한다"], ["3의 배수 또는 6", "안 됨"],
    ["2 이하 또는 5", "더한다"], ["짝수 또는 소수", "안 됨"],
  ]);
  await drill([10, 8, 4, 5, 5]);
  await homeFromDone(); log("L2 완료");
}

/* L3 동시의 경우의 수 */
{
  console.log("L3 동시·곱하기");
  await openLesson("^동시·곱하기");
  await hookPlay();
  await LAB.treeLab(); log("treeLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await orderAuto(["십의 자리 카드를", "일의 자리 카드를", "곱한다"]);
  await oxPick(false);
  await drill([8, 9, 4, 12, 12]);
  await homeFromDone(); log("L3 완료");
}

/* L4 확률 */
{
  console.log("L4 확률");
  await openLesson("^확률 —");
  await hookPlay();
  await LAB.tossLab(); log("tossLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await oxPick(false);
  await binSortAuto([
    ["동전 1개", "확률이 1/2"], ["짝수의 눈", "확률이 1/2"], ["6의 눈", "아님"],
    ["4지선다", "아님"], ["홀수", "확률이 1/2"],
  ]);
  await drill(["1/3", "1/5", "2/5", "1/18", "3/8"]);
  await homeFromDone(); log("L4 완료");
}

/* L5 확률의 성질 */
{
  console.log("L5 0과 1 사이");
  await openLesson("^0과 1 사이");
  await hookPlay();
  await LAB.probBarLab(); log("probBarLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(2); // ㄱㄴㄷ 라벨형 shuffle:false, 정답 ㄷ
  await multiPick([0, 1, 2]);
  await drill([1, 0, 0, 1, "5/6"]);
  await homeFromDone(); log("L5 완료");
}

/* L6 일어나지 않을 확률 */
{
  console.log("L6 안 일어날 확률");
  await openLesson("^안 일어날 확률");
  await hookPlay();
  await LAB.notLab(); log("notLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await oxPick(true);
  await binSortAuto([
    ["동전 3개", "뺀다"], ["짝수의 눈", "그대로"],
    ["적어도 하나 정답", "뺀다"], ["3의 배수", "그대로"],
  ]);
  await drill(["2/5", "19/20", 0.6, "3/4", "3/4"]);
  await homeFromDone(); log("L6 완료");
}

/* L7 확률의 덧셈 */
{
  console.log("L7 확률 덧셈");
  await openLesson("^확률 덧셈");
  await hookPlay();
  await LAB.probAddLab(); log("probAddLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await quiz(0);
  await orderAuto(["동시에 일어날 수 없는지", "각각 구한다", "더한다"]);
  await drill(["5/12", "1/2", "3/5", "5/36", "2/3"]);
  await homeFromDone(); log("L7 완료");
}

/* L8 확률의 곱셈 */
{
  console.log("L8 확률 곱셈");
  await openLesson("^확률 곱셈");
  await hookPlay();
  await LAB.probMulLab(); log("probMulLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await oxPick(false);
  await quiz(0);
  await drill(["1/6", "1/5", "1/2", "1/36", "16/25"]);
  await homeFromDone(); log("L8 완료");
}

/* L9 확률의 활용 */
{
  console.log("L9 확률 활용");
  await openLesson("^확률 활용");
  await hookPlay();
  await clickCTA(); // concept (랩 없음)
  await clickCTA(); // recap
  await quiz(0);
  await orderAuto(["무엇의 확률", "계산한다", "비교한다", "결정한다"]);
  await quiz(0);
  await oxPick(true);
  await drill([0.98, 0.02, 0.09, 0.02, 0.25]);
  await homeFromDone(); log("L9 완료");
}

await shot("m2u6-map-final");
console.log(pageErrors === 0 ? "=== 전 레슨 완주, 페이지 에러 0 ===" : `=== 완주했으나 페이지 에러 ${pageErrors}건 ===`);
await browser.close();
process.exit(pageErrors === 0 ? 0 : 1);
